import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - BaseResponse 구조 처리
api.interceptors.response.use(
  (response) => {
    // 백엔드가 BaseResponse로 감싸서 보내는 경우
    if (response.data && typeof response.data === 'object') {
      // BaseResponse 구조인 경우 data 필드 반환
      if (response.data.hasOwnProperty('data')) {
        return response.data.data;
      }
      // AuthResultDTO나 다른 직접 응답인 경우 그대로 반환
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 인증 스토어에서 로그아웃 처리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
