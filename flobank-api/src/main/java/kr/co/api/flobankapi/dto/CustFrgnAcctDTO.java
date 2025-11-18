package kr.co.api.flobankapi.dto;

import lombok.Data;

@Data
public class CustFrgnAcctDTO {
    String frgnAcctNo;
    String frgnAcctPw;
    String frgnAcctRegDt;
    String frgnAcctStatus;
    String frgnAcctCustEngName;
    String frgnAcctCustCode;
    String frgnAcctFundSource;
    String frgnPurpose;
}
