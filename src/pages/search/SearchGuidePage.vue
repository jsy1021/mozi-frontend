<template>
    <div class="container py-4">
      <!-- 제목 -->
      <div style="font-size: 18px; font-weight: bold; color: #757575; text-align: center; margin-bottom: 1rem;">탐색</div>
      <p class="text-muted small text-center mb-4">
        원하는 서비스를 선택해 자세히 탐색해보세요
      </p>
  
      <!-- 선택 카드 -->
      <div class="d-flex flex-column gap-3 align-items-center" style="padding: 0 1rem;">
        <!-- 금융 탐색 -->
        <div class="card shadow-sm p-3" @click="goToFinancialSearch" style="cursor: pointer;">
          <div class="d-flex align-items-center">
            <div class="icon-wrapper me-3">
              <i class="fa-solid fa-piggy-bank fa-2x text-primary"></i>
            </div>
            <div>
              <h6 class="mb-1 fw-bold" style="font-size: 14px;">금융 탐색</h6>
              <p class="mb-0 text-muted small" style="font-size: 12px;">예금·적금 상품을 한눈에 비교해보세요</p>
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
              <h6 class="mb-1 fw-bold" style="font-size: 14px;">정책 탐색</h6>
              <p class="mb-0 text-muted small" style="font-size: 12px;">청년 맞춤형 정책을 찾아보세요</p>
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
  .icon-wrapper {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f8f9fa;
    border-radius: 10px;
  }
  
  .card {
    border-radius: 12px;
    transition: transform 0.15s ease-in-out;
    max-width: 500px;
    width: 100%;
  }
  
  .card:hover {
    transform: translateY(-2px);
  }
  
  /* 모바일에서 더 컴팩트하게 */
  @media (max-width: 768px) {
    .card {
      max-width: 450px;
      padding: 0.75rem !important;
    }
    
    .icon-wrapper {
      width: 40px;
      height: 40px;
    }
  }
  
  @media (max-width: 480px) {
    .card {
      max-width: 400px;
      padding: 0.5rem !important;
    }
  }
  </style>