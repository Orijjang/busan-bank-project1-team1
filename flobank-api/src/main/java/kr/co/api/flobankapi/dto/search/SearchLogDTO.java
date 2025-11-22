package kr.co.api.flobankapi.dto.search;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SearchLogDTO {
    private String keyword;      // 검색어 (search_txt, tok_txt)
    private String date;         // 날짜 (화면 표시용)
    private Integer rank;        // 인기 순위
    private Integer count;       // 검색 횟수
}