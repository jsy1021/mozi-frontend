<script setup></script>
<template>
  <div class="header">
    <div class="logo">MoZi</div>

    <div class="buttons">
      <router-link :to="{ name: 'homePage' }"
        ><i class="fa-solid fa-house"></i
      ></router-link>
      <router-link :to="{ name: 'hamburgerMenu' }"
        ><i class="fa-solid fa-bars"></i
      ></router-link>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  margin-left: 12px;
}
.buttons {
  margin-right: 10px;
}
.buttons > * {
  margin-right: 12px;
  color: inherit;
}
</style>
