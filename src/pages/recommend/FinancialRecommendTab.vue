<template>
  <div class="recommendations">
    
    <div v-if="recommendations && recommendations.length">
      <div v-for="goal in recommendations" :key="goal.goalId" class="goal-section">
        <h4 class="goal-title mb-2">{{ goal.goalName }}</h4>

        <div v-if="goal.recommendedProducts && goal.recommendedProducts.length">
          <div
            v-for="product in goal.recommendedProducts"
            :key="product.productId"
            class="financial-card"
          >
            <div class="card-header">
              <!-- ✅ getBankLogoUrl 정상 호출 -->
              <img
                class="bank-logo"
                :src="getBankLogoUrl(product.bankCode)"
                alt="은행로고"
              />
              <span class="product-title">{{ product.productName }}</span>
            
              <i 
                class="fa-regular fa-bookmark bookmark"
                :class="{ 'scraped': isScraped(product) }"
                @click="toggleScrap(product)"
                style="margin-left: auto; cursor: pointer;">
              </i>
            </div>

            <div class="card-body">
              <div class="rate small-text">
                <span style="color:#888;">가입 </span>
                <span style="color:#444;">{{ product.bankName }}</span><br />
                <span style="color:#888;">금리 </span>
                <span class="main-rate">{{ product.intRate }}%({{ product.saveTrm }}개월)</span>,
                <span class="max-rate" style="color:#e74c3c;">최고 {{ product.intRate2 }}%</span>
                ({{ product.saveTrm }}개월)
              </div>
            </div>

            <div class="button-container">
              <button class="detail-btn" @click="goToDetail(product)">자세히보기</button>
            </div>
          </div>
        </div>
        <p v-else class="text-muted text-center py-3">
          추천할 상품이 없습니다.
        </p>
      </div>
    </div>
    <div v-else class="text-center text-muted py-4">
      <img src="../../../public/images/noGoal.png" alt="추천 없음" class="empty-image" />
      <p><b>아직 목표가 없어요</b></p>
      <p>목표를 세우면 더 정교한 추천을<br/> 받을 수 있어요!</p>
      <button class="set-goal-btn" @click="goToGoalPage">목표 세우러 가기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getRecommendations, getFinanceScraps, addFinanceScrap, removeFinanceScrap } from '@/api/recommendFinanceApi';
import { getBankLogoUrl } from '../search/financialSearch/util/bankLogo.js';

const router = useRouter();
const recommendations = ref([]);
const scrapedProducts = ref([]);

// 추천 상품 불러오기
onMounted(async () => {
  try {
    recommendations.value = await getRecommendations();
    await checkScrapStatus(); // 스크랩 상태 확인
  } catch (error) {
    console.error('추천 상품 불러오기 실패:', error);
    recommendations.value = [];
  }
});

const checkScrapStatus = async () => {
  try {
    const scraps = await getFinanceScraps();
    scrapedProducts.value = scraps.map(scrap =>
      scrap.productType === 'SAVING' ? scrap.product.savingId : scrap.product.depositId
    );
  } catch (error) {
    console.error('스크랩 상태 확인 실패:', error);
  }
};

const toggleScrap = async (product) => {
  const productId = product.productId;
  const productType = product.productType;

  if (!productId) {
    console.error('상품 ID가 없습니다.');
    return;
  }

  try {
    if (isScraped(product)) {
      await removeFinanceScrap(productType, productId);
      scrapedProducts.value = scrapedProducts.value.filter(id => id !== productId);
    } else {
      await addFinanceScrap(productType, productId);
      scrapedProducts.value.push(productId);
    }
  } catch (error) {
    console.error('스크랩 토글 실패:', error);
  }
};

const isScraped = (product) => scrapedProducts.value.includes(product.productId);

function goToDetail(product) {
  const productType = product.productType === 'SAVINGS' ? 'saving' : 'deposit';
  router.push(`/financialSearch/${productType}/${product.productId}`);
}

function goToGoalPage() {
  router.push('/goal');
}
</script>

<style scoped>
.recommendations {
  padding: 16px;
}
.goal-title {
  font-weight: 600;
  margin-top: 10px;
}

/* financial-card 스타일 재사용 */
.financial-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  padding: 16px 18px 12px 18px;
  margin-bottom: 16px;
  width: 100%;
  position: relative;
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}
.bank-logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}
.product-title {
  font-weight: bold;
  font-size: 1.1rem;
  color: #222;
  flex: 1;
}
.bookmark {
  color: #bdbdbd;
  font-size: 1.2rem;
  margin-left: 8px;
  transition: all 0.2s ease;
}
.bookmark.scraped {
  color: #569FFF;
}
.bookmark.scraped::before {
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
  content: "\f02e";
}
.card-body {
  font-size: 0.97rem;
  color: #444;
  margin-bottom: 8px;
}
.rate .main-rate {
  font-weight: 500;
  margin-left: 4px;
}
.rate .max-rate {
  margin-left: 4px;
}
.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.detail-btn {
  background: #f5f5f5;
  color: #aaa;
  border: none;
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 0.85rem;
  min-height: 24px;
  cursor: pointer;
}
.rate.small-text span {
  font-size: 12px;
  font-weight: 600;
}
.small-text {
  font-size: 12px;
}
.empty-recommendation {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-image {
  width: 201px;
  height: auto;
  opacity: 0.8;
}
.set-goal-btn {
  background-color: #36c18c; /* 초록색 버튼 */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  width: 200px;
  text-align: center;
}

.set-goal-btn:hover {
  background-color: #2fa477; /* hover 시 약간 어두운 초록색 */
}
</style>
