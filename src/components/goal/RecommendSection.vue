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
    required: true
  }
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
      <div class="policy" style="margin-bottom: 0; padding-bottom: 0;">
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
        <PolicyRecommendCard :goal-id="props.goalId"/>
      </div>

      <!-- 금융 -->
      <div class="financial" style="margin-top: 0; padding-top: 0;">
        <div class="card-top">
          <div class="card-title" >
            <p>맞춤형 금융 상품</p>
          </div>
          <!-- <div class="plusbtn">
            <router-link :to="`/goal/${goalId}/recommendations?tab=product`">
              <i class="fa-solid fa-plus"></i>
            </router-link>
          </div> -->
        </div>
        <!-- 금융 카드 -->
        <FinancialRecommendCard :goal-id="props.goalId"/>
      </div>

    </div>
  <!-- </div> -->
</template>

<style scoped>
.goal-recommend {
  margin: 20px;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  /* text-align: center; */
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
}
.goal-recommend > div {
  margin: 10px;
  /* border: 1px solid #d9d9d9; */
  border-radius: 5px;
  /* text-align: center; */
  /* box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3); */

  /* display: flex; */
  flex-direction: column;
  align-items: center;
}

/* 카드 */
.card-top {
  display: flex;
  text-align: center;
  margin-left: 100px;
}

.card-title {
  text-align: center;
  /* margin-top: 0; */
}

.card-title > p {
  font-size: 16px;
  font-weight: 400;
  text-align: center;
}

.plusbtn {
  /* margin-top: 15px;  */
  margin-left: 80px;
}

/* 슬라이드 관련 */
/* .goal-recommend {
  overflow: hidden;
}

.carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
  margin-bottom: 15px;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.carousel-slide {
  min-width: 100%;
  box-sizing: border-box;
} */

/* 인디케이터 */
/* .indicators {
  text-align: center;
  margin-top: 5px;
}

.indicators span {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #ccc;
  border-radius: 50%;
  margin: 0 4px;
  cursor: pointer;
}

.indicators span.active {
  background-color: #333;
} */
</style>
