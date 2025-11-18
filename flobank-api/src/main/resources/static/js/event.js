document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("attendanceGrid");
    const checkBtn = document.getElementById("checkBtn");


    const joinDate = new Date("2025-11-18");
    const today = new Date();
    const totalDays = 14;

    const userKey = `flowbank_attendance_${joinDate.toISOString().split("T")[0]}`;
    let attendanceData = JSON.parse(localStorage.getItem(userKey)) || Array(totalDays).fill(false);

    for (let i = 0; i < totalDays; i++) {
        const date = new Date(joinDate);
        date.setDate(joinDate.getDate() + i);

        const dayEl = document.createElement("div");
        dayEl.classList.add("eventpage-box");

        const img = document.createElement("img");
        img.src = attendanceData[i] ? event2Img : event3Img;
        img.classList.toggle("checked", attendanceData[i]);

        const label = document.createElement("p");
        label.textContent = `${date.getMonth() + 1}/${date.getDate()}`;

        dayEl.appendChild(img);
        dayEl.appendChild(label);
        grid.appendChild(dayEl);
    }

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

        attendanceData[daysSinceJoin] = true;
        localStorage.setItem(userKey, JSON.stringify(attendanceData));

        const img = grid.children[daysSinceJoin].querySelector("img");
        img.src = event2Img;
        img.classList.add("checked");

        const totalChecked = attendanceData.filter(v => v).length;

        if (totalChecked === totalDays) {
            alert("🎉 14일 연속 출석 완료! 환율 우대쿠폰이 지급됩니다.");
        } else {
            alert(`🐬 출석 완료! (${totalChecked}/14)`);
        }
    });
});
