import axios from "axios";

const API_BASE_URL = "/api"; // 백엔드 기본 경로

// 예금 상위 상품 조회
export const getTopDeposits = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/deposits/top`);
    return response.data; // DepositResponse 리스트 반환
  } catch (error) {
    console.error("예금 상위 상품 조회 실패:", error);
    throw error;
  }
};

// 적금 상위 상품 조회
export const getTopSavings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/savings/top`);
    return response.data; // SavingResponse 리스트 반환
  } catch (error) {
    console.error("적금 상위 상품 조회 실패:", error);
    throw error;
  }
};
