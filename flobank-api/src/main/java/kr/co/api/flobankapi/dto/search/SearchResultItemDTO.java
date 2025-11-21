package kr.co.api.flobankapi.dto.search;


import lombok.Data;

@Data
public class SearchResultItemDTO {
    private String title;       // 결과 제목 (예: 플로뱅크 외화예금, 외화예금 상품)
    private String summary;     // 결과 요약 (예: 다양한 통화로 운용 가능, 메뉴 전체 경로)
    private String url;         // 클릭 시 이동할 최종 URL
    private String extra;       // 추가 정보 (예: 공지사항의 등록일자, null 허용)
}