import api from "./index.js"; // ← 인터셉터가 설정된 api 사용

// 추천 상품 조회
export const getRecommendations = async () => {
  try {
    const response = await api.get("/recommendations");
    return response.data;
  } catch (error) {
    console.error("추천 상품 불러오기 실패:", error);
    throw error;
  }
};

// 금융 스크랩 상태 조회
export const getFinanceScraps = async () => {
  try {
    const response = await api.get("/scrap/finance");
    return response.data;
  } catch (error) {
    console.error("금융 스크랩 상태 조회 실패:", error);
    throw error;
  }
};

// 금융 스크랩 추가
export const addFinanceScrap = async (productType, productId) => {
  try {
    await api.post("/scrap/finance", null, {
      params: { productType, productId },
    });
  } catch (error) {
    console.error("금융 스크랩 추가 실패:", error);
    throw error;
  }
};

// 금융 스크랩 삭제
export const removeFinanceScrap = async (productType, productId) => {
  try {
    await api.delete("/scrap/finance", {
      params: { productType, productId },
    });
  } catch (error) {
    console.error("금융 스크랩 삭제 실패:", error);
    throw error;
  }
};
