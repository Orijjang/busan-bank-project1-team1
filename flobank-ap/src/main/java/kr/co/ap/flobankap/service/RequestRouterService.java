package kr.co.ap.flobankap.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.ap.flobankap.dto.ApRequestDTO;
import kr.co.ap.flobankap.dto.ApResponseDTO;
// import kr.co.ap.flobankap.service.exchange.ExchangeService; // (ExchangeService를 나중에 만들 위치)
// import kr.co.ap.flobankap.service.deposit.DepositService;   // (DepositService를 나중에 만들 위치)
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class RequestRouterService {

    // (중요) 나중에 만들 실제 비즈니스 서비스들을 여기에 주입합니다.
    // private final ExchangeService exchangeService;
    // private final DepositService depositService;

    private final ObjectMapper objectMapper;

    /**
     * TcpHandlerService로부터 DTO를 받아 requestCode에 따라 분배
     */
    public ApResponseDTO route(ApRequestDTO request) {
        String requestCode = request.getRequestCode();
        JsonNode payload = request.getPayload();
        ApResponseDTO response = null; // 최종 응답 DTO

        log.debug("Routing request code: {}", requestCode);

        try {
            // switch문을 사용하여 요청 코드에 따라 분기
            switch (requestCode) {
                // --- 환전 관련 ---
                case "EXCHANGE_INQUIRY":
                    // 나중에 ExchangeService가 준비되면 이 주석을 풉니다.
                    // response = exchangeService.getExchangeRates(payload);
                    log.info("Exchange inquiry received (service not yet implemented)");
                    // 임시 응답 (테스트용)
                    response = new ApResponseDTO("SUCCESS", "OK (Test Response)", objectMapper.createObjectNode().put("rate", 1350.0), LocalDateTime.now());
                    break;

                case "EXCHANGE_PROCESS":
                    // response = exchangeService.processExchange(payload);
                    break;

                // --- 입금 관련 ---
                case "DEPOSIT_REQUEST":
                    // response = depositService.processDeposit(payload);
                    break;

                // --- 정의되지 않은 코드 ---
                default:
                    log.info("정의되지 않은 코드(RequestRouterService.java): {}", requestCode);
                    response = new ApResponseDTO("ERROR", "Unknown request code: " + requestCode, null, LocalDateTime.now());
            }
        } catch (Exception e) {
            log.info("Error(RequestRouterService.java) while processing request [{}]: {}", requestCode, e.getMessage(), e);
            response = new ApResponseDTO("ERROR", "Failed to process request: " + e.getMessage(), null, LocalDateTime.now());
        }

        return response;
    }
}