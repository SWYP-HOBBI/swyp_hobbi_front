import { useAuthStore } from '@/store/auth';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // 인증이 필요한 API 엔드포인트
const API_BASE_URL_PUBLIC = process.env.NEXT_PUBLIC_API_URL_PUBLIC; // 인증이 필요없는 API 엔드포인트 (사라질 예정)

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
    if (error.response && error.response.status === 401) {
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
