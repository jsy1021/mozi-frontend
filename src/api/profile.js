import axios from 'axios';

export const profileAPI = {
  // 사용자 프로필 조회
  getProfile() {
    return axios
      .get('/api/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
      .then((res) => res.data);
  },

  // 사용자 프로필 저장
  saveProfile(data) {
    return axios
      .post('/api/profile', data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
      .then((res) => res.data);
  },
};
