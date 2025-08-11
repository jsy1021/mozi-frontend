<!-- 예금 상품 상세 페이지 -->
<template>
  <div class="deposit-detail-container">
    <!-- 헤더 -->
    <div class="header">
      <div class="page-header mb-3">
      <span class="back-btn" @click="goBack">
        <i class="fa-solid fa-angle-left"></i>
      </span>
      <div style="font-size: 18px; font-weight: bold; color: #757575">
        상품 상세 정보
      </div>

      </div>
    </div>

    <!-- 금리 정보 -->
    <div class="rate-section">
      <div class="bank-info">
        <img :src="deposit?.logoUrl" alt="은행로고" class="bank-logo" />
        <div class="product-info">
          <!-- ✅ 상품명과 같은 가로줄에 아이콘 배치 -->
          <div class="product-name-row">
            <h1 class="product-name">{{ deposit?.productName }}</h1>
            <i
              class="fa-regular fa-bookmark bookmark"
              :class="{ scraped: isScraped }"
              @click="toggleScrap"
              aria-label="스크랩 토글"
            ></i>
          </div>
          <p class="bank-name">{{ deposit?.bankName }}</p>
        </div>
      </div>
      <div class="rate-card">
        <div class="rate-main">
          <span class="rate-label">최고 금리</span>
          <span class="rate-value">{{ bestOption?.intrRate2 || '-' }}%</span>
        </div>
        <div class="rate-sub">
          <span class="rate-label">기본 금리</span>
          <span class="rate-value">{{ bestOption?.intrRate || '-' }}%</span>
        </div>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="action-section">
      <a
        class="action-button"
        :href="bankDepositUrl"
        target="_blank"
        rel="noopener"
      >
        공식홈에서 더 알아보기
      </a>
    </div>

    <!-- 금리 테이블 -->
    <div class="table-section">
      <h2 class="section-title">금리 정보</h2>
      <div class="table-container">
        <table class="rate-table">
          <thead>
            <tr>
              <th>기간</th>
              <th>기본 금리</th>
              <th>최고 금리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(opt, idx) in deposit?.options || []" :key="idx">
              <td>{{ opt.saveTrm }}개월</td>
              <td>{{ opt.intrRate }}%</td>
              <td class="highlight">{{ opt.intrRate2 }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 상품 정보 -->
    <div class="info-section">
      <div class="info-item">
        <span class="info-label">가입 대상</span>
        <span class="info-value">{{ deposit?.target || deposit?.joinMember || '정보 없음' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">가입 방법</span>
        <span class="info-value">{{ deposit?.joinWay || '정보 없음' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">기간</span>
        <span class="info-value">{{ periodRange }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">우대조건</span>
        <span class="info-value">{{ deposit?.specialCondition || '정보 없음' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">기타 안내</span>
        <span class="info-value">{{ deposit?.etcNote || '정보 없음' }}</span>
      </div>
    </div>

    <!-- 예금자보호 섹션 -->
    <div class="protection-section">
      <div class="protection-content">
        <h3>예금자보호</h3>
        <p>이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 "5천만원 까지"({{deposit?.bankName}}의 여타 보호상품과 합산) 보호됩니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute,useRouter } from 'vue-router';
import { getBankDepositUrl } from './util/bankDepositUrl.js';
import { getBankLogoUrl } from './util/bankLogo.js';
import api from '@/api'; // ✅ 추가: 공용 axios 인스턴스

const route = useRoute();
const deposit = ref(null);
const bankDepositUrl = ref('');
const router = useRouter();

const isScraped = ref(false);       // ✅ 스크랩 상태

const goBack = () => {
  router.back();
};

const bestOption = computed(() => {
  if (!deposit.value?.options || deposit.value.options.length === 0) return null;
  return deposit.value.options.reduce((max, cur) =>
    Number(cur.intrRate) > Number(max.intrRate) ? cur : max
  );
});

const periodRange = computed(() => {
  if (!deposit.value?.options || deposit.value.options.length === 0) return '-';
  const periods = deposit.value.options.map(opt => opt.saveTrm);
  const minPeriod = Math.min(...periods);
  const maxPeriod = Math.max(...periods);
  return minPeriod === maxPeriod ? `${minPeriod}개월` : `${minPeriod}~${maxPeriod}개월`;
});

// ✅ 스크랩 상태 확인 (리스트 컴포넌트 패턴과 동일)
const checkScrapStatus = async () => {
  try {
    const response = await api.get('/scrap/finance'); // 인터셉터에서 data만 반환
    const productId = Number(route.params.id);
    const isAlready = response.some(
      (s) => s.productType === 'DEPOSIT' && s.product?.depositId === productId
    );
    isScraped.value = isAlready;
  } catch (e) {
    console.error('스크랩 상태 확인 실패:', e);
    isScraped.value = false;
  }
};

// ✅ 스크랩 토글 (params 사용)
const toggleScrap = async () => {
  const productId = Number(route.params.id);
  if (!productId) return;

  try {
    if (isScraped.value) {
      await api.delete('/scrap/finance', { params: { productType: 'DEPOSIT', productId } });
      isScraped.value = false;
    } else {
      await api.post('/scrap/finance', null, { params: { productType: 'DEPOSIT', productId } });
      isScraped.value = true;
    }
  } catch (e) {
    console.error('스크랩 토글 실패:', e);
  }
};

onMounted(async () => {
  try {
    const depositId = route.params.id;
    // API 호출로 예금 상품 정보 가져오기
    const response = await fetch(`/api/deposits/${depositId}`);
    const data = await response.json();
    
    deposit.value = {
      ...data,
      logoUrl: getBankLogoUrl(data.bankCode)
    };
    
    bankDepositUrl.value = getBankDepositUrl(deposit.value.bankCode);

    // ✅ 진입 시 스크랩 상태 확인
    await checkScrapStatus();
  } catch (error) {
    console.error('예금 상품 정보를 가져오는데 실패했습니다:', error);
  }
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: center; /* 제목을 중앙 */
  position: relative;
}
.back-btn {
  position: absolute;
  left: 0;
  cursor: pointer;
  font-size: 1.2rem;
  color: #757575;
  padding: 4px 8px; /* 클릭 영역 확보 */
}
.page-title {
  margin: 0;
  font-weight: bold;
  text-align: center;
}
.deposit-detail-container {
  min-height: 100vh;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #191f28;
  line-height: 1.5;
}

/* 헤더 */
.header {
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #f2f3f5;
}

.bank-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.bank-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

/* ✅ 상품명 + 아이콘 같은 가로줄 */
.product-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.product-name {
  font-size: 20px;
  font-weight: 600;
  color: #191f28;
  margin: 0 0 4px 0;
  line-height: 1.3;
  flex: 1; /* ← 아이콘을 오른쪽 끝으로 밀기 */
}

/* ✅ 스크랩 아이콘 */
.bookmark {
  font-size: 1.4rem;
  color: #bdbdbd;
  cursor: pointer;
  transition: color 0.2s ease;
}
.bookmark.scraped {
  color: #569fff;
}
.bookmark.scraped::before {
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
  content: '\f02e';
}

.bank-name {
  font-size: 14px;
  color: #8b95a1;
  margin: 0;
}

/* 금리 섹션 */
.rate-section {
  padding: 24px 20px;
  background: #f8f9fa;
}

.rate-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.rate-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f3f5;
}

.rate-sub {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rate-label {
  font-size: 14px;
  color: #8b95a1;
  font-weight: 500;
}

.rate-value {
  font-size: 24px;
  font-weight: 700;
  color: #191f28;
}

.rate-main .rate-value {
  font-size: 32px;
  color: #36c18c;
}

/* 액션 버튼 */
.action-section {
  padding: 20px;
}

.action-button {
  display: block;
  width: 100%;
  background: #36c18c;
  color: white;
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.action-button:hover {
  background: #2fa477;
}

/* 테이블 섹션 */
.table-section {
  padding: 0 20px 20px 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #191f28;
  margin: 0 0 16px 0;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f2f3f5;
}

.rate-table {
  width: 100%;
  border-collapse: collapse;
}

.rate-table th {
  background: #f8f9fa;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #8b95a1;
  border-bottom: 1px solid #f2f3f5;
}

.rate-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #191f28;
  border-bottom: 1px solid #f2f3f5;
}

.rate-table tr:last-child td {
  border-bottom: none;
}

.rate-table .highlight {
  color: #2fa477;
  font-weight: 600;
}

/* 정보 섹션 */
.info-section {
  padding: 0 20px 20px 20px;
}

.info-item {
  display: flex;
  flex-direction: column; /* ← 세로 정렬 */
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #f2f3f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 12px;
  color: #8b95a1;
  font-weight: 500;
  margin-bottom: 4px; /* ← label과 value 간 여백 */
}

.info-value {
  font-size: 14px;
  color: #191f28;
  width: 100%; /* 텍스트를 줄바꿈 가능하게 */
  line-height: 1.4;
}

/* 예금자보호 섹션 */
.protection-section {
  padding: 20px;
  background: #f8f9fa;
  margin-top: 20px;
}

.protection-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #191f28;
  margin: 0 0 8px 0;
}

.protection-content p {
  font-size: 14px;
  color: #8b95a1;
  margin: 0;
  line-height: 1.5;
}

/* 반응형 */
@media (max-width: 480px) {
  .header {
    padding: 16px 16px 0 16px;
  }
  
  .rate-section {
    padding: 20px 16px;
  }
  
  .action-section {
    padding: 16px;
  }
  
  .table-section {
    padding: 0 16px 16px 16px;
  }
  
  .info-section {
    padding: 0 16px 16px 16px;
  }
  
  .protection-section {
    padding: 16px;
  }
  
  .product-name {
    font-size: 18px;
  }
  
  .rate-main .rate-value {
    font-size: 28px;
  }
  
  .rate-value {
    font-size: 20px;
  }
}
</style>
