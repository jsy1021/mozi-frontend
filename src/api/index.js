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

// 응답 인터셉터 수정
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      if (response.data.hasOwnProperty('result')) {
        return response.data;
      }
      return response.data;
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const currentRoute = router.currentRoute.value.name;

    // 로그인 관련 페이지에서는 401 에러를 자동 처리하지 않음
    const authPages = ['loginPage', 'join', 'findPasswd', 'ResetPasswdPage'];

    if (status === 401 && !authPages.includes(currentRoute)) {
      console.log('인증 실패 - 로그인 페이지로 이동');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userInfo');
      router.push({ name: 'loginPage' });
    }

    return Promise.reject(error);
  }
);

export default api;
