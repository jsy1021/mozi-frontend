<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api/index.js';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref('');
const message = ref('로그인 처리 중...');

// OAuth 제공자 감지
const getProvider = () => {
  const path = route.path;
  if (path.includes('kakao')) return 'kakao';
  if (path.includes('naver')) return 'naver';
  if (path.includes('google')) return 'google';
  return 'unknown';
};

onMounted(async () => {
  try {
    const code = route.query.code;
    const error_code = route.query.error;
    const provider = getProvider();

    console.log(`${provider} OAuth 콜백 수신:`, {
      code: code?.substring(0, 10) + '...',
      error: error_code,
    });

    // 에러 처리
    if (error_code) {
      error.value = `${provider} 로그인이 취소되었습니다.`;
      message.value = '로그인 페이지로 이동합니다...';
      setTimeout(() => {
        router.push({ name: 'loginPage' });
      }, 2000);
      return;
    }

    // 인증 코드 확인
    if (!code) {
      error.value = '인증 코드를 받지 못했습니다.';
      message.value = '로그인 페이지로 이동합니다...';
      setTimeout(() => {
        router.push({ name: 'loginPage' });
      }, 2000);
      return;
    }

    // 백엔드에 인증 코드 전송
    console.log(`${provider} OAuth 처리 시작`);
    const response = await api.get(`/oauth/${provider}/callback?code=${code}`);

    console.log('백엔드 응답:', response);

    // 응답 데이터 추출
    let authResult;
    if (response.result) {
      authResult = response.result;
    } else if (response.token) {
      authResult = response;
    } else {
      throw new Error('응답 형태를 인식할 수 없습니다.');
    }

    // 인증 데이터 확인
    if (authResult.token && authResult.user) {
      console.log(`${provider} 로그인 성공`);

      // auth store를 통해 인증 처리 및 리다이렉트
      authStore.processOAuthLogin(authResult);

      message.value = '로그인 성공! 이동 중...';
    } else {
      console.error('토큰 또는 사용자 정보 없음:', authResult);
      throw new Error('토큰 또는 사용자 정보가 없습니다.');
    }
  } catch (err) {
    console.error('OAuth 콜백 처리 실패:', err);

    // 에러 메시지 설정
    if (err.response?.status === 404) {
      error.value = '백엔드 API를 찾을 수 없습니다.';
    } else if (err.response?.status === 500) {
      error.value = '서버 내부 오류가 발생했습니다.';
    } else if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else {
      error.value = err.message || '로그인 처리 중 오류가 발생했습니다.';
    }

    message.value = '로그인 페이지로 이동합니다...';
    setTimeout(() => {
      router.push({ name: 'loginPage' });
    }, 3000);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="oauth-callback">
    <!-- MoZi 브랜드 헤더 -->
    <div class="header">
      <h1 class="logo">MoZi</h1>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="main-content">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="status-container">
        <div class="loading-section">
          <div class="spinner">
            <div class="spinner-inner"></div>
          </div>
          <h2 class="status-title">{{ message }}</h2>
          <p class="status-subtitle">잠시만 기다려주세요</p>
        </div>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="status-container">
        <div class="error-section">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="m15 9-6 6m0-6 6 6" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <h2 class="status-title error-title">로그인 실패</h2>
          <p class="status-message">{{ error }}</p>
          <p class="status-subtitle">{{ message }}</p>
        </div>
      </div>

      <!-- 성공 상태 -->
      <div v-else class="status-container">
        <div class="success-section">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
          <h2 class="status-title success-title">환영합니다!</h2>
          <p class="status-message">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.oauth-callback {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

/* MoZi 스타일 헤더 */
.header {
  padding: 20px;
  background-color: white;
  border-bottom: 1px solid #e9ecef;
  margin-top: 5rem;
}

.logo {
  color: #36c18c;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}

/* 메인 컨텐츠 */
.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.status-container {
  width: 100%;
  max-width: 400px;
}

/* 공통 섹션 스타일 */
.loading-section,
.error-section,
.success-section {
  background: white;
  padding: 48px 32px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

/* 로딩 스타일 */
.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
  position: relative;
}

.spinner-inner {
  width: 100%;
  height: 100%;
  border: 3px solid #f1f3f5;
  border-top: 3px solid #36c18c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 아이콘 스타일 */
.error-icon,
.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon {
  background-color: #fef2f2;
  color: #dc2626;
}

.success-icon {
  background-color: #f0fdf4;
  color: #16a34a;
}

/* 텍스트 스타일 */
.status-title {
  font-size: 24px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.error-title {
  color: #dc2626;
}

.success-title {
  color: #16a34a;
}

.status-message {
  font-size: 16px;
  color: #6c757d;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.status-subtitle {
  font-size: 14px;
  color: #adb5bd;
  margin: 0;
  line-height: 1.4;
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .header {
    padding: 16px 20px;
  }

  .logo {
    font-size: 28px;
  }

  .main-content {
    padding: 20px 16px;
  }

  .loading-section,
  .error-section,
  .success-section {
    padding: 40px 24px;
    border-radius: 12px;
  }

  .spinner {
    width: 48px;
    height: 48px;
  }

  .error-icon,
  .success-icon {
    width: 56px;
    height: 56px;
  }

  .status-title {
    font-size: 20px;
  }

  .status-message {
    font-size: 15px;
  }

  .status-subtitle {
    font-size: 13px;
  }
}

/* 애니메이션 */
.loading-section,
.error-section,
.success-section {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
