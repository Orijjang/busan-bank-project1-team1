// -------------------------------------------------------------
// 사용자 정보 변경 모달 (userInfoModal)
// -------------------------------------------------------------
document.querySelector('.profile-footer a').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('userInfoModal').style.display = 'flex';
});

// 닫기 버튼
document.querySelector('.close-btn').addEventListener('click', () => {
  document.getElementById('userInfoModal').style.display = 'none';
});

// 바깥 클릭 시 닫기
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    document.getElementById('userInfoModal').style.display = 'none';
  }
});


// -------------------------------------------------------------
// 환전 상세 내역 모달 (exchangeModal)
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const exchangeModal = document.getElementById("exchangeModal");
  const closeExchangeBtn = exchangeModal.querySelector(".close-btn");

  // 환전번호 클릭 → 상세모달 열기
  document.querySelectorAll(".exchange-link").forEach(btn => {
    btn.addEventListener("click", () => {
      exchangeModal.style.display = "flex";

      // 나중에 실제 API 연동 시 이 안에서 데이터 세팅 가능
      // const exId = btn.dataset.id;
      // fetch(`/exchange/detail/${exId}`).then(...)
    });
  });

  // 닫기 버튼
  closeExchangeBtn.addEventListener("click", () => {
    exchangeModal.style.display = "none";
  });

  // 배경 클릭 시 닫기
  window.addEventListener("click", e => {
    if (e.target === exchangeModal) {
      exchangeModal.style.display = "none";
    }
  });
});


// -------------------------------------------------------------
// 계좌 거래내역 모달 (accountModal)
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const accountModal = document.getElementById("accountModal");
  const closeAccountBtn = accountModal.querySelector(".close-btn");

  // 계좌번호 클릭 → 거래내역 모달 열기
  document.querySelectorAll(".account-table td:nth-child(2)").forEach(cell => {
    cell.addEventListener("click", () => {
      accountModal.style.display = "flex";

      // 필요 시 클릭한 계좌번호 정보 가져오기
      // const accNumber = cell.innerText;
      // document.getElementById("acc-number").innerText = accNumber;
      // 실제 데이터는 fetch(`/account/detail/${accNumber}`) 로 연동 가능
    });
  });

  // 닫기 버튼 클릭 시 닫기
  closeAccountBtn.addEventListener("click", () => {
    accountModal.style.display = "none";
  });

  // 배경 클릭 시 닫기
  window.addEventListener("click", (e) => {
    if (e.target === accountModal) {
      accountModal.style.display = "none";
    }
  });
});




// -------------------------------------------------------------
// 예금 상세정보 모달 (depositModal)
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const depositModal = document.getElementById("depositModal");
  const closeDepositBtn = depositModal.querySelector(".close-btn");
  const depositDetailTable = depositModal.querySelector(".detail-table tbody"); 
  const depositHistoryTbody = document.getElementById("depositHistory");

  // --- 더미 데이터 (예시용) ---
  const deposits = {
    1: {
      name: "플로달러예금",
      type: "거치식",
      account: "112-2188-1931-00",
      balance: "$3,200",
      startDate: "2024.10.03",
      endDate: "2029.10.03 (D-159)",
      currency: "USD",
      rateBase: "가입 당시 환율 1,350.25원/USD",
      minWithdraw: "$100 이상",
      earlyRate: "연 1.2% (중도해지 시)",
      autoRenew: "가능 (3개월 주기)",
      interestPayment: "만기 일시지급",
      history: [
        ["2025.10.15 13:56:23", "$200 입금", "$3,200"],
        ["2025.09.12 09:22:11", "$150 입금", "$3,000"],
      ],
    },
    2: {
      name: "글로벌유로예금",
      type: "자유적립식",
      account: "112-5566-1823-00",
      balance: "€1,800",
      startDate: "2023.06.22",
      endDate: "2027.06.22 (D-98)",
      currency: "EUR",
      rateBase: "가입 당시 환율 1,470.42원/EUR",
      monthlyDeposit: "€300",
      maxDepositCount: "12회 중 5회 납입",
      extraDeposit: "가능 (남은 2회)",
      partialWithdraw: "가능 (남은 1회)",
      autoRenew: "불가능",
      history: [
        ["2025.10.10 15:20:33", "€300 입금", "€1,800"],
        ["2025.08.05 10:00:00", "€200 입금", "€1,500"],
      ],
    },
  };

  // --- 예금 이름 클릭 시 모달 열기 ---
  document.querySelectorAll(".deposit-name").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const id = link.dataset.id;
      const data = deposits[id];

      // 모달 내용 채우기
      let html = `
        <tr><th>예금이름</th><td>${data.name}</td></tr>
        <tr><th>예금유형</th><td>${data.type}</td></tr>
        <tr><th>예금계좌</th><td>${data.account}</td></tr>
        <tr><th>잔액</th><td>${data.balance}</td></tr>
        <tr><th>가입일</th><td>${data.startDate}</td></tr>
        <tr><th>만기일</th><td>${data.endDate}</td></tr>
        <tr><th>가입 통화</th><td>${data.currency}</td></tr>
        <tr><th>환율 적용 기준</th><td>${data.rateBase}</td></tr>
      `;

      // --- 유형별 구분 ---
      if (data.type === "거치식") {
        html += `
          <tr><th>최소출금금액</th><td>${data.minWithdraw}</td></tr>
          <tr><th>중도해지이율</th><td>${data.earlyRate}</td></tr>
          <tr><th>자동 연장</th><td>${data.autoRenew}</td></tr>
          <tr><th>이자 지급 방식</th><td>${data.interestPayment}</td></tr>
        `;
      } else if (data.type === "자유적립식") {
        html += `
          <tr><th>월 납입금액</th><td>${data.monthlyDeposit}</td></tr>
          <tr><th>납입횟수</th><td>${data.maxDepositCount}</td></tr>
          <tr><th>추가납입</th><td>${data.extraDeposit}</td></tr>
          <tr><th>자동 연장</th><td>${data.autoRenew}</td></tr>
          <tr><th>일부 출금</th><td>${data.partialWithdraw}</td></tr>
        `;
      }

      // 테이블 갱신
      depositDetailTable.innerHTML = html;

      // --- 거래내역 출력 ---
      depositHistoryTbody.innerHTML = "";
      data.history.forEach(row => {
        const tr = document.createElement("tr");
        row.forEach(cell => {
          const td = document.createElement("td");
          td.textContent = cell;
          tr.appendChild(td);
        });
        depositHistoryTbody.appendChild(tr);
      });

      // 모달 열기
      depositModal.style.display = "flex";
    });
  });

  // --- 닫기 버튼 ---
  closeDepositBtn.addEventListener("click", () => {
    depositModal.style.display = "none";
  });

  // --- 배경 클릭 시 닫기 ---
  window.addEventListener("click", (e) => {
    if (e.target === depositModal) {
      depositModal.style.display = "none";
    }
  });
});
