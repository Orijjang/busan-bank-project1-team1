package kr.co.api.flobankapi.controller;

import kr.co.api.flobankapi.dto.search.SearchResultResponseDTO; // 경로 수정
import kr.co.api.flobankapi.dto.search.SearchLogDTO; // 경로 수정
import kr.co.api.flobankapi.dto.search.SearchKeywordDTO; // 경로 수정
import kr.co.api.flobankapi.dto.search.SearchTokenDTO;
import kr.co.api.flobankapi.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    private String getCustCodeFromSession() {
        // 현재는 예시를 위해 null (비로그인)을 반환
        // 실제 구현에서는 SecurityContextHolder, Session 또는 JWT 등에서 cust_code를 가져와야 함.
        // 테스트 용도로 "TEST0001" 등의 값을 반환하여 최근 검색어를 확인할 수도 있습니다.
        return null;
    }

    // ----------------------------------------------------------------------
    // 🔍 통합 및 탭별 검색 API
    // ----------------------------------------------------------------------

    /**
     * 🔍 통합 검색 미리보기 (전체 탭 요약 결과)
     * URL: GET /api/search/integrated?keyword=외화예금
     * @param keyword 검색어
     * @return 탭별 요약 결과를 담은 SearchResultResponseDTO
     */
    @GetMapping("/integrated")
    public SearchResultResponseDTO integratedSearch(@RequestParam String keyword) {

        if (keyword == null || keyword.trim().isEmpty()) {
            return new SearchResultResponseDTO();
        }

        String custCode = getCustCodeFromSession();

        // 1. 검색어 기록 (DB INSERT)
        searchService.recordSearch(keyword, custCode);

        // 2. 통합 검색 서비스 호출 (Elasticsearch Multi-Search)
        log.info("Integrated Search requested for keyword: '{}', custCode: {}", keyword, custCode);
        return searchService.integratedSearchPreview(keyword);
    }

    /**
     * 탭별 상세 검색 (더보기 클릭 시)
     * URL: GET /api/search/tab?keyword=외화예금&type=product&page=0
     * @param keyword 검색어
     * @param type 탭 종류 (product, faq, docs 등)
     * @param page 페이지 번호 (0부터 시작)
     * @return 해당 탭의 페이지네이션된 전체 결과를 담은 SearchResultResponseDTO
     */
    @GetMapping("/tab")
    public SearchResultResponseDTO tabSearch(
            @RequestParam String keyword,
            @RequestParam String type,
            @RequestParam(defaultValue = "0") int page) {

        if (keyword == null || keyword.trim().isEmpty() || type == null || type.trim().isEmpty()) {
            return new SearchResultResponseDTO();
        }

        log.info("Tab Search requested - Type: {}, Keyword: '{}', Page: {}", type, keyword, page);

        // 탭별 상세 검색 서비스 호출 (Pagination 적용)
        return searchService.tabSearch(keyword, type, page);
    }

    // ----------------------------------------------------------------------
    // 검색어 조회 API
    // ----------------------------------------------------------------------

    /**
     * 1. 사용자별 최근 검색어 조회
     * URL: GET /api/search/keywords/recent
     * @return 로그인한 사용자의 최근 검색어 목록 (search_no DESC 기준)
     */
    @GetMapping("/keywords/recent")
    public List<SearchLogDTO> getRecentKeywords() {
        String custCode = getCustCodeFromSession();
        log.info("Recent keywords requested for custCode: {}", custCode != null ? custCode : "ANONYMOUS");
        return searchService.getRecentSearchKeywords(custCode);
    }

    /**
     * 2. 전체 검색 기록 기준 인기 검색어 조회
     * URL: GET /api/search/keywords/popular
     * @return TB_SEARCH_TOKEN 전체를 COUNT하여 순위를 매긴 인기 검색어 목록
     */
    @GetMapping("/keywords/popular")
    public List<SearchTokenDTO> getPopularKeywords() {
        log.info("Popular keywords requested.");
        return searchService.getPopularSearchKeywords();
    }
}