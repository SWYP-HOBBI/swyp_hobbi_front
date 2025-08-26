import { SearchParams } from '@/types/search';
import { request } from './request';

export const searchApi = {
  // 제목 + 내용 검색
  getSearchByTitleContent: async (params: SearchParams) => {
    const queryParams = new URLSearchParams();

    if (params.lastId) {
      queryParams.append('lastId', params.lastId.toString());
    }
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString());
    }

    return request<any>({
      url: `/search/title-content?${queryParams.toString()}`,
      method: 'GET',
      params: {
        titleAndContent: params.titleAndContent || '',
        hobbyTags: params.hobbyTags || [],
        mbti: params.mbti || '',
      },
    });
  },

  // 작성자 검색
  getSearchByAuthor: async (params: SearchParams) => {
    const queryParams = new URLSearchParams();

    if (params.lastId) {
      queryParams.append('lastId', params.lastId.toString());
    }
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString());
    }

    return request<any>({
      url: `/search/author?${queryParams.toString()}`,
      method: 'GET',
      params: {
        author: params.author || '',
        hobbyTags: params.hobbyTags || [],
        mbti: params.mbti || '',
      },
    });
  },
};
