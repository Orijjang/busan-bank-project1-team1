package kr.co.api.flobankapi.controller;

import kr.co.api.flobankapi.dto.MemberDTO;
import kr.co.api.flobankapi.jwt.CustomUserDetails;
import kr.co.api.flobankapi.service.EventService;
import kr.co.api.flobankapi.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;


@Controller
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping("/event")
    public String attendance(@AuthenticationPrincipal CustomUserDetails userDetails,
                             Model model) {

        String loginId = userDetails.getUsername(); // cust_id

        String custCode = eventService.getCustCode(loginId);

        MemberDTO member = eventService.getMemberInfo(custCode);

        LocalDate joinDate = eventService.getJoinDate(custCode);

        model.addAttribute("member", member);
        model.addAttribute("joinDate", joinDate);

        return "event/attendance";
    }

}
