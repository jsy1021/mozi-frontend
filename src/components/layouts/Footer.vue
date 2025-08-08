<script setup>
import { useRoute } from 'vue-router'
import IconGoal from '@/components/icons/IconGoal.vue'
import IconMain from '@/components/icons/IconMain.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import IconRecommend from '@/components/icons/IconRecommend.vue'
import IconAccount from '@/components/icons/IconAccount.vue'

const route = useRoute()
const isActive = (tabName) => route.name === tabName
</script>

<template>
  <div class="footer">
    <router-link :to="{ name: 'searchPage' }" class="tab">
      <IconSearch :active="isActive('searchPage')" />
      <span :class="{ active: isActive('searchPage') }">탐색</span>
    </router-link>

    <router-link :to="{ name: 'recommendPage' }" class="tab">
      <IconRecommend :active="isActive('recommendPage')" />
      <span :class="{ active: isActive('recommendPage') }">추천</span>
    </router-link>

    <router-link :to="{ name: 'mainPage' }" class="tab">
      <IconMain :active="isActive('mainPage')" />
      <span :class="{ active: isActive('mainPage') }">메인</span>
    </router-link>

    <router-link :to="{ name: 'goalMain' }" class="tab">
      <IconGoal :active="isActive('goalMain')" />
      <span :class="{ active: isActive('goalMain') }">목표</span>
    </router-link>

    <router-link :to="{ name: 'BankSummaryPage' }" class="tab">
      <IconAccount :active="isActive('BankSummaryPage')"/>
      <span :class="{ active: isActive('BankSummaryPage') }">자산</span>
    </router-link>
  </div>
</template>

<style scoped>
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 64px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  border-top: 1px solid #eee;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
}

.footer > .tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  text-decoration: none;
  color: inherit;
  gap: 2px;
}

.footer .tab svg {
  width: 24px;
  height: 24px;
}

.footer .tab span {
  font-size: 11px;
  color: #C2C6CE;
  line-height: 1.2;
  font-weight: 400;
}

.footer .tab span.active {
  color: #1A1A1A;
  font-weight: 600;
}
</style>
