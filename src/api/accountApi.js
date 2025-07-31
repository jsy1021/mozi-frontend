import axios from 'axios';

//계좌 추가
export const addAccountList = async (data) => {
  try {
    const result = await axios.post('/api/account/add', data);
    return result.data;
  } catch (error) {
    console.error('계좌 추가 실패:', error);
    throw error;
  }
};

//계좌 조회
export const getAccountList = async () => {
  try {
    const result = await axios.get('/api/account/get');
    return result.data;
  } catch (error) {
    console.error('계좌 조회 실패:', error);
    throw error;
  }
};

// 은행 삭제 요청 (bankCode 배열 전달)
export const deleteAccounts = async (bankCodeList) => {
  const response = await axios.delete('/api/account/delete', {
    data: bankCodeList,
  });
  return response.data; // 삭제된 bankCode 리스트 반환
};

// 계좌 최신화
export const refreshAccounts = async () => {
  try {
    const result = await axios.put('/api/account/refresh');
    return result.data;
  } catch (error) {
    console.error('계좌 최신화 실패:', error);
    throw error;
  }
};

// 메인페이지 은행 보여주기
export const getMainBankSummary = async () => {
  try {
    const result = await axios.get('/api/account/mainsummary');
    return result.data;
  } catch (error) {
    console.error('계좌 조회 실패:', error);
    throw error;
  }
};

export const getBankSummary = async () => {
  try {
    const res = await axios.get('/api/account/summary');
    return res.data;
  } catch (error) {
    console.error('은행 요약 조회 실패:', error);
    throw error;
  }
};

export const getMainBank = async () => {
  const response = await axios.get('/api/account/get-mainbank');
  console.log(response);
  return response.data;
};

export const setMainBank = async (bankCode) => {
  const payload = { bankCode: bankCode === null ? null : bankCode };
  const response = await axios.post('/api/account/set-mainbank', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const getAccountsByGoal = async (goalId) => {
  try {
    const result = await axios.get('/api/account/get-by-goal', {
      params: { goalId }, // ✅ GET 요청은 params로
    });
    return result.data;
  } catch (error) {
    console.error('목표별 계좌 조회 실패:', error);
    throw error;
  }
};

export const getAccountsByBank = async (bankCode) => {
  const result = await axios.get(`/api/account/get-by-bank`, {
    params: { bankCode },
  });
  return result.data;
};
