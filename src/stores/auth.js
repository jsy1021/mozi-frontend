import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/index.js';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const token = ref(localStorage.getItem('accessToken'));
  const isLoading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!token.value && isTokenValid.value);
  const userInfo = computed(() => user.value);
  const userRoles = computed(() => user.value?.roles || []);
  const hasRole = (role) => userRoles.value.includes(role);

  // JWT 토큰 유효성 검사
  const isTokenValid = computed(() => {
    if (!token.value) return false;

    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  });

  // stores/auth.js
  const login = async (credentials) => {
    try {
      isLoading.value = true;

      const response = await api.post('/auth/login', {
        loginId: credentials.loginId,
        password: credentials.password,
      });

      console.log('로그인 응답:', response); // 디버깅용

      // 성공 응답 처리
      if (response.token && response.user) {
        token.value = response.token;
        user.value = {
          loginId: response.user.login_id,
          email: response.user.email,
          roles: response.user.roles,
        };

        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('userInfo', JSON.stringify(user.value));

        return { success: true };
      } else {
        return {
          success: false,
          message: '로그인 응답 형식이 올바르지 않습니다.',
        };
      }
    } catch (error) {
      console.error('로그인 에러:', error);

      // 에러 응답에서 메시지 추출
      let errorMessage = '로그인에 실패했습니다.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        // 단순 문자열 응답인 경우
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      isLoading.value = false;
    }
  };
  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');

    // 로그아웃 시 메인 페이지로 이동하지 않고 현재 위치 유지
    // 라우터에서 자동으로 로그인 페이지로 리다이렉트됨
  };

  const initializeAuth = () => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('userInfo');

    if (savedToken && savedUser) {
      try {
        token.value = savedToken;
        user.value = JSON.parse(savedUser);
      } catch (error) {
        console.error('사용자 정보 복원 실패:', error);
        logout();
      }
    }
  };

  // 회원가입
  const signup = async (userData) => {
    try {
      isLoading.value = true;

      const response = await api.post('/users/signup', {
        loginId: userData.loginId,
        username: userData.username,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        birthDate: userData.birthDate,
      });

      // BaseResponse<BaseResponseStatus> 형태
      if (response.success || response.code === 200) {
        return { success: true, message: '회원가입이 완료되었습니다.' };
      } else {
        throw new Error(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '회원가입에 실패했습니다.',
      };
    } finally {
      isLoading.value = false;
    }
  };

  // 아이디 중복 확인
  const checkUsername = async (loginId) => {
    try {
      const response = await api.get(`/users/check-username/${loginId}`);
      // BaseResponse<Boolean> 형태에서 result가 실제 boolean 값
      return response.result;
    } catch (error) {
      console.error('아이디 중복 확인 에러:', error);
      return false;
    }
  };

  // 마이페이지 정보 조회
  const getMyPageInfo = async () => {
    try {
      const response = await api.get('/mypage');
      // BaseResponse<MyPageResponseDTO> 형태
      return response.data;
    } catch (error) {
      console.error('마이페이지 정보 조회 에러:', error);
      throw error;
    }
  };

  // 비밀번호 확인
  const confirmPassword = async (password) => {
    try {
      const response = await api.post('/mypage/confirm-password', { password });
      return response.success || response.code === 200;
    } catch (error) {
      return false;
    }
  };

  return {
    // State
    user,
    token,
    isLoading,

    // Getters
    isAuthenticated,
    userInfo,
    userRoles,
    isTokenValid,
    hasRole,

    // Actions
    login,
    logout,
    signup,
    initializeAuth,
    checkUsername,
    getMyPageInfo,
    confirmPassword,
  };
});
