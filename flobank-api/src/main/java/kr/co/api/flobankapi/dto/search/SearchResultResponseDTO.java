package kr.co.api.flobankapi.dto.search;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SearchResultResponseDTO {
    // 전체 검색된 도큐먼트 수 (HTML의 "총 2,309건"에 해당)
    private long totalCount;

    // 탭 키(product, faq 등)와 섹션 결과(SectionResultDTO)를 매핑하는 Map
    private Map<String, SectionResultDTO> sections;


    @Data
    public static class SectionResultDTO {
        private String title;       // 섹션 한글 제목 (예: 상품, 메뉴)
        private int totalCount;     // 해당 섹션의 검색된 총 건수
        private List<SearchResultItemDTO> results; // 미리보기 결과 (최대 4개)
    }
}
