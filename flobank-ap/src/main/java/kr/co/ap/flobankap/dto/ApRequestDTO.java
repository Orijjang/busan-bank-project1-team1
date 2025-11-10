package kr.co.ap.flobankap.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApRequestDTO {
    /**
     * 요청 구분 코드 (필수)
     * 예: "EXCHANGE_INQUIRY" (환율조회), "DEPOSIT_REQUEST" (입금)
     */
    private String requestCode;

    /**
     * 실제 요청 데이터 (JSON)
     * - 환율조회 시: {"currency": "USD"}
     * - 입금 시: {"account": "123-456", "amount": 10000}
     */
    private JsonNode payload;

    /**
     * 요청 타임스탬프 (로깅용)
     */
    private LocalDateTime requestTimestamp;
}
