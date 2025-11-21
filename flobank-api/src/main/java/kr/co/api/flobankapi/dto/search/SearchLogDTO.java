package kr.co.api.flobankapi.dto.search;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SearchLogDTO {

    private Integer searchNo;
    private String searchTxt;
    private String searchCustCode;
    private LocalDateTime searchRegDt; // 검색 시점


}
