package kr.co.api.flobankapi.document;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@Document(indexName = "product")
public class ProductDocument {

    @Id
    private String dpstId; // 상품 ID (Primary Key 역할)

    @Field(type = FieldType.Text)
    private String dpstName; // 상품명 (mapToSearchResultItem에서 사용)

    @Field(type = FieldType.Text)
    private String dpstInfo; // 상품 정보/요약 (mapToSearchResultItem에서 사용)

    @Field(type = FieldType.Text)
    private String dpstDescript; // 상품 상세 설명 (검색 필드로 사용)
}