<script setup>
import { ref, onMounted } from 'vue';
import { getRecommendations } from '@/api/recommendFinanceApi.js';
import { getBankLogoUrl } from '@/pages/search/financialSearch/util/bankLogo.js';
import { useRouter } from 'vue-router';
import axios from 'axios';

const props = defineProps({
  goalId: {
    type: Number,
    required: true,
  }
});

const router = useRouter();
const recommendations = ref([]);
const scrapedProducts = ref([]);
const activeIndex = ref({}); // goalId별 active 인덱스

onMounted(async () => {
  try {
    const allRecommendations = await getRecommendations();
    recommendations.value = allRecommendations.filter(goal => goal.goalId == props.goalId);
    
    recommendations.value.forEach(goal => {
      activeIndex.value[goal.goalId] = 0;
    });
  } catch (error) {
    console.error('추천 상품 불러오기 실패:', error);
    recommendations.value = [];
  }
  
  checkScrapStatus();
});

const setActive = (goalId, index) => {
  activeIndex.value[goalId] = index;
};

function goToGoalPage() {
  router.push('/goal');
}

function getBankLogo(bankCode) {
  return getBankLogoUrl(bankCode);
}

function isScraped(product) {
  return scrapedProducts.value.includes(product.productId);
}

const checkScrapStatus = async () => {
  try {
    const userId = 1;
    const response = await axios.get('/api/scrap/finance', { params: { userId } });
    scrapedProducts.value = response.data.map(scrap =>
      scrap.productType === 'SAVING' ? scrap.product.savingId : scrap.product.depositId
    );
  } catch (error) {
    console.error('스크랩 상태 확인 실패:', error);
  }
};

const toggleScrap = async (product) => {
  try {
    const userId = 1;
    const productId = product.productId;
    const productType = product.productType;

    if (isScraped(product)) {
      await axios.delete('/api/scrap/finance', { params: { userId, productType, productId } });
      scrapedProducts.value = scrapedProducts.value.filter(id => id !== productId);
    } else {
      await axios.post('/api/scrap/finance', null, { params: { userId, productType, productId } });
      scrapedProducts.value.push(productId);
    }
  } catch (error) {
    console.error('스크랩 토글 실패:', error);
  }
};

function goToDetail(product) {
  const productType = product.productType === 'SAVINGS' ? 'saving' : 'deposit';
  router.push(`/financialSearch/${productType}/${product.productId}`);
}
</script>


<template>
  <div class="recommendations">
    <div v-if="recommendations && recommendations.length">
      <div v-for="goal in recommendations" :key="goal.goalId" class="goal-section">
        <div class="carousel-container">
          <div class="carousel">
            <div
              class="carousel-item"
              v-for="(product, index) in goal.recommendedProducts"
              :key="product.productId"
              :class="{ active: index === activeIndex[goal.goalId] }"
            >
              <div class="financial-card">

                <div class="card-header">
                  <img class="bank-logo" :src="getBankLogoUrl(product.bankCode)" alt="은행로고" />
                  <span class="product-title">{{ product.productName }}</span>
                  <i 
                    class="fa-regular fa-bookmark bookmark"
                    :class="{ 'scraped': isScraped(product) }"
                    @click="toggleScrap(product)"
                    style="margin-left: auto; cursor: pointer;"
                  ></i>
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
          </div>

          <!-- 인디케이터 -->
          <div class="carousel-indicator">
            <span
              v-for="(product, index) in goal.recommendedProducts"
              :key="index"
              :class="{ dot: true, active: index === activeIndex[goal.goalId] }"
              @click="setActive(goal.goalId, index)"
            ></span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-muted py-4">
      <p>추천할 상품이 없습니다.</p>
    </div>
  </div>
</template>


<style scoped>
/* 기존 스타일 그대로 유지 */
.recommendations {
  /* padding: 16px; */
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
  /* font-size: 1.1rem; */
  font-size: 14px;
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

/* 캐러셀 */
.carousel-container {
  position: relative;
  overflow: hidden;
}

.carousel {
  display: flex;
  transition: transform 0.3s ease-in-out;
}

.carousel-item {
  min-width: 100%;
  display: none;
}

.carousel-item.active {
  display: block;
}

.carousel-indicator {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 50%;
  background-color: #ccc;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dot.active {
  background-color: #2f9b78;
}

</style>
