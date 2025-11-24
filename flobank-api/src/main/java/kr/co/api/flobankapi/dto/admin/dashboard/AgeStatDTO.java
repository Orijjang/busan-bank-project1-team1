package kr.co.api.flobankapi.dto.admin.dashboard;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AgeStatDTO {
    //나이
    private String ageStats;
    private long count;
}
