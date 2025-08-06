<template>
  <div class="carousel-container">
    <!-- 카드 영역 -->
    <div
      class="carousel-track"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div class="carousel-slide" v-for="(card, index) in cards" :key="index">
        <!-- 변경 -->
        <RecommendPolicyCard
          :policy="card"
          :is-scrapped="card.bookmarked"
          :showDday="showDday"
        />
      </div>
    </div>

    <!-- 인디케이터 -->
    <div class="carousel-indicators">
      <span
        v-for="(_, index) in cards"
        :key="index"
        :class="{ active: index === currentIndex }"
        @click="currentIndex = index"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import RecommendPolicyCard from './recommendPolicyCard.vue';

const props = defineProps({
  cards: {
    type: Array,
    required: true,
  },
  showDday: {
    type: Boolean,
    default: false,
  },
});

const currentIndex = ref(0);
</script>

<style scoped>
.carousel-container {
  position: relative;
  overflow-x: hidden;
  width: 100%;
  padding-bottom: 5px;
}

.carousel-track {
  display: flex;
  width: 100%;
  transition: transform 0.4s ease-in-out;
  /* 여백 제거 */
  padding: 0;
  margin: 0;
}

.carousel-slide {
  flex: 0 0 100%;
  max-width: 100%;
  box-sizing: border-box;
  /* 가로 여백 제거 */
  padding-left: 0;
  padding-right: 0;
}

/* 인디케이터 */
.carousel-indicators {
  display: flex;
  justify-content: center;
  position: relative;
}

.carousel-indicators span {
  width: 8px;
  height: 8px;
  margin: 0 4px;
  background-color: #ccc;
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
}

.carousel-indicators span.active {
  background-color: #000;
}
</style>
