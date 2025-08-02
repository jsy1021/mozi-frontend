<template>
    <div class="container py-4">
      <!-- 제목 -->
      <h4 class="fw-bold mb-3 text-center">탐색하기</h4>
      <p class="text-muted small text-center mb-4">
        원하는 서비스를 선택해 자세히 탐색해보세요
      </p>
  
      <!-- 선택 카드 -->
      <div class="d-flex flex-column gap-3">
        <!-- 금융 탐색 -->
        <div class="card shadow-sm p-3" @click="goToFinancialSearch" style="cursor: pointer;">
          <div class="d-flex align-items-center">
            <div class="icon-wrapper me-3">
              <i class="fa-solid fa-piggy-bank fa-2x text-primary"></i>
            </div>
            <div>
              <h6 class="mb-1 fw-bold">금융 탐색</h6>
              <p class="mb-0 text-muted small">예금·적금 상품을 한눈에 비교해보세요</p>
            </div>
          </div>
        </div>
  
        <!-- 정책 탐색 -->
        <div class="card shadow-sm p-3" @click="goToPolicySearch" style="cursor: pointer;">
          <div class="d-flex align-items-center">
            <div class="icon-wrapper me-3">
              <i class="fa-solid fa-bullhorn fa-2x text-success"></i>
            </div>
            <div>
              <h6 class="mb-1 fw-bold">정책 탐색</h6>
              <p class="mb-0 text-muted small">청년 맞춤형 정책을 찾아보세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const goToFinancialSearch = () => {
    router.push('/financialSearch/FinancialSearchPage');
  };
  
  const goToPolicySearch = () => {
    router.push('/policySearch/PolicySearchPage');
  };
  </script>
  
  <style scoped>
  .card {
    border-radius: 12px;
    transition: transform 0.15s ease-in-out;
  }
  .card:hover {
    transform: translateY(-2px);
  }
  
  .icon-wrapper {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f8f9fa;
    border-radius: 10px;
  }
  </style>