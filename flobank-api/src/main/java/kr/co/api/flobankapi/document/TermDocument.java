package kr.co.api.flobankapi.document;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(indexName = "docs")
public class TermDocument {

    @Id
    private String thistNo;       // 히스토리 번호 (PK)

    @Field(type = FieldType.Text)
    private String termTitle;     // 약관 제목 (from MASTER)

    @Field(type = FieldType.Text)
    private String thistContent;  // 약관 내용 (from HIST - CLOB)

    // 버전 (검색보다는 필터/표시용이므로 Keyword 타입 추천)
    @Field(type = FieldType.Keyword)
    private String thistVersion;

    @Field(type = FieldType.Date, format = DateFormat.date)
    private LocalDate thistRegDy;

    @Field(type = FieldType.Keyword)
    private String thistFile;

}