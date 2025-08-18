<template>
  <div class="personal-info-prompt">
    <div class="prompt-overlay">
      <div class="prompt-content">
        <div class="prompt-header">
          <div class="title-section">
            <h3>퍼스널 정보 입력</h3>
            <span v-if="props.remainingDays > 0" class="countdown">D-{{ props.remainingDays }}</span>
          </div>
          <button @click="$emit('dismiss')" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="prompt-body">
          <p>더 나은 서비스 제공을 위해 퍼스널 정보를 입력해주세요.</p>
          <div class="info-notice">
            <i class="fas fa-info-circle notice-icon"></i>
            <span class="notice-text">입력된 정보는 다음 기능에 활용됩니다</span>
          </div>
          <div class="info-items">
            <div class="info-item">
              <i class="fas fa-user-circle"></i>
              <span>프로필 상세 정보</span>
            </div>

            <div class="info-item">
              <i class="fas fa-bullseye"></i>
              <span>맞춤형 정책 추천 </span>
            </div>
          </div>
        </div>

        <div class="prompt-footer">
          <button @click="handleNeverShow" class="btn-never">
            <i class="fas fa-times-circle"></i>
            다시는 보지 않기
          </button>
          <div class="main-buttons">
            <button @click="$emit('dismiss')" class="btn-secondary">
              <i class="fas fa-clock"></i>
              나중에
            </button>
            <button @click="goToPersonalInfo" class="btn-primary">
              <i class="fas fa-edit"></i>
              입력하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// Props 정의
const props = defineProps({
  remainingDays: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['dismiss']);

const goToPersonalInfo = () => {
  emit('dismiss');
  router.push('/user/personal');
};
const handleNeverShow = () => {
  // 현재 사용자 정보 가져오기
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const loginId = userInfo.loginId;

  if (loginId) {
    // 사용자별로 설정 저장
    localStorage.setItem(`personalInfoPromptNeverShow_${loginId}`, 'true');
    console.log('🔥 다시 보지 않기 설정 저장됨 - 사용자:', loginId);
  }

  // 프롬프트 닫기
  emit('dismiss');
};
</script>

<style scoped>
.personal-info-prompt {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.prompt-overlay {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.prompt-content {
  background: white;
  border-radius: 16px;
  max-width: 340px; /* 400px에서 340px로 축소 */
  width: 90%; /* 좌우 여백 확보 */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.prompt-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #212529;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.countdown {
  color: #856404;
  font-weight: 600;
  font-size: 12px;
  background-color: #fff3cd;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #ffeaa7;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.prompt-body {
  padding: 0 24px 20px;
}

.prompt-body p {
  color: #6c757d;
  margin: 0 0 20px;
  line-height: 1.5;
}

.info-notice {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-icon {
  color: #856404;
  font-size: 16px;
  flex-shrink: 0;
}

.notice-text {
  color: #495057;
  font-size: 14px;
  font-weight: 500;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.info-item i {
  color: #36c18c;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.info-item span {
  color: #495057;
  font-size: 14px;
  font-weight: 500;
}

.prompt-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 24px 24px;
}

.main-buttons {
  display: flex;
  gap: 12px;
}

.btn-never {
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-never:hover {
  background-color: #e9ecef;
  color: #495057;
}

.btn-never i {
  font-size: 12px;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-secondary i,
.btn-primary i {
  font-size: 13px;
}

.btn-secondary {
  background-color: #e9ecef;
  color: #6c757d;
}

.btn-secondary:hover {
  background-color: #dee2e6;
  color: #495057;
}

.btn-primary {
  background-color: #36c18c;
  color: white;
}

.btn-primary:hover {
  background-color: #2da471;
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .prompt-overlay {
    padding: 16px;
  }

  .prompt-header,
  .prompt-body,
  .prompt-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .prompt-header h3 {
    font-size: 18px;
  }
}
</style>
