import api from './index.js';

const toNo = (no) => encodeURIComponent(String(no ?? '').trim());

export const scrapPolicy = async (plcyNo) => {
  console.log('📌 scrapPolicy 호출:', plcyNo);
  const res = await api.post(`/scrap/policy/${toNo(plcyNo)}`);
  return res;
};

export const cancelScrap = async (plcyNo) => {
  console.log('📌 cancelScrap 호출:', plcyNo);
  const res = await api.delete(`/scrap/policy/${toNo(plcyNo)}`);
  return res;
};

export const getScrappedPolicyIds = async () => {
  const res = await api.get('/scrap');
  const data = Array.isArray(res) ? res : res?.data;
  return Array.isArray(data) ? data.map((n) => String(n).trim()) : [];
};

export const getScrappedPolicies = async () => {
  const res = await api.get('/scrap/policy/list');
  const data = Array.isArray(res) ? res : res?.data;
  return Array.isArray(data) ? data : [];
};
