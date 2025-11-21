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

document.addEventListener("DOMContentLoaded", () => {
    /** ============================
     * ✅ 1. 네비게이션 & Mega 메뉴
     * ============================ */
    const nav = document.querySelector(".nav-menu");
    const menuItems = document.querySelectorAll(".menu-item");
    const megaMenu = document.querySelector(".mega-menu");

    if (nav && menuItems.length && megaMenu) {
        // hover 시 전체 메뉴 열림
        menuItems.forEach((item) => {
            item.addEventListener("mouseenter", () => {
                megaMenu.classList.add("show");
                menuItems.forEach((i) => i.classList.remove("active"));
                item.classList.add("active");
            });
        });

        const wrapper = document.querySelector("header");
        let isInside = false;

        wrapper.addEventListener("mouseenter", () => {
            isInside = true;
        });

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
     * ✅ 2. 검색 모달
     * ============================ */
    const searchTrigger = document.querySelector(".search-trigger");
    const searchModal = document.getElementById("searchModal");
    const closeButton = searchModal?.querySelector(".search-top-sheet__close");
    const searchForm = searchModal?.querySelector(".search-top-sheet__form");
    const searchInput = document.getElementById("globalSearch");

    // DYNAMIC CONTENT ELEMENTS
    const recentList = searchModal?.querySelector('.search-section:nth-child(1) .search-list');
    const popularList = searchModal?.querySelector('.search-section:nth-child(2) .search-list.rank');


    // ----------------------------------------------------
    // 🔍 API 및 렌더링 함수 (추가된 기능)
    // ----------------------------------------------------

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                // 로그인 필요 시 (401), 혹은 서버 에러 발생 시 처리
                // 최근 검색어의 경우 비로그인 사용자면 빈 배열이 반환될 수 있음
                console.warn(`API Error on ${url}. Status: ${response.status}`);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    }

    function handleKeywordClick(event) {
        const keyword = event.target.getAttribute('data-keyword');
        if (keyword) {
            searchInput.value = keyword;
            handleSearchSubmit(new Event('submit'));
        }
    }

    function renderRecentKeywords(keywords) {
        if (!recentList) return;
        recentList.innerHTML = '';

        if (!keywords || keywords.length === 0) {
            recentList.innerHTML = '<li class="empty">최근 검색 내역이 없습니다.</li>';
            return;
        }

        keywords.forEach(item => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = item.searchTxt;
            button.setAttribute('data-keyword', item.searchTxt);
            button.addEventListener('click', handleKeywordClick);

            li.appendChild(button);
            recentList.appendChild(li);
        });
    }

    function renderPopularKeywords(keywords) {
        if (!popularList) return;
        popularList.innerHTML = '';

        if (!keywords || keywords.length === 0) {
            return;
        }

        keywords.forEach((item, index) => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = item.searchTxt;
            button.setAttribute('data-keyword', item.searchTxt);
            button.addEventListener('click', handleKeywordClick);

            li.appendChild(button);
            popularList.appendChild(li);
        });
    }

    async function loadSearchKeywords() {
        // 비동기적으로 두 목록을 동시에 로드
        const [recentKeywords, popularKeywords] = await Promise.all([
            fetchData('/api/search/keywords/recent'),
            fetchData('/api/search/keywords/popular')
        ]);

        renderRecentKeywords(recentKeywords);
        renderPopularKeywords(popularKeywords);
    }

    // ----------------------------------------------------
    // 🚀 모달 제어 및 검색 실행 로직 (수정됨)
    // ----------------------------------------------------

    const handleSearchSubmit = (event) => {
        event.preventDefault();

        const keyword = searchInput.value.trim();
        if (!keyword) {
            alert('검색어를 입력해주세요.');
            return;
        }

        // 1. 통합 검색 API 호출 (서버에서 이 API 호출 시 자동으로 TB_SEARCH_LOG에 기록됨)
        const integratedSearchUrl = `/api/search/integrated?keyword=${encodeURIComponent(keyword)}`;

        // 2. 검색 실행 후 모달 닫기
        closeModal();

        // 3. 실제 통합 검색 결과 페이지로 이동 (예시)
        window.location.href = `/search/result?keyword=${encodeURIComponent(keyword)}`;

        // (선택) API 응답을 기다릴 필요 없이 즉시 페이지 이동
        // fetch(integratedSearchUrl) // 결과를 기다리지 않고 기록만 수행
        // .then(() => {
        //     window.location.href = `/search/result?keyword=${encodeURIComponent(keyword)}`;
        // });
    };


    if (searchTrigger && searchModal) {
        const openModal = () => {
            searchModal.classList.add("open");
            searchModal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
            setTimeout(() => searchInput?.focus(), 150);

            loadSearchKeywords(); // <<< 모달 열릴 때 키워드 로드 >>>
        };

        const closeModal = () => {
            searchModal.classList.remove("open");
            searchModal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("modal-open");
            searchTrigger.focus();
        };

        searchTrigger.addEventListener("click", (e) => {
            e.preventDefault();
            openModal();
        });

        closeButton?.addEventListener("click", closeModal);
        searchForm?.addEventListener("submit", handleSearchSubmit); // <<< 검색 실행 함수 연결 >>>

        searchModal.addEventListener("click", (e) => {
            if (e.target === searchModal) closeModal();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && searchModal.classList.contains("open"))
                closeModal();
        });
    }

    /** ============================
     * ✅ 3. 슬라이드 배너
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

    /* ============================================================
   * ✅ 4. 언어 선택 드롭다운
   * ============================================================ */
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

                // 선택 후 새로고침
                window.location.reload();
            });
        });
    }

    /* ============================================================
    * ✅ 5. 페이지 텍스트 자동 번역 기능
    * ============================================================ */

// 저장된 언어 가져오기 (기본 한국어)
    const selectedLang = localStorage.getItem("selectedLang") || "ko";

// 텍스트 노드만 수집하는 함수
    function getTextNodes(node, nodes = []) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
            nodes.push(node);
        }
        node.childNodes.forEach((child) => getTextNodes(child, nodes));
        return nodes;
    }

// DeepL 번역 요청 함수
    async function translateText(text, targetLang) {
        const response = await fetch("/flobank/api/translate", {
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

// 페이지 전체 텍스트 번역
    async function translatePage(targetLang) {
        if (targetLang === "ko") return; // 한국어면 번역 X

        const nodes = getTextNodes(document.body);

        for (const node of nodes) {
            const original = node.textContent.trim();
            const translated = await translateText(original, targetLang);
            node.textContent = translated;
        }
    }
    translatePage(selectedLang);
});
