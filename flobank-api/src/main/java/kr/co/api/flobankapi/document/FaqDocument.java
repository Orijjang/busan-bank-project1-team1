package kr.co.api.flobankapi.document;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@Document(indexName = "faq")
public class FaqDocument {

    @Id
    private String faqNo; // FAQ 번호 (Primary Key 역할)

    @Field(type = FieldType.Text)
    private String faqQuestion; // 질문 (mapToSearchResultItem에서 사용)

    @Field(type = FieldType.Text)
    private String faqAnswer; // 답변 (mapToSearchResultItem에서 사용)
}