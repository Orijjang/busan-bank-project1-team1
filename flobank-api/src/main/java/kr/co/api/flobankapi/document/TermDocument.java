package kr.co.api.flobankapi.document;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.LocalDateTime;

@Data
@Document(indexName = "docs")
public class TermDocument {

    @Id
    private String thistNo; // 약관/문서 번호 (Primary Key 역할)

    @Field(type = FieldType.Text)
    private String termTitle; // 약관 제목 (mapToSearchResultItem에서 사용)

    @Field(type = FieldType.Text)
    private String thistContent; // 약관 내용 (mapToSearchResultItem에서 사용)

    @Field(type = FieldType.Keyword)
    private String thistVersion; // 버전 (mapToSearchResultItem에서 사용)

    @Field(type = FieldType.Date)
    private LocalDateTime thistRegDy; // 등록일 (mapToSearchResultItem에서 사용)
}