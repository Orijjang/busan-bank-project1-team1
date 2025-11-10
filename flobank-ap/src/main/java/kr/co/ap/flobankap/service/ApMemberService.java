package kr.co.ap.flobankap.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule; // LocalDate 파싱용
import kr.co.ap.flobankap.dto.MemberDTO;
import kr.co.ap.flobankap.dto.ApResponseDTO;
import kr.co.ap.flobankap.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApMemberService {

    private final MemberMapper memberMapper;

    // ObjectMapper는 기본적으로 LocalDate를 파싱하지 못하므로, JavaTimeModule을 등록해야 합니다.
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    /**
     * [핵심] 회원가입 요청을 처리합니다. (custCode 생성 로직 제거)
     */
    @Transactional // DB에 INSERT가 있으므로 트랜잭션 처리
    public ApResponseDTO registerMember(JsonNode payload) {
        try {
            // 1. API 서버가 보낸 JsonNode(payload)를 AP 서버의 MemberDTO로 변환
            MemberDTO memberDTO = objectMapper.treeToValue(payload, MemberDTO.class);

            // 3. 서버에서 생성할 기본값 설정
            memberDTO.setCustRegDt(LocalDate.now()); // 가입일
            memberDTO.setCustStatus(1);              // 회원 상태 (1: 정상)

            // 4. DB에 INSERT
            // member.xml의 insertMember 쿼리에 CUST_CODE 컬럼이 없어야 합니다.
            int result = memberMapper.insertMember(memberDTO);
            if (result == 0) {
                throw new Exception("회원 정보 저장에 실패했습니다.");
            }

            // [수정] custId로 성공 로그 변경
            log.info("[회원가입 성공] 신규 아이디: {}", memberDTO.getCustId());

            // 5. 성공 응답 반환
            return new ApResponseDTO("SUCCESS", "회원가입이 완료되었습니다.", null, LocalDateTime.now());

        } catch (Exception e) {
            log.error("[회원가입 실패] Error: {}", e.getMessage(), e);

            // 아이디 중복(PK_TB_CUST_INFO) 예외 처리
            if (e.getMessage() != null && e.getMessage().contains("PK_TB_CUST_INFO")) {
                log.warn("[회원가입 실패] 아이디 중복: {}", payload.get("custId"));
                return new ApResponseDTO("ERROR", "이미 사용 중인 아이디입니다.", null, LocalDateTime.now());
            }

            return new ApResponseDTO("ERROR", "회원가입 처리 중 오류 발생: " + e.getMessage(), null, LocalDateTime.now());
        }
    }
}