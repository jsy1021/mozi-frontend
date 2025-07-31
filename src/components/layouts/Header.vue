<script setup>
import IconScrap from '../icons/IconScrap.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isActive = (tabName) => route.name === tabName;
</script>

<template>
  <div class="header">
    <div class="logo">MoZi</div>

    <div class="buttons">
      <router-link :to="{ name: 'scrapPage' }">
        <IconScrap :active="isActive('scrapPage')" />
      </router-link>
      <router-link :to="{ name: 'hamburgerMenu' }">
        <i class="fa-solid fa-bars"></i>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 12px;
  border-bottom: 1px solid #eee;
  background: white; /* 개별 컴포넌트에서 배경 관리 */
}

.logo {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #36C18C;
}

.buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.buttons > * {
  color: inherit;
  text-decoration: none;
}

.buttons i {
  font-size: 20px;
  color: #1A1A1A;
}
</style>
