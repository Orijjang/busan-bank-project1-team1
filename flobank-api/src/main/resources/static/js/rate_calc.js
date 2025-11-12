const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const convertedValue = document.getElementById('convertedValue');

// ✅ 환율 데이터 저장용
let rateData = {};

// ✅ 수출입은행 API (일일 갱신)
const targetUrl =
  "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=LNyeb6x2OFLu289XSY1tokxFueROPpxI&data=AP01";

// ✅ 대체 프록시 (allorigins → codetabs)
const API_URL = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;

// ✅ API에서 환율 데이터 불러오기
async function loadExchangeRates() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    data.forEach((item) => {
      rateData[item.cur_unit] = parseFloat(item.deal_bas_r.replace(/,/g, ""));
    });

    console.log("✅ 환율 불러오기 성공:", rateData);
    calculate();
  } catch (err) {
    console.error("❌ 환율 정보를 불러오지 못했습니다:", err);
    convertedValue.textContent = "환율 정보 오류";
  }
}

// ✅ 계산 함수
function calculate() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(amountInput.value) || 0;

  // 환율 정보가 아직 로드 안 됐을 때
  if (!rateData[from] || !rateData[to]) {
    convertedValue.textContent = "로딩 중...";
    return;
  }

  // 원화 기준 환산
  let krwValue;
  if (from === "KRW") {
    krwValue = amount;
  } else {
    krwValue = amount * rateData[from];
  }

  let result;
  if (to === "KRW") {
    result = krwValue;
  } else {
    result = krwValue / rateData[to];
  }

  convertedValue.textContent = result.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

// ✅ 이벤트 연결
amountInput.addEventListener("input", calculate);
fromCurrency.addEventListener("change", calculate);
toCurrency.addEventListener("change", calculate);

// ✅ 초기 실행
loadExchangeRates();