<script></script>
<template>
  <div class="footer">
    <router-link :to="{ name: 'policySearchPage' }"
      ><i class="fas fa-feather-alt"></i>
      <div>정책</div></router-link
    >
    <router-link :to="{ name: 'financialSearchPage' }"
      ><i class="fas fa-wave-square"></i>
      <div>금융</div></router-link
    >
    <router-link :to="{ name: 'myPage' }"
      ><i class="fas fa-user"></i>
      <div>마이페이지</div>
    </router-link>
    <router-link :to="{ name: 'goalMain' }"
      ><i class="fas fa-flag"></i>
      <div>목표</div></router-link
    >
    <router-link :to="{ name: 'scrapPage' }"
      ><i class="fas fa-tag"></i>
      <div>스크랩</div></router-link
    >
  </div>
</template>

<style scoped>
.footer {
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footer > * {
  color: inherit;
  font-size: 11pt;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
