package kr.co.ap.flobankap.tcp.service;

import kr.co.ap.flobankap.dto.MemberDTO;
import kr.co.ap.flobankap.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberMapper memberMapper;

    public void saveMember(MemberDTO memberDTO) {
        memberMapper.insertMember(memberDTO);
    }

}
