////////////////////////////////////////////////////////////////////////////
// mypage.js — 통합버전 (원화 + 외화, 외화는 USD 고정)
////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {

  ////////////////////////////////////////////////////////////////////////////
  // 2️⃣ 계좌개설 약관 전체 동의
  ////////////////////////////////////////////////////////////////////////////
  const agreeAll = document.getElementById("agreeAll");
  const checks = document.querySelectorAll(".term-check");

  if (agreeAll && checks.length > 0) {
    agreeAll.addEventListener("change", () => {
      checks.forEach(chk => (chk.checked = agreeAll.checked));
    });

    checks.forEach(chk => {
      chk.addEventListener("change", () => {
        agreeAll.checked = [...checks].every(c => c.checked);
      });
    });
  }

  ////////////////////////////////////////////////////////////////////////////
  // 3️⃣ 원화 계좌 한도 설정 (원화 페이지 전용)
  ////////////////////////////////////////////////////////////////////////////
  const dayLimitBtn = document.querySelectorAll(".open2-btn-limit")[0];
  const onceLimitBtn = document.querySelectorAll(".open2-btn-limit")[1];
  const dayLimitInput = document.querySelectorAll(".open2-limit-input")[0];
  const onceLimitInput = document.querySelectorAll(".open2-limit-input")[1];

  if (dayLimitBtn && onceLimitBtn && !document.getElementById("currency-select")) {
    // 💡 원화 전용 페이지에서만 실행
    dayLimitBtn.addEventListener("click", () => {
      dayLimitInput.value = "500,000,000";
    });

    onceLimitBtn.addEventListener("click", () => {
      onceLimitInput.value = "100,000,000";
    });
  }

  ////////////////////////////////////////////////////////////////////////////
  // 4️⃣ 외화 계좌 한도 설정 (USD 고정)
  ////////////////////////////////////////////////////////////////////////////
  const currencySelect = document.getElementById("currency-select");
  const dailyLimit = document.getElementById("daily-limit");
  const onceLimit = document.getElementById("once-limit");
  const currencyLabels = document.querySelectorAll(".currency-label");
  const guideTexts = document.querySelectorAll(".open2-guide-text");

  if (currencySelect && dailyLimit && onceLimit) {
    const usdLimits = {
      daily: "50,000",
      once: "10,000",
      min: "100"
    };

    // ✅ USD 기준으로만 설정
    const applyUsdLimits = () => {
      dailyLimit.value = usdLimits.daily;
      onceLimit.value = usdLimits.once;
      currencyLabels.forEach(label => (label.textContent = "USD"));

      if (guideTexts.length >= 2) {
        guideTexts[0].textContent = `최소 ${usdLimits.min} USD ~ 최대 ${usdLimits.daily} USD 이내 수정 가능`;
        guideTexts[1].textContent = `최소 ${usdLimits.min} USD ~ 최대 ${usdLimits.once} USD 이내`;
      }
    };

    // 초기 설정
    applyUsdLimits();

    // 통화 선택해도 무조건 USD 고정
    currencySelect.addEventListener("change", () => {
      applyUsdLimits();
    });

    // “최대” 버튼 클릭 시도 USD 기준 값 그대로
    const maxBtns = document.querySelectorAll(".open2-btn-limit");
    if (maxBtns.length >= 2) {
      maxBtns[0].addEventListener("click", () => {
        dailyLimit.value = usdLimits.daily;
      });
      maxBtns[1].addEventListener("click", () => {
        onceLimit.value = usdLimits.once;
      });
    }
  }

});




document.addEventListener("DOMContentLoaded", () => {
  const agreeAll = document.getElementById("agreeAll");
  const checks = document.querySelectorAll(".term-check");

  if (agreeAll && checks.length > 0) {
    agreeAll.addEventListener("change", () => {
      checks.forEach(chk => chk.checked = agreeAll.checked);
    });

    checks.forEach(chk => {
      chk.addEventListener("change", () => {
        agreeAll.checked = [...checks].every(c => c.checked);
      });
    });
  }
});





