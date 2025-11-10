package kr.co.ap.flobankap.mapper;

import kr.co.ap.flobankap.dto.MemberDTO;
import org.apache.ibatis.annotations.Mapper;

import java.time.LocalDate;

@Mapper
public interface MemberMapper {

    int insertMember(MemberDTO memberDTO);

    int getNextCustSequence();



}
