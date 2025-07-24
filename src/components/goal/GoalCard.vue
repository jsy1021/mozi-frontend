<template>
  <div class="goal-card" @click="handleCardClick">
    <!-- 목표 이름과 버튼 -->
    <div class="card-header">
      <div class="goal-info">
        <h3 class="goal-name">{{ goal.name }}</h3>
      </div>
      <div class="action-buttons">
        <button class="edit-btn" @click.stop="goToEdit" aria-label="목표 수정">
          <i class="fas fa-edit"></i>
        </button>
        <button
          class="delete-btn"
          @click.stop="showDeleteModal = true"
          aria-label="목표 삭제"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <!-- 진행률 바 -->
    <div class="progress-section">
      <ProgressBar
        :current="goal.currentAmount"
        :target="goal.targetAmount"
        :progress="goal.progress"
      />
    </div>

    <!-- 금액 정보 -->
    <div class="amount-info">
      <span class="current-amount">{{
        formatCurrency(goal.currentAmount)
      }}</span>
      <span class="divider">/</span>
      <span class="target-amount">{{ formatCurrency(goal.targetAmount) }}</span>
    </div>
  </div>

  <!-- 삭제 확인 모달 -->
  <div
    v-if="showDeleteModal"
    class="modal-overlay"
    @click="showDeleteModal = false"
  >
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>목표 삭제</h3>
      </div>
      <div class="modal-body">
        <p>'{{ goal.name }}' 목표를 정말 삭제하시겠습니까?</p>
        <p class="warning-text">삭제된 목표는 복구할 수 없습니다.</p>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="showDeleteModal = false">
          취소
        </button>
        <button class="confirm-btn" @click="confirmDelete">삭제</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ProgressBar from './ProgressBar.vue';

const router = useRouter();
const showDeleteModal = ref(false);

// Props 정의
const props = defineProps({
  goal: {
    type: Object,
    required: true,
  },
});

// Emits 정의
const emit = defineEmits(['delete', 'click']);

// 카드 클릭 핸들러
const handleCardClick = () => {
  emit('click', props.goal.id);
};

// 수정 페이지로 이동
const goToEdit = () => {
  router.push({
    name: 'goalEdit',
    params: { goalId: props.goal.id },
  });
};

// 삭제 확인
const confirmDelete = () => {
  emit('delete', props.goal.id);
  showDeleteModal.value = false;
};

// 금액 포맷팅 함수
const formatCurrency = (amount) => {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  } else {
    return `${amount.toLocaleString()}원`;
  }
};
</script>

<style scoped>
.goal-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
}

.goal-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.goal-info {
  display: flex;
  align-items: center;
}

.goal-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #666;
}

.edit-btn:hover {
  background-color: #f8f9fa;
  color: #333;
}

.delete-btn:hover {
  background-color: #fff5f5;
  color: #dc3545;
}

.progress-section {
  margin-bottom: 12px;
}

.amount-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.current-amount {
  font-weight: 600;
  color: #333;
}

.divider {
  color: #999;
}

.target-amount {
  color: #666;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
  line-height: 1.5;
}

.warning-text {
  font-size: 14px !important;
  color: #dc3545 !important;
}

.modal-footer {
  padding: 10px 20px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #f8f9fa;
  color: #666;
}

.cancel-btn:hover {
  background-color: #e9ecef;
}

.confirm-btn {
  background-color: #dc3545;
  color: white;
}

.confirm-btn:hover {
  background-color: #c82333;
}
</style>
