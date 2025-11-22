package kr.co.api.flobankapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

//  자동 설정을 끕니다. (우리가 수동으로 할 거니까요)
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class FlobankApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(FlobankApiApplication.class, args);
    }
}