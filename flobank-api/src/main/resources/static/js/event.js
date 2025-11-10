document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("attendanceGrid");
  const checkBtn = document.getElementById("checkBtn");

  // ✅ 회원가입일 (나중에 Spring Boot에서 사용자 정보로 전달)
  const joinDate = new Date("2025-11-07"); // YYYY-MM-DD 형식
  const today = new Date();

  const totalDays = 14;

  // ✅ 유저별 localStorage 키
  const userKey = `flowbank_attendance_${joinDate.toISOString().split("T")[0]}`;
  let attendanceData = JSON.parse(localStorage.getItem(userKey)) || Array(totalDays).fill(false);

  // ✅ 출석칸 생성
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(joinDate);
    date.setDate(joinDate.getDate() + i);

    const dayEl = document.createElement("div");
    dayEl.classList.add("eventpage-box");

    const img = document.createElement("img");
    img.src = attendanceData[i]
      ? "/static/images/event2.png"
      : "/static/images/event3.png";
    img.classList.toggle("checked", attendanceData[i]);

    const label = document.createElement("p");
    label.textContent = `${date.getMonth() + 1}/${date.getDate()}`;

    dayEl.appendChild(img);
    dayEl.appendChild(label);
    grid.appendChild(dayEl);
  }

  // ✅ 출석 버튼 클릭 이벤트
  checkBtn.addEventListener("click", () => {
    const daysSinceJoin = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));

    if (daysSinceJoin < 0) {
      alert("아직 이벤트 시작일이 아닙니다!");
      return;
    }

    if (daysSinceJoin >= totalDays) {
      alert("이벤트 기간(14일)이 종료되었습니다.");
      return;
    }

    if (attendanceData[daysSinceJoin]) {
      alert("오늘은 이미 출석하셨습니다!");
      return;
    }

    // ✅ 출석 처리
    attendanceData[daysSinceJoin] = true;
    localStorage.setItem(userKey, JSON.stringify(attendanceData));

    const img = grid.children[daysSinceJoin].querySelector("img");
    img.src = "/static/images/event2.png";
    img.classList.add("checked");

    const totalChecked = attendanceData.filter(v => v).length;

    if (totalChecked === totalDays) {
      alert("🎉 14일 연속 출석 완료! 환율 우대쿠폰이 지급됩니다.");
    } else {
      alert(`🐬 출석 완료! (${totalChecked}/14)`);
    }
  });
});
