from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
from datetime import date, timedelta
import oracledb  
# ==========================================
# 오라클 접속 정보 입력
# ==========================================
DB_USER = "flobank"       # 유저명 (보통 c## 붙은 계정이거나 만든 계정)
DB_PASSWORD = "1234"      # 비밀번호
DB_DSN = "34.64.225.88:1521/XEPDB1" # 주소 (호스트:포트/서비스명)
# ==========================================

# 오라클 연결 함수
def get_db_connection():
    try:
        # Thin 모드 (별도 클라이언트 설치 없이 동작)
        return oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN)
    except Exception as e:
        return None

# 조회일자 입력칸 ID (이미지에서 확인한 것)
DATE_INPUT_ID = "CRDT"

# Chrome 설정
options = webdriver.ChromeOptions()
options.add_argument("--headless")  # 화면 없이 실행
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(options=options)

driver.get("https://www.busanbank.co.kr/ib20/mnu/FPMFRX206001004")
wait = WebDriverWait(driver, 10)

target_currencies = ["USD", "JPY", "EUR", "CNY", "GBP", "AUD"]

# 날짜 설정
today = date.today()
curr_date = today
end_date = today

conn = get_db_connection()

if conn is None:
    driver.quit()
    exit()

cursor = conn.cursor()

try:
    wait.until(EC.presence_of_element_located((By.ID, "CURCD")))

    while curr_date <= end_date:
        target_date_str = curr_date.strftime("%Y-%m-%d") # YYYY-MM-DD 문자열
        # 오라클에 DATE 타입으로 넣기 위해 date 객체 그대로 사용 가능하지만, 
        # 여기서는 문자열을 오라클 TO_DATE로 변환하는 방식을 씁니다.
        
        print(f"\n [날짜] {target_date_str} 처리 중...")

        for cur in target_currencies:
            try:
                # --- [1] 웹 동작 및 크롤링 ---
                driver.execute_script("document.querySelectorAll('.layer-boder, .box-error').forEach(e => e.remove());")
                
                date_input = driver.find_element(By.ID, DATE_INPUT_ID)
                driver.execute_script("arguments[0].value = arguments[1];", date_input, target_date_str)
                driver.execute_script("arguments[0].dispatchEvent(new Event('change'));", date_input)
                
                select = Select(driver.find_element(By.ID, "CURCD"))
                select.select_by_value(cur)
                
                driver.execute_script("document.querySelector('#doSubmit').click();")
                
                # 팝업 체크 (데이터 없음 등)
                try:
                    WebDriverWait(driver, 0.5).until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.layer-boder")))
                    driver.find_element(By.ID, "ext-btn-ok").click()
                    continue 
                except: pass

                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "ul.js-tabA li a")))
                driver.execute_script("document.querySelector('#conA1Tab').click();")
                
                WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.CSS_SELECTOR, "div#conA table.tbl-type2 tbody tr")))
                
                # --- [2] 데이터 파싱 ---
                soup = BeautifulSoup(driver.page_source, "html.parser")
                rows = soup.select("div#conA table.tbl-type2 tbody tr")
                
                rates = {f"{i}개월": 0.0 for i in range(1, 13)}
                has_data = False
                current_group = None

                for tr in rows:
                    cols = [td.get_text(strip=True) for td in tr.find_all(["th", "td"])]
                    if not cols: continue
                    if "외화" in cols[0]: current_group = cols[0]

                    if current_group == "외화정기예금":
                        p, r = "", 0.0
                        if len(cols) == 4 and cols[0] == "외화정기예금":
                            p, r = cols[1], cols[2]
                        elif len(cols) == 3 and "개월" in cols[0]:
                            p, r = cols[0], cols[1]
                        
                        if p in rates:
                            try:
                                rates[p] = float(r)
                                has_data = True
                            except: pass
                
                # --- [3] 오라클 DB 저장 (MERGE문 사용) ---
                if has_data:
                    # 오라클은 UPSERT 대신 MERGE INTO 구문을 사용합니다.
                    # TO_DATE(:dt, 'YYYY-MM-DD')를 사용하여 문자열을 날짜로 변환합니다.
                    sql = """
                        MERGE INTO EXCHANGE_RATE_12M target
                        USING (SELECT :dt AS base_date, :cur AS currency FROM dual) source
                        ON (target.BASE_DATE = TO_DATE(source.base_date, 'YYYY-MM-DD') 
                            AND target.CURRENCY = source.currency)
                        WHEN MATCHED THEN
                            UPDATE SET 
                                RATE_1M=:r1, RATE_2M=:r2, RATE_3M=:r3, RATE_4M=:r4, 
                                RATE_5M=:r5, RATE_6M=:r6, RATE_7M=:r7, RATE_8M=:r8, 
                                RATE_9M=:r9, RATE_10M=:r10, RATE_11M=:r11, RATE_12M=:r12,
                                CREATED_AT=SYSDATE
                        WHEN NOT MATCHED THEN
                            INSERT (BASE_DATE, CURRENCY, 
                                    RATE_1M, RATE_2M, RATE_3M, RATE_4M, RATE_5M, RATE_6M, 
                                    RATE_7M, RATE_8M, RATE_9M, RATE_10M, RATE_11M, RATE_12M)
                            VALUES (TO_DATE(:dt, 'YYYY-MM-DD'), :cur, 
                                    :r1, :r2, :r3, :r4, :r5, :r6, 
                                    :r7, :r8, :r9, :r10, :r11, :r12)
                    """
                    
                    # 바인딩 변수 딕셔너리 생성
                    params = {
                        'dt': target_date_str,
                        'cur': cur,
                        'r1': rates["1개월"], 'r2': rates["2개월"], 'r3': rates["3개월"],
                        'r4': rates["4개월"], 'r5': rates["5개월"], 'r6': rates["6개월"],
                        'r7': rates["7개월"], 'r8': rates["8개월"], 'r9': rates["9개월"],
                        'r10': rates["10개월"], 'r11': rates["11개월"], 'r12': rates["12개월"]
                    }
                    
                    cursor.execute(sql, params)
                    conn.commit()
                    print(f" {cur} DB 저장(Merge) 완료")

            except Exception as e:
                print(f"  ❌ {cur} 에러: {e}")
                driver.refresh()
                time.sleep(1)
        
        curr_date += timedelta(days=1)

finally:
    if conn:
        conn.close()
    driver.quit()
    print("크롤링 및 DB 저장 완료")