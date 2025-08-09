<script setup>
import IconScrap from '../icons/IconScrap.vue';
</script>

<template>
  <div class="header">
    <!-- 로고를 router-link로 감싸서 메인페이지로 이동 -->
    <router-link :to="{ name: 'mainPage' }" class="logo-link">
      <div class="logo">MoZi</div>
    </router-link>

    <div class="buttons">
      <router-link :to="{ name: 'scrapPage' }" class="scrap">
        <IconScrap :active="false" />
      </router-link>
      <router-link :to="{ name: 'hamburgerMenu' }" class="hamburger">
        <i class="fa-solid fa-bars"></i>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.header {
  position: absolute;
  top: 0;
  width: 100%;
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #eee;
  background: white;
  box-sizing: border-box;
}

/* 로고 링크 스타일 추가 */
.logo-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo-link:hover {
  opacity: 0.8;
}

.logo {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #36c18c;
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
}

/* 햄버거 아이콘: 기본(비활성) #C2C6CE, 활성 시 #1A1A1A */
.buttons .hamburger i { color: #C2C6CE; }
.buttons .hamburger.router-link-active i { color: #1A1A1A; }

/* 스크랩 아이콘: 항상 비활성 색상 유지 */
.buttons .scrap svg { stroke: #C2C6CE; }
</style>
