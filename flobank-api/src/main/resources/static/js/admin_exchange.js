/* ============================================================================
   FLOBANK - Admin Exchange Dashboard Script
   - 기능:
     ✔ 7개 통화 자동 필터 생성 (USD, EUR, JPY, GBP, CNH, AUD, KRW)
     ✔ 데이터의 통화 값 중복/따옴표 제거 처리
     ✔ 날짜 선택 시 해당 날짜의 통화별 환전금액 표시
     ✔ 일자별 총 환전액 그래프 출력
     ✔ 5분 자동 새로고침
     ✔ Chart.js 기반 stacked bar chart
============================================================================ */

(function () {

    /* -----------------------------------------------------------------------
       색상 팔레트 / 기본 통화 목록 선언
       - 기본 통화는 7개로 고정
    ----------------------------------------------------------------------- */
    const palette = ['#5c80c8', '#74b49b', '#f4a261', '#8e83c4', '#ff6b6b', '#2d6a4f', '#4d908e'];

    // ✔ 표시할 모든 통화 7개
    const defaultCurrencies = ['USD', 'EUR', 'JPY', 'GBP', 'CNH', 'AUD', 'KRW'];

    // ✔ 기본 선택 통화 (첫 렌더링에 'USD' 선택)
    const selectedCurrencies = new Set(['USD']);

    // 차트 객체
    let currencyChart;
    let totalChart;

    // 서버에서 Thymeleaf로 내려준 데이터
    let latestStats = window.exchangeStats || {};


    /* -----------------------------------------------------------------------
       숫자 compact(1억 → 1억, 1234000 → 123만 ) 포맷 처리
    ----------------------------------------------------------------------- */
    function compactNumber(value) {
        try {
            const formatter = new Intl.NumberFormat('ko-KR', {
                notation: 'compact',
                maximumFractionDigits: 1
            });
            return formatter.format(value);
        } catch (e) {
            return value.toLocaleString('ko-KR');
        }
    }


    /* -----------------------------------------------------------------------
       날짜 라벨 정제 (X축용: MM-DD만 표시)
    ----------------------------------------------------------------------- */
    function formatDateLabel(dateStr) {
        if (!dateStr) return "";

        dateStr = String(dateStr).trim().replace(/\s+/g, "");

        // YYYY-MM-DD → MM-DD
        const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            return `${match[2]}-${match[3]}`;
        }

        // -11-20 같은 실수 제거
        dateStr = dateStr.replace(/^-+/, "");

        const short = dateStr.match(/(\d{2})-(\d{2})/);
        if (short) return short[0];

        return dateStr;
    }


    /* -----------------------------------------------------------------------
       통화 문자열 정제 (“USD” → USD)
    ----------------------------------------------------------------------- */
    function cleanCurrency(c) {
        return String(c).replace(/"/g, "").trim();
    }


    /* -----------------------------------------------------------------------
       기준 시각 표기 (상단 타임스탬프)
    ----------------------------------------------------------------------- */
    function formatBaseTime(baseTime) {
        if (!baseTime) return '-';

        const d = new Date(baseTime);
        if (isNaN(d.getTime())) return baseTime;

        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');

        return `${mm}.${dd} ${hh}:${mi}:${ss}`;
    }

    function updateBaseTimeText(baseTime) {
        document.querySelectorAll('.exchange-base-time').forEach((el) => {
            el.textContent = `(${formatBaseTime(baseTime)} 기준)`;
        });
    }


    /* -----------------------------------------------------------------------
       ✔ 필터 UI 구성 (7개 통화만 출력)
    ----------------------------------------------------------------------- */
    function buildCurrencyFilter(currencies) {
        const filterEl = document.getElementById('currencyFilter');
        if (!filterEl) return;

        filterEl.innerHTML = '';

        currencies.forEach((code, idx) => {
            const label = document.createElement('label');
            label.className = 'admin-exchange-filter-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = code;

            // 기본 선택 처리
            checkbox.checked =
                selectedCurrencies.has(code) || (selectedCurrencies.size === 0 && code === 'USD');

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selectedCurrencies.add(code);
                } else {
                    selectedCurrencies.delete(code);
                    if (selectedCurrencies.size === 0) selectedCurrencies.add('USD');
                }
                renderCurrencyChart();
            });

            const text = document.createElement('span');
            text.textContent = code;

            label.appendChild(checkbox);
            label.appendChild(text);

            filterEl.appendChild(label);

            if (idx < currencies.length - 1) {
                const divider = document.createElement('span');
                divider.textContent = '|';
                divider.className = 'admin-exchange-filter-spacer';
                filterEl.appendChild(divider);
            }
        });
    }


    /* -----------------------------------------------------------------------
       ✔ 통화별 그래프 데이터 준비 (따옴표/중복 제거 포함)
    ----------------------------------------------------------------------- */
    function prepareCurrencyChartData() {

        const currencyData = Array.isArray(latestStats.currencyDailyAmounts)
            ? latestStats.currencyDailyAmounts
            : [];

        const dateLabels = [...new Set(currencyData.map(item => item.date))].sort();

        // ✔ DB 데이터의 통화값 정제
        const rawCurrencies = currencyData.map(item => cleanCurrency(item.currency));

        // ✔ 7개 통화 + 데이터 통화 → Set으로 중복 제거
        const currencies = [...new Set([...defaultCurrencies, ...rawCurrencies])];

        // 필터 UI
        buildCurrencyFilter(currencies);

        // 현재 선택된 통화만 표시
        const activeCurrencies = currencies.filter(c => selectedCurrencies.has(c));

        const labels = dateLabels.map(d => formatDateLabel(d));

        const datasets = activeCurrencies.map((code, idx) => {
            const values = dateLabels.map(d => {
                const found = currencyData.find(item =>
                    item.date === d && cleanCurrency(item.currency) === code
                );
                return found ? Number(found.amount) : 0;
            });

            return {
                label: code,
                data: values,
                backgroundColor: palette[idx % palette.length],
                borderRadius: 6,
                maxBarThickness: 38
            };
        });

        return { labels, datasets };
    }


    /* -----------------------------------------------------------------------
       ✔ 통화별 stacked bar 그래프 렌더링
    ----------------------------------------------------------------------- */
    function renderCurrencyChart() {
        const canvas = document.getElementById('currencyDailyChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const { labels, datasets } = prepareCurrencyChartData();

        if (!currencyChart) {
            currencyChart = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true } },
                        tooltip: {
                            callbacks: {
                                title: (items) =>
                                    latestStats.currencyDailyAmounts[items[0].dataIndex]?.date,
                                label: (ctx) =>
                                    `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('ko-KR')}원`
                            }
                        }
                    },
                    scales: {
                        x: { stacked: true, offset: true },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            ticks: { callback: v => `${compactNumber(v)}원` }
                        }
                    }
                }
            });
        } else {
            currencyChart.data.labels = labels;
            currencyChart.data.datasets = datasets;
            currencyChart.update();
        }
    }


    /* -----------------------------------------------------------------------
       ✔ 일자별 총 환전액 그래프 렌더링
    ----------------------------------------------------------------------- */
    function renderTotalChart() {
        const canvas = document.getElementById('dailyTotalChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const totalData = Array.isArray(latestStats.dailyTotals)
            ? latestStats.dailyTotals
            : [];

        const labels = totalData.map(item => formatDateLabel(item.date));
        const values = totalData.map(item => Number(item.amount));

        const chartData = {
            labels,
            datasets: [{
                data: values,
                backgroundColor: '#202b44',
                borderRadius: 6,
                maxBarThickness: 40
            }]
        };

        if (!totalChart) {
            totalChart = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                title: (items) =>
                                    latestStats.dailyTotals[items[0].dataIndex]?.date,
                                label: (ctx) =>
                                    `${ctx.parsed.y.toLocaleString('ko-KR')}원`
                            }
                        }
                    },
                    scales: {
                        x: { offset: true },
                        y: {
                            beginAtZero: true,
                            ticks: { callback: v => `${compactNumber(v)}원` }
                        }
                    }
                }
            });
        } else {
            totalChart.data = chartData;
            totalChart.update();
        }
    }


    /* -----------------------------------------------------------------------
       전체 렌더링
    ----------------------------------------------------------------------- */
    function renderAll() {
        renderCurrencyChart();
        renderTotalChart();
        updateBaseTimeText(latestStats.lastUpdatedAt);
    }


    /* -----------------------------------------------------------------------
       5분마다 최신 통계 자동 갱신
    ----------------------------------------------------------------------- */
    async function fetchLatestStats() {
        try {
            const res = await fetch('/admin/exchange/stats', { headers: { 'Accept': 'application/json' } });
            latestStats = await res.json();
            renderAll();
        } catch (e) {
            console.error(e);
        }
    }


    /* -----------------------------------------------------------------------
       ✔ 날짜별 통계 조회
    ----------------------------------------------------------------------- */
    async function fetchDateStats(date) {
        try {
            const res = await fetch(`/admin/exchange/stats?date=${date}`, { headers: { 'Accept': 'application/json' } });
            latestStats = await res.json();
            renderAll();
        } catch (e) {
            console.error(e);
        }
    }


    /* -----------------------------------------------------------------------
       페이지 로드시 실행
    ----------------------------------------------------------------------- */
    document.addEventListener("DOMContentLoaded", () => {

        if (typeof Chart === 'undefined') return;

        renderAll();

        // 날짜 선택 이벤트
        const datePicker = document.getElementById("exchangeDatePicker");
        if (datePicker) {
            datePicker.addEventListener("change", function () {
                fetchDateStats(this.value);
            });
        }

        // 5분 자동 갱신
        setInterval(fetchLatestStats, 5 * 60 * 1000);
    });

})();
