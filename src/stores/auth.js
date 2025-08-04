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

  // Actions
  const login = async (credentials) => {
    try {
      isLoading.value = true;

      // 백엔드 로그인 API 호출
      const response = await api.post('/auth/login', {
        loginId: credentials.loginId,
        password: credentials.password,
      });

      // 백엔드 응답 구조에 맞춰 처리
      // response.data는 AuthResultDTO 형태
      if (response.token && response.user) {
        token.value = response.token;
        user.value = {
          loginId: response.user.login_id,
          email: response.user.email,
          roles: response.user.roles,
        };

        // localStorage에 저장
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('userInfo', JSON.stringify(user.value));

        return { success: true };
      } else {
        throw new Error('로그인 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      return {
        success: false,
        message: error.response?.data?.message || '로그인에 실패했습니다.',
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
