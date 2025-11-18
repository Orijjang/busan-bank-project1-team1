package kr.co.api.flobankapi.dto;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class InterestInfoDTO {
    private String interestCurrency;
    private String interestRate;
    private String interestMonth;
}
