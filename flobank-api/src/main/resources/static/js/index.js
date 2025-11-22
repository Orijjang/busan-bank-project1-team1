// 로그인 필요 공통 이벤트 함수 (전역)
window.goKoAccountOpenMain = function () {
    const hasLoginFlag = document.cookie
        .split(";")
        .map(v => v.trim())
        .some(v => v.startsWith("loginYn=Y"));

    if (!hasLoginFlag) {
        alert("로그인 후 이용 부탁드립니다.");
        return;
    }
    window.location.href = "/flobank/mypage/account_open_main";
};

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}



document.addEventListener("DOMContentLoaded", () => {

    // API 공통 경로 상수 (서버 context-path에 맞춤)
    const CONTEXT_PATH = "/flobank";

    /** ============================
     * 1. 네비게이션 & Mega 메뉴
     * ============================ */
    const nav = document.querySelector(".nav-menu");
    const menuItems = document.querySelectorAll(".menu-item");
    const megaMenu = document.querySelector(".mega-menu");

    if (nav && menuItems.length && megaMenu) {
        menuItems.forEach((item) => {
            item.addEventListener("mouseenter", () => {
                megaMenu.classList.add("show");
                menuItems.forEach((i) => i.classList.remove("active"));
                item.classList.add("active");
            });
        });

        const wrapper = document.querySelector("header");
        let isInside = false;

        wrapper.addEventListener("mouseenter", () => { isInside = true; });

        wrapper.addEventListener("mouseleave", (e) => {
            const to = e.relatedTarget;
            if (!wrapper.contains(to)) {
                isInside = false;
                megaMenu.classList.remove("show");
                menuItems.forEach((i) => i.classList.remove("active"));
            }
        });

        window.addEventListener("scroll", () => {
            megaMenu.classList.remove("show");
            menuItems.forEach((i) => i.classList.remove("active"));
        });
    }

    /** ============================
     * 2. 검색 모달 (로그인 처리 & API 연동 완료)
     * ============================ */
    const searchTrigger = document.querySelector(".search-trigger");
    const searchModal = document.getElementById("searchModal");
    const closeButton = searchModal?.querySelector(".search-top-sheet__close");
    const searchForm = searchModal?.querySelector(".search-top-sheet__form");
    const searchInput = document.getElementById("globalSearch");

    // 결과 목록 요소 선택
    const recentList = searchModal?.querySelector('.search-section:nth-of-type(1) .search-list');
    const popularList = searchModal?.querySelector('.search-section:nth-of-type(2) .search-list.rank');

    if (searchTrigger && searchModal) {

        // --- [내부 함수] API 호출 (JWT 토큰 포함) ---
        async function fetchKeywords(url) {
            try {
                // 👇 [수정] 로컬스토리지 먼저 보고, 없으면 쿠키 확인
                let token = localStorage.getItem('accessToken');
                if (!token) {
                    token = getCookie('accessToken'); // 쿠키 이름이 accessToken이라고 가정
                }

                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(url, { headers: headers });

                if (!response.ok) return [];
                return await response.json();
            } catch (error) {
                console.error("데이터 로드 실패:", error);
                return [];
            }
        }

        // --- [내부 함수] 검색 실행 및 페이지 이동 ---
        function goSearch(keyword) {
            if (!keyword || keyword.trim().length < 1) {
                alert('검색어를 입력해주세요.');
                if(searchInput) searchInput.focus();
                return;
            }

            closeModal();
            // 검색 결과 페이지로 이동 (여기서는 저장 로직 없음, 결과 페이지 로딩 시 백엔드가 저장함)
            window.location.href = `${CONTEXT_PATH}/search?keyword=${encodeURIComponent(keyword)}`;
        }

        function renderRecentList(data) {
            if (!recentList) return;
            recentList.innerHTML = '';

            if (!data || data.length === 0) {
                const isLogin = document.cookie.split(';').some(v => v.trim().startsWith('loginYn=Y'));
                recentList.innerHTML = isLogin
                    ? '<li class="empty">최근 검색 내역이 없습니다.</li>'
                    : '<li class="empty">로그인 후 이용하실 수 있습니다.</li>';
                return;
            }

            data.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="#" class="keyword-link">${item.keyword}</a>
                    <span class="date">${item.date || ''}</span>
                    <button type="button" class="btn-delete" aria-label="삭제">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                `;

                // 1. 검색어 클릭
                li.querySelector('.keyword-link').addEventListener('click', (e) => {
                    e.preventDefault();
                    goSearch(item.keyword);
                });

                // 2. 삭제 버튼 클릭 (디버깅 로그 추가)
                const deleteBtn = li.querySelector('.btn-delete');
                deleteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    console.log("🔥 [Frontend] 삭제 버튼 클릭됨! 키워드:", item.keyword); // 👈 이 로그가 뜨는지 확인!

                    deleteKeyword(item.keyword, li);
                });

                recentList.appendChild(li);
            });
        }

        // -------------------------------------------------------
        // [수정됨] 검색어 삭제 API 호출 (팝업 제거)
        // -------------------------------------------------------
        async function deleteKeyword(keyword, liElement) {
            console.log("[Delete] 삭제 함수 진입! 키워드:", keyword);

            try {
                const url = `${CONTEXT_PATH}/api/search/keywords?keyword=${encodeURIComponent(keyword)}`;
                console.log("[Delete] 요청 URL:", url);

                const response = await fetch(url, {
                    method: 'DELETE',
                    credentials: 'include', // <- 중요: 쿠키 자동 포함
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log("[Delete] 서버 응답 상태:", response.status);

                if (response.ok) {
                    console.log("[Delete] 삭제 성공! 화면에서 요소 제거");
                    liElement.remove();

                    if (recentList.querySelectorAll('li').length === 0) {
                        recentList.innerHTML = '<li class="empty">최근 검색 내역이 없습니다.</li>';
                    }
                } else {
                    console.error("[Delete] 삭제 실패. 서버 응답이 200 OK가 아닙니다.");
                    const errorText = await response.text();
                    console.error("[Delete] 서버 에러 내용:", errorText);
                }

            } catch (error) {
                console.error("[Delete] 자바스크립트 에러:", error);
            }
        }

        // --- [내부 함수] 인기 검색어 렌더링 (숫자 제거됨) ---
        function renderPopularList(data) {
            if (!popularList) return;
            popularList.innerHTML = '';

            if (!data || data.length === 0) {
                popularList.innerHTML = '<li class="empty">인기 검색어가 없습니다.</li>';
                return;
            }

            data.forEach((item) => {
                const li = document.createElement('li');
                // 순위 숫자 제거하고 링크만 표시
                li.innerHTML = `
                    <a href="#" class="keyword-link">${item.keyword}</a>
                `;

                li.querySelector('.keyword-link').addEventListener('click', (e) => {
                    e.preventDefault();
                    goSearch(item.keyword);
                });

                popularList.appendChild(li);
            });
        }

        // --- [내부 함수] 데이터 로드 실행 (조건부 호출) ---
        async function loadSearchData() {
            // 1. 인기 검색어는 누구나 볼 수 있음 (무조건 호출)
            fetchKeywords(`${CONTEXT_PATH}/api/search/keywords/popular`)
                .then(data => renderPopularList(data));

            // 2. 최근 검색어는 로그인 여부 확인 후 호출
            const isLogin = document.cookie.split(';').some(v => v.trim().startsWith('loginYn=Y'));

            if (isLogin) {
                // 로그인 상태: API 호출 (이때 fetchKeywords 안에서 토큰이 헤더에 들어감)
                fetchKeywords(`${CONTEXT_PATH}/api/search/keywords/recent`)
                    .then(data => renderRecentList(data));
            } else {
                // 비로그인 상태: API 호출 안 함 -> 빈 배열 처리
                renderRecentList([]);
            }
        }

        // --- 모달 제어 함수 ---
        const openModal = () => {
            searchModal.classList.add("open");
            searchModal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");

            if(searchInput) {
                searchInput.value = '';
                setTimeout(() => searchInput.focus(), 150);
            }

            loadSearchData(); // 모달 열릴 때 실행
        };

        const closeModal = () => {
            searchModal.classList.remove("open");
            searchModal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("modal-open");
            searchTrigger.focus();
        };

        // --- 이벤트 리스너 등록 ---
        searchTrigger.addEventListener("click", (e) => {
            e.preventDefault();
            openModal();
        });

        closeButton?.addEventListener("click", closeModal);

        searchForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            const keyword = searchInput.value.trim();
            goSearch(keyword);
        });

        searchModal.addEventListener("click", (e) => {
            if (e.target === searchModal) closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && searchModal.classList.contains("open"))
                closeModal();
        });
    }

    /** ============================
     *  3. 슬라이드 배너 (기존 코드 유지)
     * ============================ */
    const slideWrapper = document.querySelector(".slides");
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");

    if (slideWrapper && slides.length) {
        slideWrapper.style.width = `${slides.length * 100}%`;
        slides.forEach(
            (slide) => (slide.style.flex = `0 0 ${100 / slides.length}%`)
        );

        let current = 0;
        let slideInterval;
        const intervalTime = 3000;

        function showSlide(index) {
            slideWrapper.style.transition = "transform 0.8s ease-in-out";
            slideWrapper.style.transform = `translateX(-${
                index * (100 / slides.length)
            }%)`;
            dots.forEach((dot) => dot.classList.remove("active"));
            dots[index].classList.add("active");
        }

        function nextSlide() {
            current = (current + 1) % slides.length;
            showSlide(current);
        }

        function prevSlide() {
            current = (current - 1 + slides.length) % slides.length;
            showSlide(current);
        }

        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, intervalTime);
        }

        function stopAutoSlide() {
            clearInterval(slideInterval);
        }

        slideWrapper.addEventListener("mouseenter", stopAutoSlide);
        slideWrapper.addEventListener("mouseleave", startAutoSlide);
        nextBtn?.addEventListener("click", () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
        prevBtn?.addEventListener("click", () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                current = index;
                showSlide(current);
                stopAutoSlide();
                startAutoSlide();
            });
        });

        showSlide(current);
        startAutoSlide();
    }

    /** ============================
     * 4. 언어 선택 드롭다운 (기존 코드 유지)
     * ============================ */
    const langToggle = document.querySelector(".language-toggle");
    const langMenu = document.querySelector(".language-menu");

    if (langToggle && langMenu) {
        langToggle.addEventListener("click", (e) => {
            e.preventDefault();
            langMenu.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".language-dropdown")) {
                langMenu.classList.remove("show");
            }
        });

        langMenu.querySelectorAll("li").forEach((item) => {
            item.addEventListener("click", () => {
                const lang = item.dataset.lang;
                localStorage.setItem("selectedLang", lang);
                window.location.reload();
            });
        });
    }

    /** ============================
     *  5. 페이지 텍스트 자동 번역 기능 (기존 코드 유지)
     * ============================ */
    const selectedLang = localStorage.getItem("selectedLang") || "ko";

    function getTextNodes(node, nodes = []) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
            nodes.push(node);
        }
        node.childNodes.forEach((child) => getTextNodes(child, nodes));
        return nodes;
    }

    async function translateText(text, targetLang) {
        const response = await fetch(`${CONTEXT_PATH}/api/translate`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                text: text,
                targetLang: targetLang
            })
        });

        const data = await response.json();
        return data.translatedText;
    }

    async function translatePage(targetLang) {
        if (targetLang === "ko") return;

        const nodes = getTextNodes(document.body);

        for (const node of nodes) {
            const original = node.textContent.trim();
            try {
                const translated = await translateText(original, targetLang);
                if(translated) node.textContent = translated;
            } catch(e) {
                console.warn("Translation failed for node", e);
            }
        }
    }
    translatePage(selectedLang);
});