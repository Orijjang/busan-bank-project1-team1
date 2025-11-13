package kr.co.api.flobankapi.controller;

import kr.co.api.flobankapi.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import kr.co.api.flobankapi.dto.BoardDTO;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Map;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final BoardService boardService;

    @GetMapping("/index")
    public String index(Model model) {
        model.addAttribute("activeItem", "dashboard");
        return "admin/index";
    }

    @GetMapping("/products")
    public String products(Model model) {
        model.addAttribute("activeItem", "products");
        return "admin/products";
    }

    @GetMapping("/products_view")
    public String productsView(Model model) {
        model.addAttribute("activeItem", "products");
        return "admin/products_view";
    }

    @GetMapping("/exchange")
    public String exchange(Model model) {
        model.addAttribute("activeItem", "exchange");
        return "admin/exchange";
    }

    /** 글 등록 */
    @PostMapping("/board/register")
    public String registerBoard(BoardDTO board, RedirectAttributes ra) {
        boardService.insertBoard(board);
        ra.addFlashAttribute("msg", "등록이 완료되었습니다!");
        return "redirect:/admin/member";
    }

    /** 목록 */
    @GetMapping("/member")
    public String member(@RequestParam(defaultValue = "1") int page,
                         Model model,
                         @ModelAttribute("msg") String msg) {

        Map<String, Object> boardPage = boardService.getAllBoardPage(page);

        model.addAttribute("list", boardPage.get("list"));
        model.addAttribute("page", boardPage.get("page"));
        model.addAttribute("pageSize", boardPage.get("pageSize"));
        model.addAttribute("totalPage", boardPage.get("totalPage"));
        model.addAttribute("totalCount", boardPage.get("totalCount"));

        model.addAttribute("editMode", false);

        return "admin/member";
    }

    /** 글 삭제 */
    @GetMapping("/board/delete/{boardNo}")
    public String deleteBoard(@PathVariable Long boardNo, RedirectAttributes ra) {
        boardService.deleteBoard(boardNo);
        ra.addFlashAttribute("msg", "삭제되었습니다!");
        return "redirect:/admin/member";
    }

    /** 글 편집 화면 열기 */
    @GetMapping("/board/edit/{boardNo}")
    public String editBoard(@PathVariable Long boardNo,
                            @RequestParam(defaultValue = "1") int page,
                            Model model) {

        BoardDTO board = boardService.getBoardByNo(boardNo);
        Map<String, Object> boardPage = boardService.getAllBoardPage(page);

        model.addAttribute("editMode", true);
        model.addAttribute("board", board);

        model.addAllAttributes(boardPage);

        return "admin/member";
    }

    /** 글 수정 */
    @PostMapping("/board/update")
    public String updateBoard(BoardDTO board, RedirectAttributes ra) {
        boardService.updateBoard(board);
        ra.addFlashAttribute("msg", "수정이 완료되었습니다!");
        return "redirect:/admin/member";
    }

}
