// 🔹 탭 버튼 활성화 전환 + 콘텐츠 전환
const tabs = document.querySelectorAll('.view-tab');
const contents = document.querySelectorAll('.view-content');

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    // 모든 탭 / 콘텐츠 초기화
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // 클릭한 탭과 대응 콘텐츠 활성화
    tab.classList.add('active');
    contents[index].classList.add('active');
  });
});


// 만기자동연장신청 토글
document.addEventListener("DOMContentLoaded", () => {
  const radioApply = document.querySelector('input[name="autoRenew"][value="apply"]');
  const radioNo = document.querySelector('input[name="autoRenew"][value="no"]');
  const extraFields = document.getElementById("autoRenewFields");

  radioApply.addEventListener("change", () => {
    if (radioApply.checked) {
      extraFields.classList.remove("hidden");
    }
  });

  radioNo.addEventListener("change", () => {
    if (radioNo.checked) {
      extraFields.classList.add("hidden");
    }
  });
});

// 이메일 / 문자 수령방법 전환
document.addEventListener("DOMContentLoaded", () => {
  const emailRadio = document.querySelector('input[name="receiveMethod"][value="email"]');
  const smsRadio = document.querySelector('input[name="receiveMethod"][value="sms"]');
  const emailFields = document.getElementById("emailFields");
  const smsHint = document.getElementById("smsHint");

  emailRadio.addEventListener("change", () => {
    if (emailRadio.checked) {
      emailFields.classList.remove("hidden");
      smsHint.classList.add("hidden");
    }
  });

  smsRadio.addEventListener("change", () => {
    if (smsRadio.checked) {
      emailFields.classList.add("hidden");
      smsHint.classList.remove("hidden");
    }
  });
});



// 원화/외화 출금계좌 토글
document.addEventListener("DOMContentLoaded", () => {
  const krwRadio = document.querySelector('input[name="withdrawType"][value="krw"]');
  const fxRadio = document.querySelector('input[name="withdrawType"][value="fx"]');
  const krwFields = document.getElementById("krwFields");
  const fxFields = document.getElementById("fxFields");

  krwRadio.addEventListener("change", () => {
    if (krwRadio.checked) {
      krwFields.classList.remove("hidden");
      fxFields.classList.add("hidden");
    }
  });

  fxRadio.addEventListener("change", () => {
    if (fxRadio.checked) {
      fxFields.classList.remove("hidden");
      krwFields.classList.add("hidden");
    }
  });
});
