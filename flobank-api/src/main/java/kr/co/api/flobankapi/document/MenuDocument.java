package kr.co.api.flobankapi.document;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@Document(indexName = "menu")
public class MenuDocument {

    @Id
    private String url; // 메뉴 URL (Primary Key 역할, mapToSearchResultItem에서 사용)

    @Field(type = FieldType.Text)
    private String title; // 메뉴명 (mapToSearchResultItem에서 사용)

    @Field(type = FieldType.Text)
    private String path; // 전체 경로 (mapToSearchResultItem에서 사용)

    // 검색 필드로 사용: depth1, depth2
}