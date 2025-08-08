import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/index.js';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const token = ref(null);
  const isLoading = ref(false);

  // 토큰 유효성 검사 및 자동 정리
  const validateAndCleanToken = () => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('userInfo');

    console.log('🔥 validateAndCleanToken:', {
      hasStoredToken: !!storedToken,
      hasStoredUser: !!storedUser,
      currentToken: !!token.value,
      currentUser: !!user.value,
    });

    if (!storedToken || !storedUser) {
      token.value = null;
      user.value = null;
      return false;
    }

    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isValid = payload.exp > currentTime + 30; // 30초 여유

      if (isValid) {
        // ✅ 토큰과 사용자 정보 둘 다 설정
        token.value = storedToken;
        if (!user.value) {
          // 사용자 정보가 없을 때만 설정
          user.value = JSON.parse(storedUser);
        }

        console.log('🔥 토큰 복원 완료:', {
          token: !!token.value,
          user: !!user.value,
        });

        return true;
      } else {
        console.log('토큰 만료 - 자동 정리');
        cleanupAuth();
        return false;
      }
    } catch (error) {
      console.error('토큰 파싱 실패:', error);
      cleanupAuth();
      return false;
    }
  };

  // 인증 정보 정리
  const cleanupAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
  };

  // Getters
  const isAuthenticated = computed(() => {
    return validateAndCleanToken() && !!user.value;
  });
  // Getters 섹션에 추가
  const needsPersonalInfo = computed(() => {
    if (!user.value) return false;
    return user.value.needsPersonalInfo || false;
  });

  const personalInfoPromptDays = computed(() => {
    return user.value?.personalInfoDaysRemaining || 0;
  });

  const userInfo = computed(() => user.value);
  const userRoles = computed(() => user.value?.roles || []);
  const hasRole = (role) => userRoles.value.includes(role);

  // 토큰 설정 (로그인 성공 시)
  const setAuthData = (authData) => {
    token.value = authData.token;
    user.value = {
      loginId: authData.user.login_id || authData.user.loginId,
      email: authData.user.email,
      roles: authData.user.roles,
    };

    localStorage.setItem('accessToken', authData.token);
    localStorage.setItem('userInfo', JSON.stringify(user.value));
  };
  // 에러 메시지 추출 유틸
  const extractErrorMessage = (error) => {
    if (error.isAuthError) {
      return error.message;
    }

    if (error.response?.data) {
      // BaseResponse 형식
      if (error.response.data.message) {
        return error.response.data.message;
      }
      // 단순 문자열 응답
      if (typeof error.response.data === 'string') {
        return error.response.data;
      }
    }

    return error.message || '요청 처리 중 오류가 발생했습니다.';
  };
  // OAuth 리다이렉트 관리
  const getOAuthRedirect = () => {
    const redirectPath =
      sessionStorage.getItem('oauthRedirect') ||
      router.currentRoute.value.query.redirect ||
      '/';

    sessionStorage.removeItem('oauthRedirect');
    return redirectPath !== '/auth/LoginPage' ? redirectPath : '/';
  };

  const setOAuthRedirect = (path) => {
    if (path && path !== '/auth/LoginPage') {
      sessionStorage.setItem('oauthRedirect', path);
    }
  };

  // 로그인
  const login = async (credentials) => {
    try {
      isLoading.value = true;

      const response = await api.post('/auth/login', {
        loginId: credentials.loginId,
        password: credentials.password,
      });

      if (response.token && response.user) {
        setAuthData(response);
        return { success: true };
      } else {
        return {
          success: false,
          message: '로그인 응답 형식이 올바르지 않습니다.',
        };
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      return {
        success: false,
        message: extractErrorMessage(error),
      };
    } finally {
      isLoading.value = false;
    }
  };

  // OAuth 로그인 처리
  const processOAuthLogin = (authData) => {
    setAuthData(authData);

    const redirectPath = getOAuthRedirect();
    router.push(redirectPath);
  };

  // 로그아웃
  const logout = () => {
    cleanupAuth();

    // 현재 페이지가 인증이 필요한 페이지라면 로그인 페이지로
    const currentRoute = router.currentRoute.value;
    const requiresAuth = currentRoute.matched.some(
      (record) => record.meta?.requiresAuth
    );

    if (requiresAuth) {
      router.push({
        name: 'loginPage',
        query: { redirect: currentRoute.fullPath },
      });
    }
  };

  // 강제 로그아웃 (토큰 만료 등)
  const forceLogout = (redirectPath = null) => {
    cleanupAuth();

    const currentPath = redirectPath || router.currentRoute.value.fullPath;
    router.push({
      name: 'loginPage',
      query: {
        redirect: currentPath !== '/auth/LoginPage' ? currentPath : '/',
      },
    });
  };

  // 앱 초기화 시 인증 상태 복원
  const initializeAuth = () => {
    const savedUser = localStorage.getItem('userInfo');
    const savedToken = localStorage.getItem('accessToken');

    console.log('🔥 저장된 데이터:', {
      hasToken: !!savedToken,
      hasUser: !!savedUser,
    });
    if (savedToken && savedUser) {
      try {
        // 토큰 유효성 체크
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const isValid = payload.exp > currentTime + 30;

        console.log('🔥 토큰 유효성:', isValid);

        if (isValid) {
          // ✅ 토큰과 사용자 정보 동시에 설정
          token.value = savedToken;
          user.value = JSON.parse(savedUser);

          console.log('🔥 인증 상태 복원 완료:', {
            token: !!token.value,
            user: !!user.value,
            userData: user.value,
          });
        } else {
          console.log('🔥 토큰 만료 - 정리');
          cleanupAuth();
        }
      } catch (error) {
        console.error('🔥 복원 실패:', error);
        cleanupAuth();
      }
    } else {
      console.log('🔥 저장된 인증 정보 없음');
    }
  };

  // 라우터 가드용 체크
  const canAccess = (route) => {
    const requiresAuth = route.matched.some(
      (record) => record.meta?.requiresAuth
    );

    if (!requiresAuth) {
      return true;
    }

    return isAuthenticated.value;
  };

  // 인증이 필요 없는 페이지들
  const isPublicRoute = (routeName) => {
    const publicRoutes = [
      'loginPage',
      'join',
      'findID',
      'findPasswd',
      'ResetPasswdPage',
      'kakaoCallback',
      'naverCallback',
      'googleCallback',
    ];

    return publicRoutes.includes(routeName);
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

      if (response.success || response.code === 200) {
        return { success: true, message: '회원가입이 완료되었습니다.' };
      } else {
        throw new Error(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error),
      };
    } finally {
      isLoading.value = false;
    }
  };

  // 아이디 중복 확인
  const checkUsername = async (loginId) => {
    try {
      const response = await api.get(`/users/check-username/${loginId}`);
      return response.result;
    } catch (error) {
      console.error('아이디 중복 확인 에러:', error);
      return false;
    }
  };

  // Actions 섹션에 추가
  const checkPersonalInfoStatus = async () => {
    try {
      console.log('🔥 퍼스널 정보 상태 확인 시작');

      const response = await api.get('/profile/status');

      console.log('🔥 퍼스널 정보 상태 응답:', response);

      // 사용자 정보에 퍼스널 정보 상태 추가
      if (user.value && response.result) {
        user.value.hasPersonalInfo = response.result.has_personal_info;
        user.value.needsPersonalInfo = response.result.needs_prompt;
        user.value.personalInfoDaysRemaining = response.result.days_remaining;
        user.value.createdAt = response.result.created_at;

        // localStorage 업데이트
        localStorage.setItem('userInfo', JSON.stringify(user.value));
      }

      return {
        hasPersonalInfo:
          response.result?.has_personal_info ??
          response.result?.hasPersonalInfo ??
          false,
        needsPrompt:
          response.result?.needs_prompt ??
          response.result?.needsPrompt ??
          false,
        daysRemaining:
          response.result?.days_remaining ??
          response.result?.daysRemaining ??
          0,
      };
    } catch (error) {
      console.error('🔥 퍼스널 정보 상태 확인 실패:', error);
      return {
        hasPersonalInfo: false,
        needsPrompt: false,
        daysRemaining: 0,
      };
    }
  };

  const markPersonalInfoCompleted = async () => {
    try {
      // 상태 다시 확인하여 최신 정보로 업데이트
      await checkPersonalInfoStatus();

      console.log('🔥 퍼스널 정보 완료 상태 업데이트');
    } catch (error) {
      console.error('🔥 퍼스널 정보 상태 업데이트 실패:', error);
    }
  };

  // 마이페이지 정보 조회
  const getMyPageInfo = async () => {
    try {
      const response = await api.get('/mypage');
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
    hasRole,

    // Utils
    canAccess,
    isPublicRoute,
    getOAuthRedirect,
    setOAuthRedirect,

    // Actions
    login,
    logout,
    forceLogout,
    signup,
    initializeAuth,
    checkUsername,
    getMyPageInfo,
    confirmPassword,
    processOAuthLogin,
    needsPersonalInfo,
    personalInfoPromptDays,
    checkPersonalInfoStatus,
    markPersonalInfoCompleted,
  };
});
