<template>
  <Swiper
    :slides-per-view="'auto'"
    :space-between="16"
    :pagination="{ clickable: true }"
    :modules="[Pagination]"
    class="carousel-container"
  >
    <SwiperSlide
      v-for="(card, index) in cards"
      :key="index"
      class="carousel-slide"
    >
      <RecommendPolicyCard
        :policy="card"
        :is-scrapped="card.bookmarked"
        :showDday="showDday"
      />
    </SwiperSlide>
  </Swiper>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import RecommendPolicyCard from './recommendPolicyCard.vue';

const props = defineProps({
  cards: { type: Array, required: true },
  showDday: { type: Boolean, default: false },
});
</script>

<style scoped>
.carousel-container {
  padding-bottom: 36px; /* 정책 카드와 페이지네이션 bullets 사이 간격 16px 추가 */
}

.carousel-slide {
  width: 100%; /* 카드 폭, 상황에 맞게 조절 */
}
</style>