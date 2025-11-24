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

    @Field(type = FieldType.Text, analyzer = "nori") // "외화예금" -> "외화", "예금"으로 쪼개서 저장함
    private String dpstName;

    @Field(type = FieldType.Text, analyzer = "nori")
    private String dpstInfo;

    @Field(type = FieldType.Text, analyzer = "nori")
    private String dpstDescript; // 상품 상세 설명 (검색 필드로 사용)
}