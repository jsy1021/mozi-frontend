<script setup>
import axios from 'axios';
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheckCircle, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

library.add(faCheckCircle, faChevronLeft);

const router = useRouter();

const loading = ref(true);
const errorMsg = ref('');
const summary = ref({
  email: '',
  joinedDate: '',
  daysUsing: 0,
  scrapCount: 0,
  goalCount: 0,
  userType: 'REGULAR',
  provider: null,
});

/* 탈퇴 모드 및 동의 */
const mode = ref(null); // 'appOnly' | 'unlinkAndDelete'
const modeError = ref('');
const reason = ref('');
const agreed = ref(false);

/* 비밀번호 확인(일반 회원 전용) */
const password = ref('');
const passwordValid = ref(false);
const passwordChecking = ref(false);
const passwordError = ref('');

/* 모달 확인 로직 */
const confirmOpen = ref(false);
const confirmText = ref('');
const confirmBusy = ref(false);
const confirmError = ref('');
const REQUIRED_PHRASE = '계정 탈퇴에 동의합니다.';
const confirmOKEnabled = computed(() => confirmText.value.trim() === REQUIRED_PHRASE && !confirmBusy.value);
const confirmInputRef = ref(null);

/* 표시용 텍스트 파생값 */
const providerTitle = computed(() => {
  if (summary.value.provider === 'KAKAO') return '카카오';
  if (summary.value.provider === 'NAVER') return '네이버';
  if (summary.value.provider === 'GOOGLE') return '구글';
  return '';
});
const providerHeaderText = computed(() => (providerTitle.value ? `${providerTitle.value} 탈퇴` : '계정 탈퇴'));
const providerSubText = computed(() =>
  providerTitle.value ? `${providerTitle.value} 계정으로 로그인한 회원` : '일반 계정으로 로그인한 회원'
);
const isOauth = computed(() => summary.value.userType === 'OAUTH');

/* 일반 계정이면 항상 appOnly 고정, OAuth면 비밀번호 검사 비활성 */
watch(isOauth, (v) => {
  if (!v) mode.value = 'appOnly';
  if (v) {
    password.value = '';
    passwordValid.value = true; // OAuth는 비밀번호 불필요
    passwordError.value = '';
  } else {
    passwordValid.value = false;
  }
});

/* 제출 가능 여부: 동의 + (OAuth || (Regular && 비번검증성공)) */
const isSubmitEnabled = computed(
  () => agreed.value && !loading.value && (isOauth.value || (!isOauth.value && passwordValid.value))
);

// 유틸
const token = () => localStorage.getItem('accessToken') || '';
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

function parseYMDToLocalDate(ymd) {
  if (!ymd) return null;
  const d = new Date(`${ymd}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
function computeDays(fromYmd) {
  const from = parseYMDToLocalDate(fromYmd);
  if (!from) return 0;
  const now = new Date();
  const MS = 24 * 60 * 60 * 1000;
  const diff = Math.floor((now - from) / MS);
  return diff >= 0 ? diff : 0;
}
function debounce(fn, delay = 400) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// 비밀번호 확인 API (/api/mypage/confirm-password)
const runPasswordCheck = debounce(async () => {
  passwordError.value = '';
  passwordValid.value = false;
  if (isOauth.value) return;

  const pw = password.value?.trim() || '';
  if (!pw) {
    passwordValid.value = false;
    return;
  }

  passwordChecking.value = true;
  try {
    const { data } = await axios.post('/api/mypage/confirm-password', { password: pw }, { headers: authHeaders() });
    const ok = data?.success === true || data?.isSuccess === true || data?.code === 200 || data?.status === 'SUCCESS';
    if (ok) {
      passwordValid.value = true;
      passwordError.value = '';
    } else {
      passwordValid.value = false;
      passwordError.value = data?.message || '비밀번호를 확인해주세요.';
    }
  } catch (err) {
    passwordValid.value = false;
    passwordError.value = err?.response?.data?.message || '비밀번호가 일치하지 않습니다.';
  } finally {
    passwordChecking.value = false;
  }
}, 400);
watch(password, () => {
  if (!isOauth.value) runPasswordCheck();
});

/* 데이터 조회 */
async function fetchWithdrawalInfo() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const { data } = await axios.get('/api/withdrawal/info', { headers: authHeaders() });
    if (data?.isSuccess === false || data?.success === false) throw new Error(data?.message || '요약 조회 실패');

    const res = data?.result ?? data?.data ?? {};
    const u = res?.user_data ?? res?.userData ?? {};

    summary.value = {
      email: u.email ?? '',
      joinedDate: u.joinDate ?? '',
      daysUsing: computeDays(u.joinDate),
      scrapCount: u.scrapCount ?? 0,
      goalCount: u.goalCount ?? 0,
      userType: res.user_type ?? res.userType ?? 'REGULAR',
      provider: res.provider_code ?? res.providerCode ?? null,
    };
  } catch (err) {
    console.error(err);
    errorMsg.value = '정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    loading.value = false;
    if (!isOauth.value) mode.value = 'appOnly';
    if (!mode.value) mode.value = 'appOnly';
  }
}

function goBack() {
  router.back();
}

/* === 모달 열기/닫기/Enter === */
function openConfirmModal() {
  if (!mode.value) {
    modeError.value = '탈퇴 방식을 선택해주세요.';
    return;
  }
  confirmError.value = '';
  confirmText.value = '';
  confirmOpen.value = true;
  document.body.style.overflow = 'hidden';
  nextTick(() => confirmInputRef.value?.focus());
}
function closeConfirmModal() {
  confirmOpen.value = false;
  document.body.style.overflow = '';
}
function onConfirmEnter() {
  if (confirmOKEnabled.value) performWithdrawal();
}

/* 실제 탈퇴 호출 */
async function performWithdrawal() {
  confirmBusy.value = true;
  confirmError.value = '';
  try {
    // 분기 규칙
    // - 일반회원: REGULAR
    // - OAuth + 'MoZi에서만 탈퇴': OAUTH_SERVICE_ONLY  (연동 유지, 앱 데이터만 삭제/백업)
    // - OAuth + '연동 해제 + 탈퇴': OAUTH_UNLINK       (연동 완전 해제)
    const withdrawalType = !isOauth.value
      ? 'REGULAR'
      : mode.value === 'unlinkAndDelete'
      ? 'OAUTH_UNLINK'
      : 'OAUTH_SERVICE_ONLY';

    const payload = {
      password: !isOauth.value ? password.value?.trim() || null : null,
      reason: reason.value?.trim() || null,
      withdrawalType,
      agreedToDataDeletion: true,
    };

    const { data } = await axios.post('/api/withdrawal', payload, { headers: authHeaders() });
    if (data?.isSuccess === false || data?.success === false) {
      throw new Error(data?.message || '탈퇴 처리에 실패했습니다.');
    }

    // 성공
    closeConfirmModal();
    localStorage.clear();
    router.push({ name: 'mainPage' });
  } catch (err) {
    confirmError.value = err?.response?.data?.message || err?.message || '탈퇴 처리 중 오류가 발생했습니다.';
  } finally {
    confirmBusy.value = false;
  }
}

onMounted(fetchWithdrawalInfo);

/* 취소 버튼 동작 */
const onCancel = () => {
  if (window.history.length > 1) router.back();
  else router.push('/user/MyPage');
};

// 제목 칩 색상 적용을 위한 클래스 바인딩(필요 시)
const heroClass = computed(() => {
  if (!isOauth.value) return 'hero-regular';
  switch (summary.value.provider) {
    case 'KAKAO':
      return 'hero-kakao';
    case 'NAVER':
      return 'hero-naver';
    case 'GOOGLE':
      return 'hero-google';
    default:
      return 'hero-regular';
  }
});
</script>

<template>
  <div class="page scrollbar-hide">
    <div class="topbar">
      <button class="nav-btn" @click="goBack" aria-label="뒤로가기">
        <font-awesome-icon :icon="['fas', 'chevron-left']" />
      </button>
      <div />
    </div>

    <!-- 헤더 배너 -->
    <section class="hero" :class="heroClass">
      <!-- 인라인 로고 -->
      <div class="logo" :aria-label="providerTitle ? providerTitle + ' 로고' : 'MoZi'" role="img">
        <span v-if="!isOauth" class="logo-text">MoZi</span>
        <svg v-else-if="summary.provider === 'KAKAO'" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#FEE500" />
          <path
            fill="#381E1F"
            d="M6.5 8h11a2.5 2.5 0 0 1 2.5 2.5v1.5A2.5 2.5 0 0 1 17.5 14H13l-2.8 2.8V14H6.5A2.5 2.5 0 0 1 4 12V10.5A2.5 2.5 0 0 1 6.5 8Z" />
        </svg>
        <svg v-else-if="summary.provider === 'NAVER'" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#03C75A" />
          <path fill="#FFFFFF" d="M7 7h2.4l5.2 7.3V7H17v10h-2.4L9.4 9.7V17H7V7Z" />
        </svg>
        <svg v-else-if="summary.provider === 'GOOGLE'" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <g transform="translate(12,12)">
            <circle
              r="8"
              fill="none"
              stroke="#4285F4"
              stroke-width="3"
              stroke-dasharray="12.566 37.699"
              transform="rotate(-45)" />
            <circle
              r="8"
              fill="none"
              stroke="#EA4335"
              stroke-width="3"
              stroke-dasharray="12.566 37.699"
              stroke-dashoffset="12.566"
              transform="rotate(-45)" />
            <circle
              r="8"
              fill="none"
              stroke="#FBBC05"
              stroke-width="3"
              stroke-dasharray="12.566 37.699"
              stroke-dashoffset="25.132"
              transform="rotate(-45)" />
            <circle
              r="8"
              fill="none"
              stroke="#34A853"
              stroke-width="3"
              stroke-dasharray="12.566 37.699"
              stroke-dashoffset="37.699"
              transform="rotate(-45)" />
          </g>
          <rect x="12" y="11" width="7" height="2" fill="#4285F4" rx="1" />
        </svg>
        <span v-else class="logo-text">MoZi</span>
      </div>

      <h2>{{ providerHeaderText }}</h2>
      <p>{{ providerSubText }}</p>
    </section>

    <main class="container">
      <!-- 요약 카드 -->
      <section class="card">
        <h3>내 정보</h3>
        <div v-if="loading" class="loading">불러오는 중...</div>
        <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
        <div v-else class="summary-list">
          <div class="kv">
            <span class="k">이메일</span><span class="v">{{ summary.email }}</span>
          </div>
          <div class="kv">
            <span class="k">가입일</span><span class="v">{{ summary.joinedDate }}</span>
          </div>
          <div class="kv">
            <span class="k">이용기간</span><span class="v">{{ summary.daysUsing }}일</span>
          </div>
          <div class="kv">
            <span class="k">저장 데이터</span
            ><span class="v">스크랩 {{ summary.scrapCount }}개, 목표 {{ summary.goalCount }}개</span>
          </div>
        </div>

        <!-- 일반 회원 전용: 비밀번호 확인 -->
        <div v-if="!isOauth" class="field">
          <label for="withdrawPassword">비밀번호 확인</label>
          <input
            id="withdrawPassword"
            type="password"
            v-model="password"
            :disabled="loading"
            :class="{ invalid: password && !passwordValid && !passwordChecking }"
            placeholder="비밀번호를 입력하세요"
            autocomplete="current-password" />
          <div class="hint">
            <span v-if="passwordChecking">확인 중...</span>
            <span v-else-if="password && passwordValid" class="ok">
              <font-awesome-icon :icon="['fas', 'check-circle']" />
              비밀번호가 확인되었습니다.
            </span>
            <span v-else-if="passwordError" class="err">{{ passwordError }}</span>
          </div>
        </div>
      </section>

      <!-- 탈퇴 방식 -->
      <section class="card">
        <h3>탈퇴 방식 선택</h3>

        <label class="option" :class="{ active: mode === 'appOnly' }">
          <input type="radio" name="withdrawMode" value="appOnly" v-model="mode" @change="modeError = ''" />
          <div class="option-body">
            <div class="option-head">
              <div class="title">
                <strong>MoZi에서만 탈퇴</strong>
                <span class="badge highlight">추천</span>
              </div>
            </div>
            <ul class="benefits">
              <li>
                {{ providerTitle ? `${providerTitle} 계정은 유지하고 MoZi만 탈퇴합니다.` : 'MoZi만 탈퇴합니다.' }}
              </li>
              <li>가입 이력 복구 가능</li>
              <li>다른 앱/서비스 로그인에 영향 없음</li>
            </ul>
          </div>
        </label>

        <label v-if="isOauth" class="option" :class="{ active: mode === 'unlinkAndDelete' }">
          <input type="radio" name="withdrawMode" value="unlinkAndDelete" v-model="mode" @change="modeError = ''" />
          <div class="option-body">
            <div class="title">
              <strong>{{ providerTitle ? `${providerTitle} 연동 해제 + 탈퇴` : '연동 해제 + 탈퇴' }}</strong>
            </div>
            <ul class="benefits">
              <li>
                {{
                  providerTitle ? `${providerTitle} 연동을 완전히 해제하고 탈퇴합니다.` : '계정을 완전히 삭제합니다.'
                }}
              </li>
              <li>{{ providerTitle ? '연동 복구 불가' : '복구 불가' }}</li>
              <li>다시 가입 시 재연동 필요</li>
            </ul>
          </div>
        </label>

        <p v-if="mode === null && modeError" class="mode-error">{{ modeError }}</p>
      </section>

      <!-- 탈퇴 사유 -->
      <section class="card">
        <h3>탈퇴 사유 (선택사항)</h3>
        <textarea
          v-model="reason"
          class="textarea"
          placeholder="더 나은 서비스를 위해 탈퇴 사유를 들려주시면 감사하겠습니다."
          rows="4" />
        <label class="agree">
          <input type="checkbox" v-model="agreed" />
          위 안내사항을 모두 확인했으며, 개인정보 및 이용정보가 삭제됨에 동의합니다. (필수)
        </label>

        <div class="actions">
          <button class="btn ghost" @click="onCancel">취소</button>
          <button class="btn primary" :disabled="!isSubmitEnabled" @click="openConfirmModal">MoZi에서 탈퇴하기</button>
        </div>
      </section>
    </main>

    <!-- 확인 모달 -->
    <div
      v-if="confirmOpen"
      class="mozi-modal-backdrop"
      @click.self="closeConfirmModal"
      @keydown.esc="closeConfirmModal"
      tabindex="-1">
      <div class="mozi-modal" role="dialog" aria-modal="true" aria-labelledby="withdrawConfirmTitle">
        <h4 id="withdrawConfirmTitle">탈퇴 전 최종 확인</h4>
        <p>아래 문구를 정확히 입력하면 탈퇴가 진행됩니다.</p>
        <p class="phrase">“{{ REQUIRED_PHRASE }}”</p>

        <input
          ref="confirmInputRef"
          class="input"
          type="text"
          v-model="confirmText"
          :placeholder="REQUIRED_PHRASE"
          @keyup.enter="onConfirmEnter" />

        <div class="msg">
          <span v-if="confirmText.trim() === REQUIRED_PHRASE" class="ok">
            <font-awesome-icon :icon="['fas', 'check-circle']" />
            문구가 일치합니다.
          </span>
          <span v-else-if="confirmText" class="err">문구가 일치하지 않습니다.</span>
          <span v-if="confirmError" class="err" style="display: block; margin-top: 4px">{{ confirmError }}</span>
        </div>

        <div class="actions">
          <button class="btn secondary" :disabled="confirmBusy" @click="closeConfirmModal">취소</button>
          <button class="btn primary" :disabled="!confirmOKEnabled" @click="performWithdrawal">
            {{ confirmBusy ? '처리 중...' : '확인하고 탈퇴' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary: #36c18c;
  --primary-weak: #e7f7f1;
  --danger: #ff4d4f;
  --text: #111;
  --muted: #555;
  --line: #e5e7eb;
  --disabled-bg: #f2f4f6;
  --disabled-text: #b0b8c1;
  --card-bg: #ffffff;
  --bg: #f7f8fa;
  --hero: #36c18c;
}

.page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow-y: auto;
  /* Firefox */
  scrollbar-width: none;
  /* IE/Edge */
  -ms-overflow-style: none;
}
.page::-webkit-scrollbar {
  display: none;
}
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
}
.nav-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.hero {
  width: 100%;
  max-width: 720px;
  margin: 8px auto 16px;
  background: linear-gradient(180deg, var(--hero), #ffc93c);
  border-radius: 14px;
  padding: 26px 20px 22px;
  text-align: center;
  color: #4a3b00;
  position: relative;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06);
}
.hero .logo {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -22px;
  display: grid;
  place-items: center;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.hero .logo .logo-text {
  font-weight: 800;
  font-size: 12px;
  color: #36c18c;
  letter-spacing: 0.2px;
}
.hero h2 {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  line-height: 1.2;
  background-color: var(--title-chip-bg, transparent);
  color: var(--title-chip-color, inherit);
}
.hero p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.container {
  width: 100%;
  max-width: 720px;
  margin: 0 auto 40px;
  padding: 0 14px;
  display: grid;
  gap: 14px;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  margin-top: 0;
}
.card > h3 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: bolder;
}
.loading {
  color: var(--muted);
  font-size: 14px;
}
.error {
  color: var(--danger);
  font-size: 14px;
}

.kv {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 8px;
  align-items: center;
  background: #fafafa;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 12px;
}
.kv .k {
  color: #777;
  font-size: 12px;
}
.kv .v {
  color: var(--text);
  font-size: 13px;
}

/* 비밀번호 필드 */
.field {
  margin-top: 12px;
  display: grid;
  gap: 6px;
}
.field label {
  font-size: 13px;
  color: #333;
}
.field input {
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--line);
  padding: 0 12px;
  font-size: 14px;
  outline: none;
}
.field input:focus {
  border-color: #36c18c;
  box-shadow: 0 0 0 4px rgba(54, 193, 140, 0.15);
}
.field input.invalid {
  border-color: #ef4444;
}
.hint {
  min-height: 18px;
  font-size: 12px;
  margin-top: 8px;
}
.hint .ok {
  color: #22c55e;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.hint .err {
  color: #ef4444;
}

/* 옵션 */
.option {
  display: grid;
  grid-template-columns: 22px 1fr;
  align-items: start;
  gap: 10px;
  border: 1.5px solid transparent;
  border-radius: 12px;
  padding: 12px 14px;
  transition: border-color 0.15s;
}
.option input[type='radio'] {
  accent-color: var(--primary);
  width: 18px;
  height: 18px;
  margin: 2px 0 0 0;
}
.option.active {
  border-color: #36c18c;
}
.option .option-body {
  display: grid;
  gap: 6px;
}
.option .title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.option .badge {
  margin-left: 6px;
  font-size: 11px;
  color: var(--primary);
  background: var(--primary-weak);
  border-radius: 999px;
  padding: 2px 6px;
  border: 1px solid var(--primary);
}
.badge.highlight {
  background-color: #36c18c;
  color: #fff;
  padding: 4px 6px;
  border-radius: 4px;
}
.option .benefits {
  margin: 6px 0 0 18px;
  list-style: none;
  color: #333;
  font-size: 13px;
  padding: 0;
}

/* 텍스트 영역 */
.textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #36c18c;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  resize: vertical;
  background: #fff;
}
textarea:focus {
  outline: none;
  border-color: #36c18c;
  box-shadow: 0 0 5px rgba(54, 193, 140, 0.5);
}

/* 동의/버튼 */
.agree {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #333;
  margin-top: 2rem;
}
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}
.btn {
  height: 44px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.btn.primary {
  background-color: var(--primary, #36c18c);
  color: #fff;
}
.btn.primary:disabled {
  background-color: #f2f4f6 !important;
  color: #b0b8c1 !important;
  cursor: not-allowed;
}
.btn.ghost {
  background: #fff;
  color: #9ca3af;
  border: 1px solid var(--line);
}
.btn.secondary {
  background: #fff;
  color: #374151;
  border: 1px solid var(--line);
}

/* 에러/모드 */
.mode-error {
  margin: 6px 0 0;
  font-size: 12px;
  color: #ff4d4f;
}
.card .summary-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px;
}
.card .summary-list > .kv {
  width: 100% !important;
}

/* 모달 (기본) — 사용 안함(백업) */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.modal {
  width: min(92vw, 420px);
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}
.modal h4 {
  margin: 0 0 8px;
  font-size: 18px;
}
.modal p {
  margin: 0 0 12px;
  font-size: 13px;
  color: #333;
}
.modal .phrase {
  font-weight: 700;
  color: #111;
}
.modal .input {
  width: 100%;
  height: 42px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
}
.modal .input:focus {
  border-color: #36c18c;
  box-shadow: 0 0 0 4px rgba(54, 193, 140, 0.15);
}
.modal .msg {
  min-height: 18px;
  font-size: 12px;
  margin-top: 8px;
}
.modal .ok {
  color: #22c55e;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.modal .err {
  color: #ef4444;
}
.modal .actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}

/* === 모달 (Bootstrap 충돌 회피용 커스텀 클래스) === */
.mozi-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 2050; /* Bootstrap보다 위 */
}

.mozi-modal {
  width: min(92vw, 420px);
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  display: block !important; /* .modal 기본 display:none 무력화 */
}

.mozi-modal h4 {
  margin: 0 0 8px;
  font-size: 18px;
}
.mozi-modal p {
  margin: 0 0 12px;
  font-size: 13px;
  color: #333;
}
.mozi-modal .phrase {
  font-weight: 700;
  color: #111;
}
.mozi-modal .input {
  width: 100%;
  height: 42px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
}
.mozi-modal .input:focus {
  border-color: #36c18c;
  box-shadow: 0 0 0 4px rgba(54, 193, 140, 0.15);
}
.mozi-modal .msg {
  min-height: 18px;
  font-size: 12px;
  margin-top: 8px;
}
.mozi-modal .ok {
  color: #22c55e;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.mozi-modal .err {
  color: #ef4444;
}
.mozi-modal .actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}
</style>
