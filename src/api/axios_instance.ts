import { useAuthStore } from '@/store/auth';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // 인증이 필요한 API 엔드포인트

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(error.config.url);
    // 인증 실패 에러 (로그인/회원가입 실패)
    if (
      error.response?.status === 401 &&
      (error.config.url?.includes('/user/login') ||
        error.config.url?.includes('/user/signup'))
    ) {
      return Promise.reject(error); // 바로 에러 반환 (새로고침 방지)
    }

    // 토큰 만료 에러 (인증 필요 API에서 발생)
    if (error.response?.status === 401) {
      const isReissued = await useAuthStore.getState().reissueToken?.();
      if (isReissued) {
        const config = error.config;
        const newToken = useAuthStore.getState().accessToken;
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
        return axiosInstance.request(config);
      } else {
        useAuthStore.getState().setPublicUser?.();
        window.location.href = '/';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
