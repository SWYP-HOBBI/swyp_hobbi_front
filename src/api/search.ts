import { SearchParams } from '@/types/search';
import { request } from './request';

export const searchApi = {
  // 제목 + 내용 검색
  getSearchByTitleContent: async (params: SearchParams) => {
    const queryParams = new URLSearchParams();

    if (params.lastId && params.lastId !== null) {
      queryParams.append('lastId', params.lastId.toString());
    }
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString());
    }

    const url = `/search/title-content?${queryParams.toString()}`;
    const requestData = {
      titleAndContent: params.titleAndContent || null,
      author: null, // 제목+내용 검색에서는 author는 null
      hobbyTags: Array.isArray(params.hobbyTags) ? params.hobbyTags : [],
      mbti: Array.isArray(params.mbti)
        ? params.mbti.join('')
        : params.mbti || '',
    };

    return request<any>({
      url,
      method: 'POST',
      data: requestData,
    });
  },

  // 작성자 검색
  getSearchByAuthor: async (params: SearchParams) => {
    const queryParams = new URLSearchParams();

    if (params.lastId && params.lastId !== null) {
      queryParams.append('lastId', params.lastId.toString());
    }
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString());
    }

    const url = `/search/author?${queryParams.toString()}`;
    const requestData = {
      titleAndContent: null, // 작성자 검색에서는 titleAndContent는 null
      author: params.author || null,
      hobbyTags: Array.isArray(params.hobbyTags) ? params.hobbyTags : [],
      mbti: Array.isArray(params.mbti)
        ? params.mbti.join('')
        : params.mbti || '',
    };

    return request<any>({
      url,
      method: 'POST',
      data: requestData,
    });
  },
};
