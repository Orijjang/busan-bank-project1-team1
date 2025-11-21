package kr.co.api.flobankapi.dto.search;

import lombok.Data;

@Data
public class SearchKeywordDTO {
    private String searchTxt;
    private Long searchCount; // 집계된 검색 횟수
}
