import 'bootstrap/dist/css/bootstrap.css';
import 'vue-awesome-paginate/dist/style.css'; // 페이지네이션
import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VueAwesomePaginate from 'vue-awesome-paginate'; // 페이지네이션
import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(VueAwesomePaginate); // 페이지네이션
app.use(pinia);
app.use(router);

app.mount('#app');

// ✅ 앱 마운트 후 바로 Store 초기화
setTimeout(() => {
  import('@/stores/auth').then(({ useAuthStore }) => {
    const authStore = useAuthStore();
    console.log('🔥 인증 상태 복원 시작');
    authStore.initializeAuth();
  });
}, 0);
