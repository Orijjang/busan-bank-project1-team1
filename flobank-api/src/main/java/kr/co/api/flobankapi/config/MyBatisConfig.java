package kr.co.api.flobankapi.config;

import javax.sql.DataSource;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties; // 명시적인 속성 로드를 위해 추가
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import com.zaxxer.hikari.HikariDataSource;

/**
 * MyBatis Oracle DB 설정을 담당하는 Configuration 클래스입니다.
 * Elasticsearch 의존성 추가 후의 충돌을 해결하기 위해
 * Spring Boot의 DataSource 자동 설정을 강제로 비활성화하고,
 * 모든 MyBatis 관련 Bean에 @Primary 및 명시적 참조를 사용합니다.
 *
 * <p>수정 사항: DataSourceProperties를 사용하여 설정 파일의 DB 정보를 명시적으로 로드하고
 * HikariDataSource를 구성하여 'jdbcUrl is required' 오류를 근본적으로 해결합니다.</p>
 */
@Configuration
// DataSource 자동 설정을 명시적으로 제외
@EnableAutoConfiguration(exclude = {DataSourceAutoConfiguration.class})
@MapperScan(
        basePackages = "kr.co.api.flobankapi.mapper",
        sqlSessionFactoryRef = "sqlSessionFactory"
)
public class MyBatisConfig {

    // 1. DataSource Properties Bean 정의: 설정 파일의 'spring.datasource' 정보를 명시적으로 로드
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        // application.yml/properties의 spring.datasource.* 속성을 정확히 로드합니다.
        return new DataSourceProperties();
    }

    // 2. DataSource Bean 정의 및 @Primary 지정: 로드된 속성을 사용하여 Hikari DataSource 구성
    @Bean(name = "primaryDataSource")
    @Primary
    // HikariDataSource 자체의 추가 속성(예: pool size, timeout)이 있다면 로드합니다.
    @ConfigurationProperties(prefix = "spring.datasource.hikari")
    public DataSource primaryDataSource(DataSourceProperties properties) {
        // DataSourceProperties의 정보를 사용하여 HikariDataSource 빌더를 초기화합니다.
        // 이것이 'jdbcUrl is required' 오류를 해결하는 핵심적인 부분입니다.
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    // 3. SqlSessionFactory Bean 정의 및 @Primary 지정
    @Bean(name = "sqlSessionFactory")
    @Primary
    public SqlSessionFactory sqlSessionFactory(@Qualifier("primaryDataSource") DataSource primaryDataSource) throws Exception {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();

        factoryBean.setDataSource(primaryDataSource);

        // XML 경로 설정 (하위 폴더 포함)
        String mapperLocations = "classpath:mappers/**/*.xml";
        Resource[] resources = new PathMatchingResourcePatternResolver().getResources(mapperLocations);

        if (resources.length == 0) {
            System.err.println("🚨 CRITICAL: MyBatis XML 매퍼 파일을 찾을 수 없습니다. 경로를 확인해주세요. (설정 경로: " + mapperLocations + ")");
        }

        factoryBean.setMapperLocations(resources);

        // DTO 별칭 경로 설정
        factoryBean.setTypeAliasesPackage("kr.co.api.flobankapi.model, kr.co.api.flobankapi.dto.search");

        // MyBatis Configuration: 데이터베이스 _와 자바 카멜케이스 자동 매핑 활성화
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        configuration.setMapUnderscoreToCamelCase(true);
        factoryBean.setConfiguration(configuration);

        return factoryBean.getObject();
    }

    // 4. SqlSessionTemplate Bean 정의 및 @Primary 지정
    @Bean(name = "sqlSessionTemplate")
    @Primary
    public SqlSessionTemplate sqlSessionTemplate(@Qualifier("sqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}