<script setup>
import Header from './Header.vue';
import Footer from './Footer.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="iphone-frame">
    <Header v-if="route.meta.isHeader" />
    <div
      class="content"
      :style="{
        top: route.meta.isHeader ? '60px' : '0px',
        bottom: route.meta.isFooter ? '60px' : '0px',
      }">
      <slot></slot>
    </div>
    <Footer v-if="route.meta.isFooter" />
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

.content {
  position: absolute;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}
</style>
