<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getMainBank, deleteAccounts } from '@/api/accountApi';
import { useBankStore } from '@/stores/bank';

const bankList = ref([]);
const selectedBank = ref(null);
const showConfirm = ref(false);
const router = useRouter();

const bankStore = useBankStore();
const banks = bankStore.banks;

// 은행 코드로 로고 URL 찾기
const getBankLogoUrl = (bankCode) => {
  const bank = banks.find((b) => b.code === bankCode);
  return bank?.logo || '/images/financial/default.png';
};

// 연동된 은행 목록 API 호출 후, Pinia 은행 정보와 매칭하여 객체 배열로 변환
const loadBankList = async () => {
  try {
    const res = await getMainBank();
    // res.bankList가 은행 코드 배열이라고 가정
    bankList.value = res.bankList.map(
      (code) =>
        banks.find((b) => b.code === code) || {
          code,
          name: '알수없음',
          logo: '/images/financial/default.png',
        }
    );
  } catch (error) {
    console.error('은행 목록 불러오기 실패:', error);
    bankList.value = [];
  }
};

// 삭제 확정 버튼 클릭
const confirmDelete = async () => {
  if (!selectedBank.value) return;
  try {
    await deleteAccounts([selectedBank.value]);
    showConfirm.value = false;
    selectedBank.value = null;
    await loadBankList(); // 삭제 후 목록 갱신
  } catch (error) {
    console.error('삭제 실패:', error);
  }
};

// 은행 선택 (토글)
const selectBank = (code) => {
  selectedBank.value = selectedBank.value === code ? null : code;
};

// 삭제 확인 모달 열기
const openConfirm = () => {
  if (selectedBank.value) showConfirm.value = true;
};

// 뒤로가기
const goBack = () => {
  router.back();
};

// 초기 데이터 로딩
onMounted(() => {
  loadBankList();
});
</script>

<template>
  <div class="page">
    <!-- 상단 헤더 -->
    <div class="header">
      <span class="back-btn" @click="goBack">＜</span>
      <h2>은행 연동 해지</h2>
    </div>

    <!-- 은행 리스트 -->
    <div class="bank-list">
      <div
        v-for="bank in bankList"
        :key="bank.code"
        class="bank-item"
        :class="{ selected: selectedBank === bank.code }"
        @click="selectBank(bank.code)"
      >
        <img
          :src="getBankLogoUrl(bank.code)"
          alt="은행 로고"
          class="bank-logo"
        />
        <span class="bank-name">{{ bank.name }}</span>
        <span class="check-icon">
          <i v-if="selectedBank === bank.code" class="fas fa-check-circle"></i>
          <i v-else class="far fa-circle"></i>
        </span>
      </div>
    </div>

    <!-- 삭제 버튼 -->
    <button
      class="delete-button"
      @click="openConfirm"
      :disabled="!selectedBank"
    >
      삭제하기
    </button>

    <!-- 삭제 확인 모달 -->
    <div class="modal-overlay" v-if="showConfirm">
      <div class="my-modal">
        <p class="modal-title">해당 은행을 연동 해지하시겠습니까?</p>
        <p class="modal-desc">관련 정보도 같이 삭제됩니다</p>
        <div class="modal-actions">
          <button class="cancel" @click="showConfirm = false">취소</button>
          <button class="confirm" @click="confirmDelete">삭제</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 20px;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-btn {
  font-size: 24px;
  cursor: pointer;
  user-select: none;
}
.bank-list {
  margin: 20px 0;
}
.bank-item {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s, border-color 0.2s;
}
.bank-item.selected {
  border-color: teal;
  background-color: #e6f0f0;
}
.bank-logo {
  height: 32px;
  margin-right: 0.5rem;
}
.bank-name {
  flex: 1;
  font-weight: bold;
}
.check-icon i {
  font-size: 20px;
  color: teal;
}
.delete-button {
  background-color: #3d6c6c;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  width: 100%;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.delete-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.my-modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 80%;
  max-width: 300px;
}
.modal-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 18px;
}
.modal-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
}
.cancel {
  background: white;
  border: 1px solid #ccc;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
.confirm {
  background: #e34c4c;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
