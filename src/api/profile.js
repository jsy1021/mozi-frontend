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
        'Content-Type': 'application/json',
      })
      .then((res) => res.data)
      .catch((err) => {
        console.error('프로필 저장 실패:', err.response?.data || err.message);
        throw err;
      });
  },
};
