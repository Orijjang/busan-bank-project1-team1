package kr.co.api.flobankapi.service;

import kr.co.api.flobankapi.dto.MemberDTO;
import kr.co.api.flobankapi.mapper.EventMapper;
import kr.co.api.flobankapi.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventMapper eventMapper;

    /** 1) 로그인 ID(cust_id) → cust_code 조회 */
    public String getCustCode(String custId) {
        return eventMapper.findCustCodeByCustId(custId);
    }

    /** 2) cust_code로 회원 정보 조회 */
    public MemberDTO getMemberInfo(String custCode) {
        return eventMapper.getMemberInfoByCustCode(custCode);
    }

    /** 3) 가입일 반환 */
    public LocalDate getJoinDate(String custCode) {

        MemberDTO member = getMemberInfo(custCode);
        if (member == null) {
            throw new RuntimeException("회원 정보 조회 실패: cust_code=" + custCode);
        }

        String regDt = member.getCustRegDt();
        if (regDt == null || regDt.isEmpty()) {
            throw new RuntimeException("가입일이 존재하지 않습니다: cust_code=" + custCode);
        }

        // MyBatis가 DATE → "yyyy-MM-dd"로 자동 변환해줌
        return LocalDate.parse(regDt, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }
}
