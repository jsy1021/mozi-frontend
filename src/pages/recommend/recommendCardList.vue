<!-- recommendCardList.vue -->
<template>
  <div class="card-scroll-container">
    <component
      v-for="card in cards"
      :is="getComponent(type)"
      :key="card.policyId || card.id"
      :policy="card"
      :is-scrapped="card.bookmarked"
    />
  </div>
</template>

<script setup>
import RecommendPolicyCard from './policy/recommendPolicyCard.vue';

const props = defineProps({
  cards: Array,
  type: String,
});

const getComponent = (type) => {
  switch (type) {
    case 'policy':
      return RecommendPolicyCard;
    // case 'finance':
    //   return RecommendFinancialCard;
    default:
      return null;
  }
};
</script>

<style scoped>
.card-scroll-container {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding: 4px 0;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.card-scroll-container > * {
  flex: 0 0 auto;
  scroll-snap-align: start;
}
</style>
