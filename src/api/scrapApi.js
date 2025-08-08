import api from './index.js';

export const scrapPolicy = (plcyNo) => {
  return api.post(`/scrap/policy/${plcyNo}`);
};

export const cancelScrap = (plcyNo) => {
  return api.delete(`/scrap/policy/${plcyNo}`);
};

// export const getScrappedPolicyIds = () =>
//   api.get('/scrap').then((res) => res.data.result ?? []);

export const getScrappedPolicyIds = () =>
  api.get('/scrap').then((res) => {
    console.log('🔍 스크랩 응답:', res);
    return res.data?.result ?? []; // ✅ 이게 핵심
  });

// export const getScrappedPolicies = () =>
//   api.get('/scrap/policy/list').then((res) => res.data);

// export const getScrappedPolicies = () =>
//   api.get('/scrap/policy/list').then((res) => res.data ?? []);

export const getScrappedPolicies = () =>
  api.get('/scrap/policy/list').then((res) => {
    console.log('🟢 scrapApi 응답:', res); // res가 곧 data
    return res ?? [];
  });
