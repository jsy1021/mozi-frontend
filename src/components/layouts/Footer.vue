<script setup>
import { useRoute } from 'vue-router'
import IconGoal from '@/components/icons/IconGoal.vue'
import IconMain from '@/components/icons/IconMain.vue'
import IconSearch from '@/components/icons/IconSearch.vue'

const route = useRoute()

// 현재 라우터와 비교해서 활성화 여부 확인
const isActive = (tabName) => route.name === tabName
</script>

<template>
  <div class="footer">
    <router-link :to="{ name: 'policySearchPage' }">
      <!-- <IconSearch :active="isActive"{} -->
      <i class="fas fa-feather-alt"></i>
      <div>탐색</div>
    </router-link>

    <router-link :to="{ name: 'financialSearchPage' }">
      <i class="fas fa-wave-square"></i>
      <div>추천</div>
    </router-link>

    <router-link :to="{ name: 'mainPage' }" class="tab">
      <IconMain :active="isActive('mainPage')" />
      <div :class="{ active: isActive('mainPage') }">메인페이지</div>
    </router-link>

    <router-link :to="{ name: 'goalMain' }" class="tab">
      <IconGoal :active="isActive('goalMain')" />
      <div :class="{ active: isActive('goalMain') }">목표</div>
    </router-link>

    <router-link :to="{ name: 'scrapPage' }">
      <i class="fas fa-tag"></i>
      <div>스크랩</div>
    </router-link>
  </div>
</template>

<style scoped>
.footer {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-top: 1px solid #eee;
}

.footer > .tab {
  color: inherit;
  font-size: 11pt;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
}

.footer .active {
  color: #1A1A1A;
  font-weight: 600;
}

.footer .tab div {
  color: #C2C6CE;
}

.footer .tab div.active {
  color: #1A1A1A;
}
</style>