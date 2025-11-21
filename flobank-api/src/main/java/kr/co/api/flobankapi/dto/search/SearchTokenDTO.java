package kr.co.api.flobankapi.dto.search;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class SearchTokenDTO {
    private Integer tokNo;
    private String tokTxt;
    private Integer tokCount; // 집계된 검색 횟수 필드 추가
    private LocalDateTime tokRegDt; // 집계 시점 (선택 사항이나 집계 관리 시 유용)

}
