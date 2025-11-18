package kr.co.api.flobankapi.mapper;

import kr.co.api.flobankapi.dto.CustAcctDTO;
import kr.co.api.flobankapi.dto.CustFrgnAcctDTO;
import kr.co.api.flobankapi.dto.CustInfoDTO;
import org.apache.ibatis.annotations.Mapper;

import java.time.LocalDate;

@Mapper
public interface MypageMapper {
    // 원화 입출금 개설
    void insertAcct(CustAcctDTO custAcctDTO);

    // 외화 입출금 개설
    void insertFrgnAcct(CustFrgnAcctDTO custFrgnAcctDTO);

    // 외화 계좌 이미 있는지 확인
    int selectCheckCntEnAcct(String custCode);

    CustInfoDTO selectCustInfo(String custId);
    LocalDate selectCheckKoAcct(String custCode);
    int selectCheckCntKoAcct(String custCode);
}
