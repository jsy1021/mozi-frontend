<template>
  <div class="dropdown" ref="root">
    <div class="trigger" @click="toggle">{{ modelValue || '-- 선택 --' }}</div>
    <teleport to="body">
      <ul v-if="open" :style="positionStyle" class="menu">
        <li v-for="opt in options" :key="opt" @click="select(opt)">{{ opt }}</li>
      </ul>
    </teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue';
const props = defineProps({ modelValue: String, options: Array });
const emit = defineEmits(['update:modelValue']);
const open = ref(false);
const positionStyle = ref({});
const root = ref(null);

function toggle() {
  open.value = !open.value;
  if (open.value) positionMenu();
}

function select(opt) {
  emit('update:modelValue', opt);
  open.value = false;
}

function onClickOutside(e) {
  if (!root.value.contains(e.target)) open.value = false;
}
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside));
document.addEventListener('click', onClickOutside);

async function positionMenu() {
  await nextTick();
  const rect = root.value.getBoundingClientRect();
  const width = 200;
  const screenW = window.innerWidth;
  let left = rect.left;
  if (left + width > screenW - 10) left = screenW - width - 10;
  positionStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: '200px',
    overflow: 'auto',
    background: '#fff',
    zIndex: 999,
  };
}
</script>

<style scoped>
.dropdown {
  position: relative;
  width: 100%;
}
.trigger {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
}
.menu {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.menu li {
  padding: 8px;
  cursor: pointer;
}
.menu li:hover {
  background: #eee;
}
</style>
