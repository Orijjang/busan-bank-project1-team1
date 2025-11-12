document.addEventListener("DOMContentLoaded", function () {
  const depositTypeRadios = document.querySelectorAll('input[name="depositType"]');
  const depositTypeSection = document.querySelector(".conditional.deposit-type");
  const extraDepositRadios = document.querySelectorAll('input[name="extraDeposit"]');
  const extraDepositSection = document.querySelector(".conditional.extra-deposit");
  const currencyCheckboxes = document.querySelectorAll('input[name="currency"]');
  const currencyAmountContainer = document.getElementById("currencyAmountContainer");

  const joinTypeRadios = document.querySelectorAll('input[name="joinType"]');
  const joinTypeFree = document.querySelector('.conditional.join-type[data-type="자유형"]');
  const joinTypeFixed = document.querySelector('.conditional.join-type[data-type="고정형"]');

  const ageLimitRadios = document.querySelectorAll('input[name="ageLimit"]');
  const ageLimitSection = document.querySelector(".conditional.age-limit");

  const withdrawalRadios = document.querySelectorAll('input[name="partialWithdrawal"]');
  const withdrawalSection = document.querySelector(".conditional.partial-withdrawal");
  const withdrawCurrencyContainer = document.getElementById("withdrawCurrencyContainer");

  const autoRenewRadios = document.querySelectorAll('input[name="autoRenew"]');
  const autoRenewSection = document.querySelector(".conditional.auto-renew");

  // 초기 실행
  updateAll();

  // 이벤트 등록
  depositTypeRadios.forEach(radio => radio.addEventListener("change", updateAll));
  extraDepositRadios.forEach(radio => radio.addEventListener("change", updateExtraDeposit));
  joinTypeRadios.forEach(radio => radio.addEventListener("change", updateJoinType));
  ageLimitRadios.forEach(radio => radio.addEventListener("change", updateAgeLimit));
  withdrawalRadios.forEach(radio => radio.addEventListener("change", updateAll));
  autoRenewRadios.forEach(radio => radio.addEventListener("change", updateAutoRenew));
  currencyCheckboxes.forEach(box => box.addEventListener("change", updateAll));

  function updateAll() {
    updateDepositType();
    updateExtraDeposit();
    updateJoinType();
    updateAgeLimit();
    updateWithdrawal();
    updateAutoRenew();
  }

  function updateDepositType() {
    const selected = document.querySelector('input[name="depositType"]:checked').value;
    if (selected === "거치식") {
      depositTypeSection.style.display = "block";
      updateCurrencyAmountFields();
    } else {
      depositTypeSection.style.display = "none";
      currencyAmountContainer.innerHTML = "";
    }
  }

  function updateExtraDeposit() {
    const selected = document.querySelector('input[name="extraDeposit"]:checked');
    extraDepositSection.style.display = (selected && selected.value === "yes") ? "block" : "none";
  }

  function updateJoinType() {
    const selected = document.querySelector('input[name="joinType"]:checked').value;
    joinTypeFree.style.display = selected === "자유형" ? "block" : "none";
    joinTypeFixed.style.display = selected === "고정형" ? "block" : "none";
  }

  function updateAgeLimit() {
    const selected = document.querySelector('input[name="ageLimit"]:checked').value;
    ageLimitSection.style.display = selected === "yes" ? "block" : "none";
  }

  function updateWithdrawal() {
    const selected = document.querySelector('input[name="partialWithdrawal"]:checked').value;
    const depositType = document.querySelector('input[name="depositType"]:checked').value;

    withdrawCurrencyContainer.innerHTML = "";

    if (selected === "no") {
      withdrawalSection.style.display = "none";
      return;
    }

    withdrawalSection.style.display = "block";

    // ✅ 항상 최신 상태 반영: 거치식 + 가능일 때 통화별 필드 다시 그림
    if (depositType === "거치식") {
      updateCurrencyWithdrawFields();
    }
  }

  function updateAutoRenew() {
    const selected = document.querySelector('input[name="autoRenew"]:checked').value;
    autoRenewSection.style.display = selected === "yes" ? "block" : "none";
  }

  function updateCurrencyAmountFields() {
    const selectedType = document.querySelector('input[name="depositType"]:checked').value;
    if (selectedType !== "거치식") return;

    currencyAmountContainer.innerHTML = "";
    const checkedCurrencies = Array.from(currencyCheckboxes).filter(box => box.checked);

    checkedCurrencies.forEach(box => {
      const code = box.value;
      const label = box.parentElement.textContent.trim();

      const wrapper = document.createElement("div");
      wrapper.classList.add("currency-amount-block");
      wrapper.innerHTML = `
        <h4>${label}</h4>
        <div class="form-inline">
          <label>최소 가입액</label>
          <input type="number" name="minAmount_${code}" placeholder="예: 1,000" />
        </div>
        <div class="form-inline">
          <label>최대 가입액</label>
          <input type="number" name="maxAmount_${code}" placeholder="예: 1,000,000" />
        </div>
      `;
      currencyAmountContainer.appendChild(wrapper);
    });
  }

  // ✅ 거치식 + 분할인출 가능 시 통화별 최소 출금금액 표시
  function updateCurrencyWithdrawFields() {
    const selectedCurrencies = Array.from(currencyCheckboxes).filter(c => c.checked);
    withdrawCurrencyContainer.innerHTML = "";

    if (selectedCurrencies.length === 0) return;

    selectedCurrencies.forEach(currency => {
      const label = currency.parentElement.textContent.trim();
      const block = document.createElement("div");
      block.classList.add("currency-amount-block");
      block.innerHTML = `
        <h4>${label} 최소 출금 금액</h4>
        <div class="form-inline">
          <label>최소 출금금액</label>
          <input type="number" name="minWithdraw_${currency.value}" placeholder="예: ${currency.value} 최소 금액" />
        </div>
      `;
      withdrawCurrencyContainer.appendChild(block);
    });
  }
});
