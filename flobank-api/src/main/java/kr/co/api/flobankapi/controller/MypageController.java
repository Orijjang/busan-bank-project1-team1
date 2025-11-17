package kr.co.api.flobankapi.controller;

import kr.co.api.flobankapi.dto.CustAcctDTO;
import kr.co.api.flobankapi.dto.SearchResDTO;
import kr.co.api.flobankapi.service.ChatGPTService;
import kr.co.api.flobankapi.service.EmbeddingService;
import kr.co.api.flobankapi.service.PineconeService;
import kr.co.api.flobankapi.service.QTypeClassifierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/mypage")
@Slf4j
@RequiredArgsConstructor
public class MypageController {

    private final QTypeClassifierService typeClassifier;
    private final EmbeddingService embeddingService;
    private final PineconeService pineconeService;
    private final ChatGPTService chatGPTService;


    @GetMapping({"/main","/"})
    public String mypage() {
        return "mypage/main";
    }

    @GetMapping("/account_open_main")
    public String account_open_main() {
        return "mypage/account_open_main";
    }

    @GetMapping("/ko_account_open_1")
    public String ko_account_open_1() {
        return "mypage/ko_account_open_1";
    }

    @GetMapping("/ko_account_open_2")
    public String ko_account_open_2(@ModelAttribute CustAcctDTO custAcctDTO) {
        return "mypage/ko_account_open_2";
    }

    @GetMapping("/ko_account_open_3")
    public String ko_account_open_3() {
        return "mypage/ko_account_open_3";
    }

    @GetMapping("/chatbot")
    public String chatbot() {
        return "mypage/chatbot";
    }

    @PostMapping("/chatbot")
    public String chatbot(Model model, String q) {
        System.out.println("GPT API 호출 들어옴 = " + System.currentTimeMillis());
        try {
            // 문서 타입 자동 분류
            String type = typeClassifier.detectTypeByGPT(q);
            System.out.println("=== 자동 분류된 TYPE = " + type);

            // 질문 임베딩
            List<Double> qEmbedding = embeddingService.embedText(q);
            log.info(">>> 벡터 : " + qEmbedding);

            // Pinecone search
            var results = pineconeService.search(
                    qEmbedding,
                    10,          // topK
                    "fx-interest",       // namespace 전체 검색
                    type,       // GPT가 판별한 문서 타입 (null 가능)
                    0        // 최소 유사도 컷
            );

            // 검색된 문서로 문맥 텍스트 구성
            StringBuilder contextBuilder = new StringBuilder();
            for (SearchResDTO r : results) {
                Map<String, Object> meta = r.getMetadata();
                if (meta.containsKey("content")) {
                    contextBuilder.append(meta.get("content")).append("\n\n");
                }
            }
            String context = contextBuilder.toString();
            log.info("=== 최종 context ===\n" + context);

            // GPT 호출 (문맥 + 질문)
            String response = chatGPTService.ask(q, context);

            model.addAttribute("response", response);

            return "mypage/chatbot";

        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            return "mypage/chatbot";
        }
    }
}
