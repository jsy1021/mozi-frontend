// api/index.js
import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// auth store는 순환참조 방지를 위해 인터셉터 내부에서 동적 import
let authStore = null;

const getAuthStore = async () => {
  if (!authStore) {
    const { useAuthStore } = await import('@/stores/auth');
    authStore = useAuthStore();
  }
  return authStore;
};

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

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // BaseResponse 형식 처리
    if (response.data && typeof response.data === 'object') {
      if (response.data.hasOwnProperty('result')) {
        return response.data;
      }
      return response.data;
    }
    return response.data;
  },
  async (error) => {
    const status = error.response?.status;
    const store = await getAuthStore();

    // 401 에러 처리
    if (status === 401) {
      // 현재 페이지가 공개 페이지가 아닌 경우에만 강제 로그아웃
      const currentRoute = (await import('@/router')).default.currentRoute
        .value;

      if (!store.isPublicRoute(currentRoute.name)) {
        console.log('인증 실패 - 강제 로그아웃 처리');

        // 사용자 친화적인 에러 메시지
        const friendlyError = new Error('로그인이 필요합니다.');
        friendlyError.isAuthError = true;

        // 강제 로그아웃 (현재 페이지 정보 포함)
        store.forceLogout(currentRoute.fullPath);

        return Promise.reject(friendlyError);
      }
    }

    // 기타 에러는 그대로 전달
    return Promise.reject(error);
  }
);

export default api;
