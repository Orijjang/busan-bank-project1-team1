package kr.co.api.flobankapi.mapper;

import kr.co.api.flobankapi.dto.search.SearchLogDTO;
import kr.co.api.flobankapi.dto.search.SearchKeywordDTO;
import kr.co.api.flobankapi.dto.search.SearchTokenDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface SearchMapper {

    // 1. 검색어 기록 저장
    void insertSearchLog(SearchLogDTO log);

    // 2. 사용자별 최근 검색어 10개 조회
    List<SearchLogDTO> selectRecentSearches(String custCode);


    // 3. 전체 검색 토큰 기준 인기 검색어 10개 조회
    List<SearchTokenDTO> selectPopularSearches();
}