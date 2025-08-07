<script setup>
import { ref } from 'vue'

// 북마크
const isBookmarked = ref(false)

function toggleBookmark(){
  isBookmarked.value = !isBookmarked.value
}

// const props = defineProps({
//   policy: Object
// })
const props = defineProps({
  type: {
    type: String,
    required: true, // 'policy' 또는 'product'
  },
  policy: Object,
  product: Object
})
</script>


<template>
  <!-- <h1>추천 카드 (공통)</h1> -->


  <!-- <div class="recommend-card"> -->
  <div :class="['recommend-card', type]">

    <!-- 북마크 -->
    <div class="bookmark-icon" @click="toggleBookmark">
      <!-- <i :class="isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'"></i> -->
        <i :class="['fa-bookmark', isBookmarked ? 'fas' : 'far']"
          :style="{ color: isBookmarked ? '#569FFF' : '#8E8E93' }"></i>
    </div>

    <!-- 정책 카드(policy) -->
    <template v-if="type === 'policy' && policy">
    
      <div class="card-info">
        
        <div class="card-left">
          <div>
            <img src="/images/goal/policy.png" alt="정책 이미지" style="width: 30px; height: 30px;"/>
            <p class="grade">Top 1</p>
          </div>
        </div>

        <div class="card-right">
          <div>
            <p class="title"><strong>{{ policy.plcyNm }}</strong></p>
          </div>
          
          <p class="category">
            <span class="label">분야</span> {{ policy.lclsfNm }}
          </p>
          <p class="category">
            <span class="label">연령</span> {{ policy.sprtTrgtMinAge }} ~ {{ policy.sprtTrgtMaxAge }}세
          </p>
          <p class="category">
            <span class="label">기간</span> {{ policy.bizPrdBgngYmd }} ~ {{ policy.bizPrdEndYmd }}
          </p>

          <div class="box">
            <div class="keyword">
              <p>{{ policy.lclsfNm }}</p>
              <p>{{ policy.mclsfNm }}</p>
            </div>

            <div class="detail-info">
              <p>
                <!-- <a :href="policy.aplyUrlAddr" target="_blank" rel="noopener noreferrer">자세히보기</a> -->
                 <a href="#">자세히보기</a>
              </p>
            </div>
          </div>

        </div>

      </div>
    </template>

    <!-- 금융 상품 카드(product) -->
    <template v-else-if="type === 'product' && product">

      <div class="card-info">

        <div class="card-left">
          <img src="/images/goal/kb.png" alt="정책 이미지" style="width: 30px; height: 30px;"/>
          <div class="grade">Top1</div>
        </div>

        <div class="card-right">
          <div>
            <p class="title"><strong>{{ product.fin_prdt_nm }}</strong></p>
          </div>
        
          <p class="category">
            <span class="label">대상</span> {{ product.join_member }}
          </p>
          <p class="category">
            <span class="label">최고한도</span> {{ product.max_limit.toLocaleString() }}원
          </p>
          <p class="category">
            <span class="label">공시 기간</span> {{ product.dcls_start_day }} ~ {{ product.dcls_end_day }}
          </p>

          <div class="box">
            <div class="keyword">
              <p>{{ product.kor_co_nm }}</p>
              <p>{{ product.join_way }}</p>
            </div>

            <div class="detail-info">
              <p>                
                 <a href="#">자세히보기</a>
              </p>
            </div>
          </div>
        
        </div>

      </div>
    </template>

    <!-- 데이터 없을 때 -->
    <template v-else>
      <p>데이터가 없습니다.</p>
    </template>

  </div>
</template>

<style scoped>

.recommend-card {
  position: relative;
  /* margin-left: 5px; */
  margin-right: 5px;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  padding: 12px 1rem;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  text-align: left;
  background-color: #fff;
  margin-bottom: 1rem;

  /* width: 300px; */
  width: 100%;

  /* 기본(왼쪽): 색 x */
  /* border-left: 7px solid transparent; */
}

/* 왼쪽 그라데이션 전용 */
/* 정책 */
.recommend-card.policy::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, #ff0000 0%, #000dff 55%);
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

/* 금융 */
.recommend-card.product::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, #FF9D00 0%, #83FFF1 100%);
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

.recommend-card p,
.recommend-card .box,
.recommend-card .detail-info {
  margin-top: 4px;
  margin-bottom: 4px;
}
.recommend-card p:first-child {
  margin-top: 0;
}

.recommend-card .detail-info {
  margin-bottom: 0;
}

/* 카드 */
.card-info{
  display: flex;
}

/* 왼(이미지) */
.card-left{
  margin-right: 14px;
}

.grade{
  font-size: 12px;
}


/* 오(내용) */
.card-right{
  flex: 1;
}


/*  */
.title{
  font-size: 14px;
}

.category{
  font-size: 12px;
}

.label{
  color: #959595;
}

/* 키워드 */
.box{
  display: flex;
  justify-content: space-between; /* 좌우로 배치 */
  align-items: center; /* 세로 중앙 정렬 */
  width: 100%;
}

.box .keyword p {
  display: inline-block;
  background-color: #d9d9d9; 
  padding: 4px 10px; 
  border-radius: 5px; 
  font-size: 10px;
  color: #757575; 
  margin-right: 4px;

  margin-bottom: 0px;
}

/* 자세히보기 */
.detail-info {
  display: flex;
  justify-content: flex-end;

  margin-top: 0px;
  background-color: #f5f5f5;
}

.detail-info>p{
  display: inline-block;
  border: 1px solid #d9d9d9;
  padding: 4px;
  border-radius: 5px;
  color: #aaa;
  font-size: 12px;
}

.detail-info>p>a{
  text-decoration: none;
  color: #aaa;
}

/* 북마크 */
/* .bookmark-icon {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 18px;
  color: #569FFF;
  color: #757575;
  cursor: pointer;
  z-index: 10;
} */
.bookmark-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  color: #8E8E93;
  cursor: pointer;
  z-index: 10;

  /* border: 1px solid #8E8E93; */
}



</style>
