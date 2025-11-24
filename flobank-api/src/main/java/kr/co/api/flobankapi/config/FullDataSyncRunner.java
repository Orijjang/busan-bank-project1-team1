package kr.co.api.flobankapi.config;

import kr.co.api.flobankapi.document.*;
import kr.co.api.flobankapi.mapper.SearchDataMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


// 서버 시작 시 오라클 DB의 데이터를 조회하여 엘라스틱서치 인덱스로 저장하는 초기화 클래스

@Slf4j
@Component
@RequiredArgsConstructor
public class FullDataSyncRunner implements ApplicationRunner {

    private final SearchDataMapper searchDataMapper;
    private final ElasticsearchOperations elasticsearchOperations;

    @Override
    @Transactional(readOnly = true) // DB 조회 시 읽기 전용 트랜잭션 유지
    public void run(ApplicationArguments args) throws Exception {

        try {
            // 1. 상품 (TB_DPST_PROD_INFO)
            syncProducts();

            // 2. FAQ (TB_FAQ_HDR)
            syncFaqs();

            // 3. 약관 (TB_TERMS_MASTER + TB_TERMS_HIST)
            syncTerms();

            // 4. 공지사항 (TB_BOARD_HDR type=1)
            syncNotices();

            // 5. 이벤트 (TB_BOARD_HDR type=2)
            syncEvents();

            log.info("모든 데이터가 엘라스틱서치에 성공적으로 적재");

        } catch (Exception e) {
        }
    }

    // -----------------------------------------------------------------
    // 1. 상품 데이터 동기화
    // -----------------------------------------------------------------
    private void syncProducts() {
        List<ProductDocument> list = searchDataMapper.selectAllProducts();
        if (list != null && !list.isEmpty()) {
            elasticsearchOperations.save(list); // 대량 저장 (Bulk Insert)
        } else {
        }
    }

    // -----------------------------------------------------------------
    // 2. FAQ 데이터 동기화
    // -----------------------------------------------------------------
    private void syncFaqs() {
        List<FaqDocument> list = searchDataMapper.selectAllFaqs();
        if (list != null && !list.isEmpty()) {
            elasticsearchOperations.save(list);
        } else {
        }
    }

    // -----------------------------------------------------------------
    // 3. 약관 데이터 동기화 (제목 + 내용 JOIN)
    // -----------------------------------------------------------------
    private void syncTerms() {
        List<TermDocument> list = searchDataMapper.selectAllTerms();

        if (list != null && !list.isEmpty()) {
            for (TermDocument term : list) {
                if (term.getThistContent() == null) {
                    term.setThistContent(""); // 내용 없으면 빈 문자열
                }
                if (term.getTermTitle() == null) {
                    term.setTermTitle("제목 없음");
                }
            }

            elasticsearchOperations.save(list);
        } else {
        }
    }

    // -----------------------------------------------------------------
    // 4. 공지사항 데이터 동기화
    // -----------------------------------------------------------------
    private void syncNotices() {
        List<NoticeDocument> list = searchDataMapper.selectAllNotices();
        if (list != null && !list.isEmpty()) {

            list.forEach(notice -> {
                if (notice.getBoardContent() == null) notice.setBoardContent("");
            });

            elasticsearchOperations.save(list);
        } else {
        }
    }

    // -----------------------------------------------------------------
    // 5. 이벤트 데이터 동기화
    // -----------------------------------------------------------------
    private void syncEvents() {
        List<EventDocument> list = searchDataMapper.selectAllEvents();
        if (list != null && !list.isEmpty()) {

            list.forEach(event -> {
                if (event.getBoardContent() == null) event.setBoardContent("");
                if (event.getEventBenefit() == null) event.setEventBenefit("");
            });

            elasticsearchOperations.save(list);
        } else {
        }
    }
}
