import { SearchParams, SearchPostResponse } from '@/types/search';
import { request } from './request';

export const searchApi = {
  getSearchPosts: async (params: SearchParams) => {
    return request<any>({
      url: `/search/`,
      method: 'POST',
      data: {
        keyword_text: params.keyword_text || '', // 게시글 내용 검색 키워드
        keyword_user: params.keyword_user || '', // 사용자명 검색 키워드
        mbti: params.mbti ?? [], // MBTI 필터
        hobby_tags: params.hobby_tags ?? [], // 취미 태그 필터
        cursor_created_at: params.cursor_created_at ?? null, // 생성일 기준 커서
        cursor_id: params.cursor_id ?? null, // ID 기준 커서
        limit: params.limit ?? 15, // 한 번에 조회할 결과 수
      },
    });
  },
};
