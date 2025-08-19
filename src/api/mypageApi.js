import api from './index.js';

export const mypageAPI = {
  // 마이페이지 정보 조회
  getMyPageInfo: () => api.get('/mypage'),

  // 수정용 정보 조회
  getEditInfo: () => api.get('/mypage/edit'),

  // 비밀번호 확인
  confirmPassword: (password) =>
    api.post('/mypage/confirm-password', { password }),

  // 정보 수정
  updateInfo: (data) => api.put('/mypage/edit', data),
};
