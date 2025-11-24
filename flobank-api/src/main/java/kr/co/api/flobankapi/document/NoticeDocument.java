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
@Document(indexName = "notice")
public class NoticeDocument {

    @Id
    private String boardNo; // 게시글 번호 (Primary Key 역할)

    @Field(type = FieldType.Text, analyzer = "nori")
    private String boardTitle; // 게시글 제목 (mapToSearchResultItem에서 사용)

    @Field(type = FieldType.Text, analyzer = "nori")
    private String boardContent; // 게시글 내용 (mapToSearchResultItem에서 사용)

    @Field(type = FieldType.Date, format = DateFormat.date)
    private LocalDate boardRegDt;
}