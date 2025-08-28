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
      titleAndContent: params.titleAndContent || '',
      hobbyTags: Array.isArray(params.hobbyTags) ? params.hobbyTags : [],
      mbti: Array.isArray(params.mbti)
        ? params.mbti.join('')
        : params.mbti || '',
    };

    console.log('getSearchByTitleContent - URL:', url);
    console.log('getSearchByTitleContent - Data:', requestData);

    return request<any>({
      url,
      method: 'GET',
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
      author: params.author || '',
      hobbyTags: Array.isArray(params.hobbyTags) ? params.hobbyTags : [],
      mbti: Array.isArray(params.mbti)
        ? params.mbti.join('')
        : params.mbti || '',
    };

    console.log('getSearchByAuthor - URL:', url);
    console.log('getSearchByAuthor - Data:', requestData);

    return request<any>({
      url,
      method: 'GET',
      data: requestData,
    });
  },
};
