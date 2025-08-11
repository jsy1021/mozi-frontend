<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBankStore } from '@/stores/bank';
const bankStore = useBankStore();
const bankList = bankStore.banks;

const router = useRouter();
const route = useRoute();

const requiredAgreeChecked = ref(false);
const optionalAgreeChecked = ref(false);

function handleAgree() {
  if (requiredAgreeChecked.value) {
    router.push({
      path: '/account/BankConnectPage',
      query: {
        mode: route.query.mode ?? 'first',
        redirect: route.query.redirect || '/account/BankSummaryPage',
        agreed: 'true',
      },
    });
  } else {
    alert('필수 항목에 동의해야 합니다.');
  }
}

function goBack() {
  router.back();
}

function toggleRequired() {
  requiredAgreeChecked.value = !requiredAgreeChecked.value;
}

function toggleOptional() {
  optionalAgreeChecked.value = !optionalAgreeChecked.value;
}

// 모두 동의 함수
function setAllAgree() {
  requiredAgreeChecked.value = true;
  optionalAgreeChecked.value = true;
}

const showModal = ref(false);
const modalContent = ref('');
const modalType = ref('text'); // 'text' or 'bankList'

const personalAgree = `
<div class="modal-text">
  <p>회사는 다음과 같이 개인정보를 수집·이용합니다.</p>
  <ol>
    <li>수집 항목
      <ul>
        <li>필수항목: 성명, 생년월일, 휴대전화번호, 계좌번호, 은행명, 잔액등</li>
      </ul>
    </li>
    <li>수집·이용 목적
      <ul>
        <li>계좌 연동 서비스 제공</li>
        <li>보유계좌 및 잔액 조회</li>
      </ul>
    </li>
    <li>보유 및 이용기간
      <ul>
        <li>서비스 해지 또는 동의 철회 시까지</li>
      </ul>
    </li>
    <li>동의 거부 권리 안내
      <ul>
        <li>이용자는 본 개인정보 수집·이용에 동의하지 않을 권리가 있으며, 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.</li>
      </ul>
    </li>
  </ol>
  </div>
`;

const personalInfoAgree = ` <div class="modal-text">
    <table class="agree-table">
  <thead>
    <tr>
      <th>정보 보내는 곳</th>
      <th>정보 받는 곳</th>
      <th>제공 목적</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>㈜모지(Mozi)</td>
      <td>㈜헥토데이터</td>
      <td>금융기관 계좌 연동을 위한 본인 인증</td>
    </tr>
    </tbody>
    <thead>
    <tr>
      <th colspan="2">제공 항목</th>
      <th>보유 및 이용 기간</th>
    </tr>
      </thead>
      <tbody>
    <tr>
      <td colspan="2">금융기관 로그인 정보(아이디, 비밀번호)</td>
      <td>MOzi: 로그인 정보 저장하지 않음<br/>CODEF: 약관·법령 및 운영정책에 따른 기간</td>
    </tr>
     </tbody>
  
</table>`;

const connectedIDAgree = ` <div class="modal-text">
    <table class="agree-table">
  <thead>
    <tr>
      <th>정보 보내는 곳</th>
      <th>정보 받는 곳</th>
      <th>제공 목적</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>㈜헥토데이터</td>
      <td>㈜모지(Mozi)</td>
      <td>금융기관 인증 완료 사용자를 식별하고, 지속적인 계좌 조회를 위한 연동 유지</td>
    </tr>
    </tbody>
    <thead>
    <tr>
      <th colspan="2">제공 항목</th>
      <th>보유 및 이용 기간</th>
    </tr>
      </thead>
      <tbody>
    <tr>
      <td colspan="2">connectedId</td>
      <td>서비스 해지 또는 동의 철회 시까지</td>
    </tr>
     </tbody>
  
</table>`;

const accountDataAgree = ` <div class="modal-text">
    <table class="agree-table">
  <thead>
    <tr>
      <th>정보 보내는 곳</th>
      <th>정보 받는 곳</th>
      <th>제공 목적</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>귀하가 선택한 금융기관</td>
      <td>㈜헥토데이터, ㈜모지(Mozi)</td>
      <td>보유계좌 및 잔액 조회</td>
    </tr>
    </tbody>
    <thead>
    <tr>
      <th colspan="2">제공 항목</th>
      <th>보유 및 이용 기간</th>
    </tr>
      </thead>
      <tbody>
    <tr>
      <td colspan="2">계좌목록 정보(계좌번호, 계좌명, 상품종류, 잔액 등</td>
      <td>서비스 해지 또는 동의 철회 시까지</td>
    </tr>
     </tbody>
  
</table>`;

function openModal(content, type = 'text') {
  modalContent.value = content;
  modalType.value = type;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}
</script>

<template>
  <div class="wrapper">
    <div class="content">
      <div class="header-row">
        <div class="back-btn" @click="goBack">
          <i class="fa-solid fa-angle-left"></i>
        </div>
        <p
          style="
            font-size: 18px;
            font-weight: 550;
            color: #757575;
            margin-top: 12px;
          "
        >
          약관 동의
        </p>
      </div>

      <!-- 모두 동의 버튼 -->
      <div>
        <button class="TotalAgreeCard-btn" @click="setAllAgree">
          약관에 모두 동의
        </button>
      </div>

      <!-- 필수 항목 -->
      <div class="agree-list">
        <div class="agree-title-row" @click="toggleRequired">
          <i
            class="fa-solid fa-check"
            :style="{ color: requiredAgreeChecked ? '#2e8b57' : '#d9d9d9' }"
          ></i>
          <p class="agree-title">개인(신용)정보 수집·이용 동의 [필수]</p>
        </div>
        <div class="agree-item-row">
          <p class="agree-item">정보를 보내는 곳: 12개 은행</p>
          <i
            class="fa-solid fa-angle-right"
            @click="openModal(bankList, 'bankList')"
          ></i>
        </div>

        <div class="agree-item-row">
          <p class="agree-item">개인정보 수집·이용 동의</p>
          <i
            class="fa-solid fa-angle-right"
            @click="openModal(personalAgree)"
          ></i>
        </div>
      </div>

      <!-- 선택 항목 -->
      <div class="agree-list">
        <div class="agree-title-row" @click="toggleOptional">
          <i
            class="fa-solid fa-check"
            :style="{ color: optionalAgreeChecked ? '#2e8b57' : '#d9d9d9' }"
          ></i>
          <p class="agree-title">개인(신용)정보 제3자 제공 동의 [필수]</p>
        </div>
        <div class="agree-item-row">
          <p class="agree-item">본인인증 정보 제공 동의</p>
          <i
            class="fa-solid fa-angle-right"
            @click="openModal(personalInfoAgree)"
          ></i>
        </div>
        <div class="agree-item-row">
          <p class="agree-item">연결 식별자(connectedId) 제공 동의</p>
          <i
            class="fa-solid fa-angle-right"
            @click="openModal(connectedIDAgree)"
          ></i>
        </div>
        <div class="agree-item-row">
          <p class="agree-item">계좌데이터 제공 동의</p>
          <i
            class="fa-solid fa-angle-right"
            @click="openModal(accountDataAgree)"
          ></i>
        </div>
      </div>

      <!-- 동의하기 버튼 -->
      <button
        class="Agreecard-btn"
        :style="{
          backgroundColor: requiredAgreeChecked ? '#36C18C' : '#36C18C80',
        }"
        :disabled="!requiredAgreeChecked"
        @click="handleAgree"
      >
        동의하기
      </button>
    </div>
  </div>

  <!-- 모달 -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-scroll">
        <template v-if="modalType === 'bankList'">
          <ul class="bank-list">
            <li v-for="bank in bankList" :key="bank.code" class="bank-item">
              <img :src="bank.logo" alt="" class="bank-logo" />
              <span class="bank-name">{{ bank.name }}</span>
            </li>
          </ul>
        </template>
        <template v-else>
          <div v-html="modalContent"></div>
        </template>
      </div>
      <button @click="closeModal" class="modal-botton">닫기</button>
    </div>
  </div>
</template>

<style>
.wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  height: 700px;
  background-color: #fff;
}

.content {
  text-align: center;
  width: 300px;
  margin: 0 auto;
}

.header-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0 65px 0;
}

.back-btn {
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0a0a0;
  font-size: 18px;
  margin-top: -4px;
  cursor: pointer;
}

.agree-list {
  text-align: left;
  margin-top: 30px;
  width: 100%;
}

.agree-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.agree-title {
  font-size: 15px;
  font-weight: 500;
  color: #585858;
  margin: 0 0 4px 0;
}

.agree-item {
  font-size: 13px;
  font-weight: 400;
  color: #8c8c8c;
  margin: 2px 0;
}

.agree-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  cursor: pointer;
  margin-left: 20px;
}

.agree-item-row i {
  color: #b0b0b0;
}

.modal-overlay {
  position: absolute; /* fixed → absolute 변경 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  text-align: left;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-scroll {
  overflow-y: auto;
  flex-grow: 1;
  margin-bottom: 16px;
  max-height: 60vh;
  padding-right: 6px;
}

.bank-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.bank-logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}
.bank-name {
  font-size: 13px;
  font-weight: 500;
  color: #585858;
}
.modal-text {
  font-size: 12px;
  color: #333;
  line-height: 1.5;
}
.modal-text ol {
  padding-left: 20px;
  margin: 10px 0;
}
.modal-text ul {
  margin-left: -10px;
  margin-bottom: 10px;
}

.modal-text li {
  margin-bottom: 6px;
}

.agree-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8px;
  color: #333;
}
.agree-table th,
.agree-table td {
  border: 1px solid #ccc;
  padding: 12px;
  text-align: left;
}
.agree-table thead {
  background-color: #f0f0f0;
  font-weight: 600;
}

/* 모두 동의 카드 스타일 버튼 */
.TotalAgreeCard-btn {
  font-size: 13px;
  font-weight: 450;
  color: #36c18c;
  display: block;
  width: 100%;
  margin: 20px 0 0 0;
  padding: 10px 0;
  border-radius: 6px;
  border: 2.3px solid #36c18c;
  background: #fafafa;
  box-shadow: 0 4px 2px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.TotalAgreeCard-btn:active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
  background: #e0e0e0;
  transform: scale(0.98);
  transition: box-shadow 0.1s, background 0.1s, transform 0.1s;
}

/* 동의하기 카드 스타일 버튼 */
.Agreecard-btn {
  display: block;
  width: 100%;
  margin: 200px 0 0 0;
  padding: 10px 0;
  border-radius: 4px;
  border: 0 solid white;
  color: #ffffff;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.4);
  font-size: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.Agreecard-btn:active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
  background: #bdbdbd;
  transform: scale(0.98);
  transition: box-shadow 0.1s, background 0.1s, transform 0.1s;
}

/* 모달 카드 스타일 버튼 */
.modal-botton {
  font-size: 13px;
  font-weight: 450;
  color: #ffff;
  display: block;
  width: 100%;
  margin: 0px 0 0 0;
  padding: 10px 0;
  border-radius: 6px;
  border: 2.3px solid #36c18c;
  background: #36c18c;
  box-shadow: 0 4px 2px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.modal-botton:active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
  background: #36c18c;
  transform: scale(0.98);
  transition: box-shadow 0.1s, background 0.1s, transform 0.1s;
}
</style>
