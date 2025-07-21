import axiosInstance from './axios_instance';

export async function request<T>(
  config: Parameters<typeof axiosInstance.request>[0],
): Promise<T> {
  const response = await axiosInstance.request<T>(config);
  return response.data;
}
