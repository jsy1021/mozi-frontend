<script setup>
import Header from './Header.vue';
import Footer from './Footer.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="iphone-frame">
    <Header class="header" v-if="route.meta.isHeader" />
    <div
      class="content"
      :style="{
        top: route.meta.isHeader ? '60px' : '0px',
        bottom: route.meta.isFooter ? '60px' : '0px',
      }"
    >
      <slot></slot>
    </div>
    <Footer class="footer" v-if="route.meta.isFooter" />
  </div>
</template>

<style scoped>
.iphone-frame {
  width: 393px;
  height: 852px;
  background-color: white;
  margin: 0 auto;
  position: relative;
}

.header {
  position: absolute;
  top: 0;
  width: 100%;
  height: 60px; /*수정필요*/
  z-index: 10;
  background-color: #f2f2f2;
  box-sizing: border-box;
}

.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60px; /*수정필요*/
  z-index: 10;
  background-color: #f2f2f2;
  box-sizing: border-box;
}

.content {
  position: absolute;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}
</style>
