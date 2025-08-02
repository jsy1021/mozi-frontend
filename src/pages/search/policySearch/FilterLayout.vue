<template>
  <div class="mb-1" style="margin-bottom: 0.4rem">
    <label
      class="form-label small fw-semibold"
      style="font-size: 0.7rem; margin-bottom: 0.1rem"
    >
      {{ label }}
      <span v-if="single" class="text-muted">(* 단일 선택)</span>
    </label>
    <div class="d-flex flex-wrap gap-1">
      <button
        v-for="item in items"
        :key="item.value"
        @click="handleClick(item)"
        :class="[
          'btn btn-sm py-1 px-2',
          filterState[category]?.includes(item.value)
            ? 'btn-secondary'
            : 'btn-outline-secondary',
        ]"
        style="font-size: 0.65rem; line-height: 1.1; white-space: nowrap"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  label: String,
  items: Array,
  category: String,
  filterState: Object,
  toggleFilter: Function,
  radioMode: Boolean,
  single: Boolean,
});

// 클릭 핸들러 내부에서 제한없음 로직 처리
function handleClick(item) {
  const category = props.category;
  const value = item.value;
  const isLimitless = item.label === '제한없음';

  if (!props.filterState[category]) {
    props.filterState[category] = [];
  }

  if (props.radioMode) {
    props.filterState[category] = [value];
    return;
  }

  const currentValues = props.filterState[category];

  if (isLimitless) {
    // 제한없음 누르면 기존 선택 초기화하고 제한없음만 남김
    props.filterState[category] = [value];
  } else {
    // 제한없음이 포함되어 있으면 제거
    props.filterState[category] = currentValues.filter((v) => {
      const limitlessValue = props.items.find(
        (i) => i.label === '제한없음'
      )?.value;
      return v !== limitlessValue;
    });

    // 현재 항목이 이미 선택되어 있으면 제거
    if (props.filterState[category].includes(value)) {
      props.filterState[category] = props.filterState[category].filter(
        (v) => v !== value
      );
    } else {
      props.filterState[category].push(value);
    }
  }
}
</script>
