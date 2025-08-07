<script setup>
import RecommendCard from './RecommendCard.vue';
import db from '@/data/db.json';

import { useRoute } from 'vue-router';
import { ref, onMounted, onBeforeUnmount } from 'vue';

// import FinancialRecommendTab from '@/pages/recommend/FinancialRecommendTab.vue';
import FinancialRecommendCard from './FinancialRecommendCard.vue';
// import policyRecommendTab from '@/pages/recommend/policyRecommendTab.vue';
import PolicyRecommendCard from './PolicyRecommendCard.vue';

const route = useRoute();
const goalId = route.params.goalId;

const props = defineProps({
  goalId: {
    type: Number,
    required: true,
  },
});

console.log(typeof props.goalId);

// < 정책 >
// const policies = db.YouthPolicy

// 특정 정책 ID로 하나만 추출
// const selectedPolicyId = 1;
// const policy = db.YouthPolicy.find((p) => p.policy_id === selectedPolicyId);

// < 금융 >
// const depositProduct = db.DepositProduct.find((p) => p.deposit_id === 1);
// const depositOption = db.DepositOption.find((o) => o.deposit_id === 1);

// const productData = depositProduct
//   ? {
//       ...depositProduct,
//       intr_rate: depositOption?.intr_rate ?? null,
//       intr_rate2: depositOption?.intr_rate2 ?? null,
//     }
//   : null;

// < 슬라이드 관련 >
// 여러 정책 데이터 예시 (3개만 사용)
// const policies = db.YouthPolicy.slice(0, 3);

// // 여러 금융 상품 예시
// const productList = db.DepositProduct.slice(0, 3).map((prod) => {
//   const option = db.DepositOption.find((o) => o.deposit_id === prod.deposit_id);
//   return {
//     ...prod,
//     intr_rate: option?.intr_rate ?? null,
//     intr_rate2: option?.intr_rate2 ?? null,
//   };
// });

// 상태
// const currentPolicyIndex = ref(0);
// const currentProductIndex = ref(0);

// let policyTimer = null;
// let productTimer = null;

// 자동 슬라이드
// onMounted(() => {
//   policyTimer = setInterval(() => {
//     currentPolicyIndex.value = (currentPolicyIndex.value + 1) % policies.length;
//   }, 5000);

//   productTimer = setInterval(() => {
//     currentProductIndex.value =
//       (currentProductIndex.value + 1) % productList.length;
//   }, 5000);
// });

// onBeforeUnmount(() => {
//   clearInterval(policyTimer);
//   clearInterval(productTimer);
// });
</script>

<template>
  <!-- <h1>추천 영역 (목표 상세 내)</h1> -->

  <!-- <div> -->
  <div class="goal-recommend">
    <!-- 정책 -->
    <div class="policy" style="margin-bottom: 0; padding-bottom: 0">
      <div class="card-top">
        <div class="card-title">
          <p>맞춤형 정책 제안</p>
        </div>
        <!-- <div class="plusbtn">
            <router-link :to="`/goal/${goalId}/recommendations?tab=policy`">
              <i class="fa-solid fa-plus"></i>
            </router-link>
          </div> -->
      </div>
      <!-- 정책 카드 -->
      <PolicyRecommendCard :goal-id="props.goalId" />
    </div>

    <!-- 금융 -->
    <div class="financial" style="margin-top: 0; padding-top: 0">
      <div class="card-top">
        <div class="card-title">
          <p>맞춤형 금융 상품</p>
        </div>
        <!-- <div class="plusbtn">
            <router-link :to="`/goal/${goalId}/recommendations?tab=product`">
              <i class="fa-solid fa-plus"></i>
            </router-link>
          </div> -->
      </div>
      <!-- 금융 카드 -->
      <FinancialRecommendCard :goal-id="props.goalId" />
    </div>
  </div>
  <!-- </div> -->
</template>

<style scoped>
.goal-recommend {
  margin: 20px;
  border: 1px solid #e8f5f0;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(54, 193, 140, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
  overflow: hidden;
  transition: all 0.3s ease;
}

.goal-recommend:hover {
  box-shadow: 0 8px 32px rgba(54, 193, 140, 0.12);
  transform: translateY(-2px);
}

.goal-recommend > div {
  margin: 0;
  border-radius: 0;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  position: relative;
}

/* 정책과 금융 상품 섹션 구분선 */
.financial {
  border-top: 1px solid #f0f2f5;
  background: linear-gradient(135deg, #f8fffe 0%, #ffffff 100%);
}

/* 카드 헤더 */
.card-top {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
  width: 100%;
  position: relative;
}

.card-title {
  text-align: center;
  flex: 1;
}

.card-title > p {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  text-align: center;
  position: relative;
}

/* 제목에 아이콘 추가 */
.policy .card-title > p::before {
  content: '🏛️';
  margin-right: 8px;
  font-size: 14px;
}

.financial .card-title > p::before {
  content: '💰';
  margin-right: 8px;
  font-size: 14px;
}

/* 플러스 버튼 스타일 (필요시 사용) */
.plusbtn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.plusbtn a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #36c18c 0%, #2f9b78 100%);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(54, 193, 140, 0.2);
}

.plusbtn a:hover {
  background: linear-gradient(135deg, #2f9b78 0%, #237a5f 100%);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(54, 193, 140, 0.3);
}

.plusbtn i {
  font-size: 14px;
}

/* 정책 섹션 특별 스타일 */
.policy {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
}

/* 금융 섹션 특별 스타일 */
.financial {
  position: relative;
}

/* 섹션 구분을 위한 미묘한 효과 */
.policy::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e8f5f0, transparent);
}

/* 호버 효과 */
.policy:hover,
.financial:hover {
  background: linear-gradient(135deg, #f8fffe 0%, #e8f5f0 100%);
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .goal-recommend {
    margin: 16px;
  }

  .goal-recommend > div {
    padding: 10px 12px;
  }

  .card-title > p {
    font-size: 15px;
  }

  .plusbtn a {
    width: 28px;
    height: 28px;
  }

  .plusbtn i {
    font-size: 12px;
  }
}

/* 애니메이션 효과 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.goal-recommend {
  animation: slideInUp 0.6s ease-out;
}

/* 스크롤 시 나타나는 효과 */
.policy,
.financial {
  transition: all 0.3s ease;
}

/* 포커스 상태 개선 */
.plusbtn a:focus {
  outline: 2px solid #36c18c;
  outline-offset: 2px;
}
</style>
