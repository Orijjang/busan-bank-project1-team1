document.addEventListener("DOMContentLoaded", function () {
  const productManageSection = document.querySelector(".product-card:nth-of-type(2)");
  if (!productManageSection) return;

  const tabButtons = productManageSection.querySelectorAll(".tab-btn");
  const rows = productManageSection.querySelectorAll(".product-table tbody tr");

  // 탭 전환 로직
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const status = btn.dataset.status;

      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      rows.forEach((row) => {
        row.style.display = row.dataset.status === status ? "" : "none";
      });
    });
  });

  // 상품 게시 버튼
  const postButtons = productManageSection.querySelectorAll(".btn-post");
  postButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const productName = this.closest("tr").children[0].textContent.trim();
      if (confirm(`${productName} 상품을 등록하시겠습니까?`)) {
        alert("상품이 게시되었습니다.");
        this.textContent = "게시 완료";
        this.disabled = true;
        this.classList.add("btn-disabled");
      }
    });
  });

  // 승인 완료 버튼 → 심사 대기 중으로 전환
  const approveButtons = productManageSection.querySelectorAll(".btn-approve");
  approveButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const row = this.closest("tr");
      const productName = row.children[0].textContent.trim();

      if (confirm(`${productName} 상품의 승인을 완료하시겠습니까?`)) {
        alert("승인이 완료되었습니다. 심사 대기 중으로 상태가 변경됩니다.");

        // 상태 변경
        row.dataset.status = "review";
        const badge = row.querySelector(".status-badge");
        badge.className = "status-badge status-review";
        badge.textContent = "심사 대기 중";

        // 버튼 비활성화 처리
        this.textContent = "처리 불가";
        this.disabled = true;
        this.classList.remove("btn-approve");
        this.classList.add("btn-disabled");
      }
    });
  });

  // 기본으로 승인 대기 중 탭 선택
  if (tabButtons.length > 0) tabButtons[0].click();
});
