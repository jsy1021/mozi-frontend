<template>
  <div class="border p-3 rounded mb-3 bg-light">
    <div class="filter-section">
      <div class="filter-label">가입 방법</div>
        <div class="btn-group-wrap">
          <button
            v-for="option in joinWayOptions"
            :key="option.value"
            :class="['filter-btn', { active: selectedJoinWays.includes(option.value) }]"
            @click="toggleJoinWay(option.value)"
          >
          {{ option.label }}
          </button>
        </div>
      </div>
    <div class="filter-section">
      <div class="filter-label">기간</div>
      <div class="btn-group-wrap">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          :class="['filter-btn', { active: selectedPeriod === option.value }]"
          @click="selectPeriod(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <div class="filter-section">
      <div class="filter-label">금리</div>
      <div class="btn-group-wrap">
        <button
          v-for="option in rateSortOptions"
          :key="option.value"
          :class="['filter-btn', { active: selectedRateSort === option.value }]"
          @click="selectRateSort(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <div class="filter-section">
      <div class="filter-label">은행명</div>
      <div class="bank-grid">
        <button
          v-for="option in bankOptions"
          :key="option.value"
          :class="['bank-btn', { active: selectedBanks.includes(option.value) }]"
          @click="toggleBank(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <div class="filter-actions d-flex gap-2 justify-content-end mt-3">
      <button @click="applyFilter" class="btn btn-primary btn-sm">적용</button>
      <button @click="resetFilter" class="btn btn-secondary btn-sm">초기화</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FinancialFilter',
  data() {
    return {
      // 기간 옵션
      periodOptions: [
        { label: '전체', value: '' },
        { label: '~ 6개월', value: 6 },
        { label: '~12개월', value: 12 },
        { label: '~24개월', value: 24 },
        {label:'~36개월', value: 36}
        
      ],
      // 금리 정렬 옵션
      rateSortOptions: [
        { label: '높은 금리순', value: 'high' },
        { label: '기본 금리순', value: 'base' },
      ],
      // 은행명 옵션(3x3)
      bankOptions: [
        { label: 'KB국민', value: '0010927' },
        { label: '신한', value: '0010020' },
        { label: '우리', value: '0010001' },
        { label: '하나', value: '0013909' },
        { label: 'SC제일', value: '0010002' },
        { label: '카카오뱅크', value: '0015130' },
        { label: 'IBK 기업', value: '0010026' },
        { label: '케이뱅크', value: '0014674' },
        { label: '토스뱅크', value: '0017801' },
        { label: '부산', value: '0010017' },
        { label: 'IM뱅크', value: '0010016' },
        { label: 'SH수협', value: '0014807' },
        { label: '경남', value: '0010017' },
        { label: '광주', value: '0010019' },
        { label: '전북', value: '0010019' },
        { label: '제주', value: '0010020' },
        { label: 'NH농협', value: '0013175' },
        { label: '신협', value: '0014807' },
      ],
      joinWayOptions:[
        {label:'영업점', value:'영업점'},
        {label:'인터넷 ', value:'인터넷'},
        {label:'스마트폰', value:'스마트폰'},
        {label:'전화', value:'전화'},
      ],
      selectedPeriod: '',
      selectedRateSort: '',
      selectedBanks: [],
      selectedJoinWays:[],
    }
  },
  methods: {
    selectPeriod(value) {
      this.selectedPeriod = value
    },
    selectRateSort(value) {
      this.selectedRateSort = value
    },
    toggleBank(value) {
      if (this.selectedBanks.includes(value)) {
        this.selectedBanks = this.selectedBanks.filter(v => v !== value)
      } else {
        this.selectedBanks.push(value)
      }
    },
    toggleJoinWay(value){
      if (this.selectedJoinWays.includes(value)) {
        this.selectedJoinWays = this.selectedJoinWays.filter(v => v !== value)
      } 
      else {
        this.selectedJoinWays.push(value)
      }
    },
    applyFilter() {
      this.$emit('filter-applied', {
        period: this.selectedPeriod,
        rateSort: this.selectedRateSort,
        banks: this.selectedBanks,
        joinWays: this.selectedJoinWays
      })
    },
    resetFilter() {
      this.selectedPeriod = ''
      this.selectedRateSort = ''
      this.selectedBanks = []
      this.selectedJoinWays = [] // ✅ 초기화
    }
  }
}
</script>

<style scoped>
.filter-label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}
.filter-section {
  margin-bottom: 20px;
}
.btn-group-wrap {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-btn {
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border 0.2s;
  margin-bottom: 4px;
}
.filter-btn.active {
  background: #ede9e3;
  color: #222;
  border: 1.5px solid #bdbdbd;
}
.bank-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}
.bank-btn {
  background: #fff;
  border: none;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  font-size: 15px;
  color: #333;
  padding: 14px 0;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.bank-btn.active {
  background: #ede9e3;
  color: #222;
  font-weight: bold;
}
.bank-btn:nth-child(3n) {
  border-right: none;
}
.bank-btn:nth-last-child(-n+3) {
  border-bottom: none;
}
</style> 