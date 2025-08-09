<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTabStore } from '@/stores/tab'
import IconGoal from '@/components/icons/IconGoal.vue'
import IconMain from '@/components/icons/IconMain.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import IconRecommend from '@/components/icons/IconRecommend.vue'
import IconAccount from '@/components/icons/IconAccount.vue'

const route = useRoute()

// 전역 탭 스토어 기준으로 활성 탭 결정 (라우터 가드에서 동기화)
const tabStore = useTabStore()
const currentTab = computed(() => tabStore.currentTab)

const isActive = (tabName) => currentTab.value === tabName
</script>

<template>
  <div class="footer">
    <router-link :to="{ name: 'searchPage' }" class="tab">
      <IconSearch :active="isActive('search')" />
      <span :class="{ active: isActive('search') }">탐색</span>
    </router-link>

    <router-link :to="{ name: 'recommendPage' }" class="tab">
      <IconRecommend :active="isActive('recommend')" />
      <span :class="{ active: isActive('recommend') }">추천</span>
    </router-link>

    <router-link :to="{ name: 'mainPage' }" class="tab">
      <IconMain :active="isActive('main')" />
      <span :class="{ active: isActive('main') }">메인</span>
    </router-link>

    <router-link :to="{ name: 'goalMain' }" class="tab">
      <IconGoal :active="isActive('goal')" />
      <span :class="{ active: isActive('goal') }">목표</span>
    </router-link>

    <router-link :to="{ name: 'BankSummaryPage' }" class="tab">
      <IconAccount :active="isActive('asset')"/>
      <span :class="{ active: isActive('asset') }">자산</span>
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
