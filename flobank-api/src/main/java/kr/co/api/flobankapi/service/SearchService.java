package kr.co.api.flobankapi.service;

import kr.co.api.flobankapi.mapper.SearchMapper;
import kr.co.api.flobankapi.document.*; // Elasticsearch Document 클래스들
import kr.co.api.flobankapi.dto.search.SearchLogDTO; // 경로: dto.search
// import kr.co.api.flobankapi.dto.search.SearchKeywordDTO; // 기존 사용 DTO (인기 검색어용 DTO로 대체)
import kr.co.api.flobankapi.dto.search.SearchTokenDTO; // 경로: dto.search (인기 검색어(TB_SEARCH_TOKEN) 매핑용)
import kr.co.api.flobankapi.dto.search.SearchResultItemDTO; // 경로: dto.search
import kr.co.api.flobankapi.dto.search.SearchResultResponseDTO; // 경로: dto.search
import kr.co.api.flobankapi.dto.search.SearchResultResponseDTO.SectionResultDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit; // 개별 히트
import org.springframework.data.elasticsearch.core.SearchHits; // 검색 결과 리스트
import org.springframework.data.elasticsearch.core.query.Query; // Multi-Search 쿼리 타입 대체
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SearchService {

    // 상세 탭 검색 시 한 페이지에 보여줄 개수
    private static final int PAGE_SIZE = 10;

    private final ElasticsearchOperations elasticsearchTemplate;
    private final SearchMapper searchMapper; // 필드 이름

    public SearchService(ElasticsearchOperations elasticsearchTemplate, SearchMapper searchMapper) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.searchMapper = searchMapper;
    }

    // ----------------------------------------------------------------------
    // 💾 검색어 기록 (MyBatis)
    // ----------------------------------------------------------------------

    /**
     * 사용자의 검색어를 DB에 기록합니다. (TB_SEARCH_LOG)
     */
    public void recordSearch(String keyword, String custCode) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            SearchLogDTO log = new SearchLogDTO();
            log.setSearchTxt(keyword.trim());
            log.setSearchCustCode(custCode != null ? custCode : "ANONYMOUS");

            // searchMapper 사용 확인
            searchMapper.insertSearchLog(log);
        }
    }

    // ----------------------------------------------------------------------
    // 📊 검색어 조회 로직
    // ----------------------------------------------------------------------

    /**
     * 1. 사용자별 최근 검색어 10개 조회 (MyBatis)
     */
    public List<SearchLogDTO> getRecentSearchKeywords(String custCode) {
        if (custCode == null || "ANONYMOUS".equals(custCode)) {
            return List.of();
        }
        // searchMapper 사용 확인
        return searchMapper.selectRecentSearches(custCode);
    }

    /**
     * 2. 전체 토큰 기록 (TB_SEARCH_TOKEN) 기준 인기 검색어 10개 조회 (MyBatis)
     * 반환 타입을 SearchTokenDTO로 변경함
     */
    public List<SearchTokenDTO> getPopularSearchKeywords() {
        // searchMapper 사용 확인
        return searchMapper.selectPopularSearches();
    }

    // ----------------------------------------------------------------------
    // 🔍 통합 검색 미리보기 (Multi-Search)
    // ----------------------------------------------------------------------

    /**
     * 통합 검색 미리보기 결과를 Multi-Search로 가져옵니다. (상위 4개)
     */
    public SearchResultResponseDTO integratedSearchPreview(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new SearchResultResponseDTO();
        }

        // MultiSearchQuery 대신 List<Query> 사용
        List<Query> multiQueries = new ArrayList<>();
        Map<String, Class<?>> indexMap = new HashMap<>();

        // 탭별 쿼리 정의 (순서가 매핑 순서)
        multiQueries.add(buildMultiQuery(keyword, 4, "dpstName^3", "dpstInfo", "dpstDescript"));
        indexMap.put("product", ProductDocument.class);

        multiQueries.add(buildMultiQuery(keyword, 4, "title^3", "path^2", "depth1", "depth2"));
        indexMap.put("menu", MenuDocument.class);

        multiQueries.add(buildMultiQuery(keyword, 4, "faqQuestion^3", "faqAnswer"));
        indexMap.put("faq", FaqDocument.class);

        multiQueries.add(buildMultiQuery(keyword, 4, "termTitle^3", "thistContent"));
        indexMap.put("docs", TermDocument.class);

        multiQueries.add(buildMultiQuery(keyword, 4, "boardTitle^3", "boardContent"));
        indexMap.put("notice", NoticeDocument.class);

        multiQueries.add(buildMultiQuery(keyword, 4, "boardTitle^3", "boardContent", "eventBenefit"));
        indexMap.put("event", EventDocument.class);

        // Multi-Search 실행 (List<Query>, List<Class>를 받음)
        List<Class<?>> documentClasses = new ArrayList<>(indexMap.values());
        List<SearchHits<?>> multiHitsList = elasticsearchTemplate.multiSearch(multiQueries, documentClasses);

        // 결과 파싱 및 Response DTO 구성
        SearchResultResponseDTO response = new SearchResultResponseDTO();
        response.setSections(new HashMap<>());
        long totalCount = 0;

        List<String> tabKeys = List.copyOf(indexMap.keySet());

        for (int i = 0; i < multiHitsList.size(); i++) {
            SearchHits<?> hits = multiHitsList.get(i);
            String tabKey = tabKeys.get(i);

            long sectionTotal = hits.getTotalHits();
            totalCount += sectionTotal;

            // SearchHit로 매핑을 위해 안전한 캐스팅 수행
            SectionResultDTO sectionResult = mapMultiHitsToSectionResult(
                    (List<SearchHit<Object>>) (List<?>) hits.getSearchHits(),
                    tabKey,
                    sectionTotal
            );

            response.getSections().put(tabKey, sectionResult);
        }

        response.setTotalCount(totalCount);
        return response;
    }

    // ----------------------------------------------------------------------
    // 📄 탭별 상세 검색 (Pagination)
    // ----------------------------------------------------------------------

    /**
     * 탭별 상세 검색 결과를 페이지네이션하여 가져옵니다. (더보기 클릭 시)
     */
    public SearchResultResponseDTO tabSearch(String keyword, String type, int page) {
        if (keyword == null || keyword.trim().isEmpty() || type == null || type.trim().isEmpty()) {
            return new SearchResultResponseDTO();
        }

        // 1. 페이지네이션 설정
        Pageable pageable = PageRequest.of(page, PAGE_SIZE);

        // 2. 탭 정보 가져오기 (문서 클래스, 필드)
        TabSearchInfo info = getTabSearchInfo(type);
        if (info == null) {
            log.warn("Invalid search type requested: {}", type);
            return new SearchResultResponseDTO();
        }

        // 3. Native 쿼리 생성
        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(q -> q.multiMatch(m -> m.query(keyword).fields(info.fields)))
                .withPageable(pageable) // 페이지네이션 적용
                .build();

        // 4. Elasticsearch 검색 실행 (단일 인덱스)
        SearchHits<?> searchHits = elasticsearchTemplate.search(nativeQuery, info.docClass);

        // 5. 결과 매핑 및 Response DTO 구성
        return mapTabHitsToResponseDTO(searchHits, type);
    }


    // ----------------------------------------------------------------------
    // 💡 유틸리티 클래스/메서드
    // ----------------------------------------------------------------------

    private static class TabSearchInfo {
        final Class<?> docClass;
        final List<String> fields;

        TabSearchInfo(Class<?> docClass, List<String> fields) {
            this.docClass = docClass;
            this.fields = fields;
        }
    }

    private TabSearchInfo getTabSearchInfo(String type) {
        return switch (type) {
            case "product" -> new TabSearchInfo(ProductDocument.class, List.of("dpstName^3", "dpstInfo", "dpstDescript"));
            case "menu" -> new TabSearchInfo(MenuDocument.class, List.of("title^3", "path^2", "depth1", "depth2"));
            case "faq" -> new TabSearchInfo(FaqDocument.class, List.of("faqQuestion^3", "faqAnswer"));
            case "docs" -> new TabSearchInfo(TermDocument.class, List.of("termTitle^3", "thistContent"));
            case "notice" -> new TabSearchInfo(NoticeDocument.class, List.of("boardTitle^3", "boardContent"));
            case "event" -> new TabSearchInfo(EventDocument.class, List.of("boardTitle^3", "boardContent", "eventBenefit"));
            default -> null;
        };
    }

    // MultiSearchHit 대신 SearchHit을 받도록 시그니처 변경
    private SectionResultDTO mapMultiHitsToSectionResult(
            List<SearchHit<Object>> hits, String tabKey, long sectionTotal
    ) {
        SectionResultDTO section = new SectionResultDTO();
        section.setTitle(getTabTitle(tabKey));
        section.setTotalCount((int) sectionTotal);

        List<SearchResultItemDTO> items = hits.stream()
                .map(SearchHit::getContent) // SearchHit::getContent로 변경
                .map(doc -> mapToSearchResultItem(doc, tabKey))
                .collect(Collectors.toList());

        section.setResults(items);
        return section;
    }

    private SearchResultResponseDTO mapTabHitsToResponseDTO(
            SearchHits<?> searchHits, String tabKey
    ) {
        SearchResultResponseDTO response = new SearchResultResponseDTO();
        response.setTotalCount(searchHits.getTotalHits());

        SectionResultDTO section = new SectionResultDTO();

        section.setTitle(getTabTitle(tabKey));
        section.setTotalCount((int) searchHits.getTotalHits());

        List<SearchResultItemDTO> items = searchHits.getSearchHits().stream()
                .map(hit -> mapToSearchResultItem(hit.getContent(), tabKey))
                .collect(Collectors.toList());

        section.setResults(items);

        response.setSections(Map.of(tabKey, section));

        return response;
    }

    // MultiSearchQuery 대신 Query를 반환하도록 시그니처 변경
    private Query buildMultiQuery(String keyword, int maxResults, String... fields) {
        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(q -> q.multiMatch(m -> m.query(keyword).fields(List.of(fields))))
                .withMaxResults(maxResults)
                .build();
        return nativeQuery; // Query 인터페이스를 구현한 NativeQuery 반환
    }

    private SearchResultItemDTO mapToSearchResultItem(Object doc, String tabKey) {
        SearchResultItemDTO item = new SearchResultItemDTO();
        DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("yyyy.MM.dd");

        // ... (탭별 매핑 로직) ...
        switch (tabKey) {
            case "product":
                ProductDocument prod = (ProductDocument) doc;
                item.setTitle(prod.getDpstName());
                item.setSummary(prod.getDpstInfo());
                item.setUrl("/flobank/deposit/view?dpstId=" + prod.getDpstId());
                break;
            case "menu":
                MenuDocument menu = (MenuDocument) doc;
                item.setTitle(menu.getTitle());
                item.setSummary(menu.getPath());
                item.setUrl(menu.getUrl());
                break;
            case "faq":
                FaqDocument faq = (FaqDocument) doc;
                item.setTitle(faq.getFaqQuestion());
                item.setSummary(faq.getFaqAnswer().substring(0, Math.min(faq.getFaqAnswer().length(), 50)) + "...");
                item.setUrl("/flobank/customer/faq_list");
                break;
            case "docs":
                TermDocument term = (TermDocument) doc;
                item.setTitle(term.getTermTitle() + " (v" + term.getThistVersion() + ")");
                item.setSummary(term.getThistContent().substring(0, Math.min(term.getThistContent().length(), 50)) + "...");
                item.setUrl("/customer/terms_download/" + term.getThistNo() + "/file");
                item.setExtra(term.getThistRegDy().format(dateFormat));
                break;
            case "notice":
                NoticeDocument notice = (NoticeDocument) doc;
                item.setTitle("[공지] " + notice.getBoardTitle());
                item.setSummary(notice.getBoardContent().substring(0, Math.min(notice.getBoardContent().length(), 50)) + "...");
                item.setUrl("/customer/notice_view/" + notice.getBoardNo());
                item.setExtra(notice.getBoardRegDt().format(dateFormat));
                break;
            case "event":
                EventDocument event = (EventDocument) doc;
                item.setTitle("[이벤트] " + event.getBoardTitle());
                item.setSummary(event.getBoardContent().substring(0, Math.min(event.getBoardContent().length(), 50)) + "...");
                item.setUrl("/customer/event_view/" + event.getBoardNo());
                item.setExtra(event.getBoardRegDt().format(dateFormat));
                break;
        }
        return item;
    }

    private String getTabTitle(String tabKey) {
        return switch (tabKey) {
            case "product" -> "상품";
            case "menu" -> "메뉴";
            case "faq" -> "FAQ";
            case "docs" -> "약관";
            case "notice" -> "공지사항";
            case "event" -> "이벤트";
            default -> tabKey;
        };
    }
}