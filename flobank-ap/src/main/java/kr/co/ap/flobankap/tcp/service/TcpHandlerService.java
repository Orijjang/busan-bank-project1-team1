// TCP 요청/응답 처리기
package kr.co.ap.flobankap.tcp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.ap.flobankap.dto.ApRequestDTO;
import kr.co.ap.flobankap.dto.ApResponseDTO;
import kr.co.ap.flobankap.service.RequestRouterService; // 1. 라우터 서비스
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime; // 응답 시간용

@Slf4j
@Service
@RequiredArgsConstructor
public class TcpHandlerService {

    private final ObjectMapper objectMapper; // JSON <-> DTO 변환기
    private final RequestRouterService requestRouterService; // 2. ExchangeService 대신 라우터만 주입받습니다.

    @ServiceActivator(inputChannel = "tcpRequestChannel")
    public byte[] handleTcpRequest(byte[] requestPayload) {

        String jsonRequest = "";
        ApResponseDTO responseDTO; // 3. 응답 DTO를 미리 선언

        try {
            // 1. (역직렬화) byte[] -> String -> ApRequestDTO
            jsonRequest = new String(requestPayload, StandardCharsets.UTF_8);
            log.info("[TCP RECV] : {}", jsonRequest); // 수신 로그

            ApRequestDTO requestDTO = objectMapper.readValue(jsonRequest, ApRequestDTO.class);

            // 2. (비즈니스 로직) -> 라우터에게 위임
            // TcpHandlerService는 이게 환전인지 입금인지 알 필요 없이 라우터에게 넘깁니다.
            responseDTO = requestRouterService.route(requestDTO); //

        } catch (Exception e) {
            // 4. (예외 처리) DTO 변환 실패 또는 라우팅 이전의 공통 에러
            log.error("[TCP ERROR](TcpHandlerService.java) : {}, Request: {}", e.getMessage(), jsonRequest);

            // 클라이언트가 무한정 기다리지 않도록 반드시 에러 응답을 보냅니다.
            // (DTO 파일이 비어있지만, 이전 답변의 표준 DTO 구조를 따른다고 가정)
            responseDTO = new ApResponseDTO("ERROR", "(TcpHandlerService.java) Invalid request format: " + e.getMessage(), null, LocalDateTime.now());
        }

        // 5. (직렬화) ApResponseDTO -> String -> byte[]
        try {
            String jsonResponse = objectMapper.writeValueAsString(responseDTO);
            log.info("[TCP SEND](TcpHandlerService.java) : {}", jsonResponse); // 발신 로그
            return jsonResponse.getBytes(StandardCharsets.UTF_8);
        } catch (Exception ex) {
            // 6. (치명적 에러) 응답 DTO 직렬화 실패 시 (최후의 보루)
            log.error("[TCP FATAL](TcpHandlerService.java) Failed to serialize response: {}", ex.getMessage());
            return "{\"status\":\"ERROR\",\"message\":\"Critical server error\"}".getBytes(StandardCharsets.UTF_8);
        }
    }
}