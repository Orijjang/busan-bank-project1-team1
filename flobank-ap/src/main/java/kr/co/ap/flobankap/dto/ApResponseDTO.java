package kr.co.ap.flobankap.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApResponseDTO {
    /**
     * 처리 상태 (필수)
     * 예: "SUCCESS" (성공), "ERROR" (실패)
     */
    private String status;

    /**
     * 처리 메시지
     * - 성공 시: "OK" 또는 null
     * - 실패 시: "Invalid account number" (구체적인 에러 메시지)
     */
    private String message;

    /**
     * 실제 응답 데이터 (JSON)
     * - 환율조회 성공 시: {"rate": 1350.50, "currency": "USD"}
     * - 실패 시: null
     */
    private JsonNode data;

    /**
     * 응답 타임스탬프 (로깅용)
     */
    private LocalDateTime responseTimestamp;
}
