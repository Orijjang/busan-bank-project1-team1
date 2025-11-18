package kr.co.api.flobankapi.mapper;

import kr.co.api.flobankapi.dto.MemberDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EventMapper {

    /** 1) 로그인 ID(cust_id) → cust_code 조회 */
    String findCustCodeByCustId(@Param("custId") String custId);

    /** 2) cust_code → 회원 정보 조회 */
    MemberDTO getMemberInfoByCustCode(@Param("custCode") String custCode);

    /** 3) 오늘 출석 여부 확인 */
    int checkTodayAttendance(@Param("custCode") String custCode,
                             @Param("attendDate") String attendDate);

    /** 4) 출석 기록 저장 */
    int insertAttendance(@Param("custCode") String custCode,
                         @Param("attendDate") String attendDate);
}
