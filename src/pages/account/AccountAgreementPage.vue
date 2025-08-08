<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const requiredAgreeChecked = ref(false);
const optionalAgreeChecked = ref(false);

function handleAgree() {
  if (requiredAgreeChecked.value) {
    router.push({ path: '/account/BankConnectPage', query: { from: 'agree' } });
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

// ✅ 모두 동의 함수
function setAllAgree() {
  requiredAgreeChecked.value = true;
  optionalAgreeChecked.value = true;
}

const showModal = ref(false);
const modalContent = ref('');

function openModal(content) {
  modalContent.value = content;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

// ✅ 약관 텍스트들
const termsOfService = `제1조(목적)
본 약관은 [회사명] (이하 "회사")이 제공하는 [서비스명] (이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조(이용계약의 성립)
1. 이용계약은 이용자가 본 약관에 동의하고, 회사가 이를 승낙함으로써 성립합니다.
2. 회사는 서비스의 기술적·운영상의 이유로 가입 승낙을 유보하거나 거절할 수 있습니다.

제3조(이용자의 의무)
이용자는 다음 각 호의 행위를 하여서는 안 됩니다.
1. 허위 정보 등록 또는 타인의 정보 도용
2. 회사 서비스의 운영을 방해하는 행위
3. 회사의 지적재산권 등 권리를 침해하는 행위

제4조(회사의 의무)
회사는 관련 법령과 본 약관이 정하는 바에 따라 서비스를 안정적으로 제공하기 위해 최선을 다합니다.

제5조(서비스 이용의 제한 및 해지)
회사는 이용자가 본 약관을 위반하거나, 서비스 운영을 방해하는 경우 사전 통지 없이 이용계약을 해지하거나 이용을 제한할 수 있습니다.

제6조(면책조항)
1. 회사는 천재지변, 정전, 통신장애 등 불가항력 사유로 인해 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.
2. 회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.

제7조(약관의 변경)
회사는 본 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해 사전 고지합니다. 변경된 약관에 동의하지 않을 경우 이용자는 서비스 이용을 중단할 수 있습니다.

제8조(준거법 및 재판관할)
본 약관은 대한민국 법령에 따라 해석되며, 본 서비스와 관련된 분쟁은 회사 본사 소재지를 관할하는 법원을 제1심 관할법원으로 합니다.
`;

const personalAgree = `회사는 다음과 같이 개인정보를 수집·이용합니다.

1. 수집 항목
- 필수항목: 성명, 생년월일, 휴대전화번호, 계좌번호, 은행명

2. 수집·이용 목적
- 계좌 연동 서비스 제공
- 본인 확인 및 고객 문의 응대
- 전자금융거래 기록 보관

3. 보유 및 이용기간
- 회원 탈퇴 시 또는 수집 목적 달성 시까지
(단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관함)

4. 동의 거부 권리 안내
- 이용자는 본 개인정보 수집·이용에 동의하지 않을 권리가 있으며, 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.
`;

const AnotherpersonalAgree = `회사는 서비스 제공을 위해 아래와 같이 개인정보를 제3자에게 제공합니다.

1. 제공받는 자
- 계좌 연동 대상 금융기관, 제휴기관

2. 제공 항목
- 성명, 생년월일, 계좌번호, 은행명

3. 제공 목적
- 계좌정보 연동 및 본인 확인

4. 보유 및 이용기간
- 제공 목적 달성 시까지

5. 동의 거부 권리 안내
- 이용자는 제3자 제공에 대한 동의를 거부할 권리가 있으며, 동의하지 않을 경우 일부 서비스 이용이 제한될 수 있습니다.
`;

const MtermsOfService = `본 약관은 회사가 제공하는 마케팅 정보 및 광고성 정보 수신과 관련된 이용자의 권리 및 의무를 규정합니다.

이용자는 동의를 통해 SMS, 이메일, 앱 푸시 등 다양한 채널로 광고, 이벤트, 할인정보 등을 수신할 수 있습니다.

동의는 선택사항이며, 동의하지 않더라도 서비스 이용에는 제한이 없습니다.

이용자는 언제든지 수신 거부를 할 수 있으며, 수신 거부 시 즉시 마케팅 정보 제공이 중단됩니다.`;

const MpersonalAgree = `회사는 마케팅 정보 제공을 위해 이름, 연락처(휴대폰 번호, 이메일), 서비스 이용 기록 등의 개인정보를 수집·이용합니다.

수집된 개인정보는 마케팅 목적 외 다른 용도로 사용되지 않습니다.

개인정보 보유 및 이용 기간은 동의 철회 시까지이며, 관련 법령에 따라 별도로 보관할 수 있습니다.

이용자는 개인정보 수집 및 이용에 대해 동의를 거부할 권리가 있으나, 이 경우 마케팅 정보 수신은 제한됩니다.`;

const MAnotherpersonalAgree = `회사는 광고주, 제휴사 등 마케팅 관련 제3자에게 이용자의 개인정보를 제공할 수 있습니다.

제공되는 정보는 이름, 연락처, 마케팅 수신 동의 여부 등 최소한의 정보에 한합니다.

제3자 제공 목적은 맞춤형 광고, 프로모션 안내 등이며, 제공 기간 및 수단은 계약에 따라 관리됩니다.

이용자는 제3자 제공 동의를 거부할 수 있으며, 이 경우 일부 마케팅 혜택이 제한될 수 있습니다.`;
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

      <!-- ✅ 모두 동의 버튼 수정 -->
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
          <p class="agree-title">MoZi 필수 항목 모두 동의</p>
        </div>
        <div class="agree-item-row">
          <p class="agree-item">서비스 이용약관</p>
          <i
            class="fa-solid fa-angle-right"
            @click="openModal(termsOfService)"
          ></i>
        </div>
        <div class="agree-item-row">
          <p class="agree-item">개인정보 수집이용 동의</p>
          <i
            class="fa-solid fa-angle-right"
            @click="openModal(personalAgree)"
          ></i>
        </div>
        <div class="agree-item-row">
          <p class="agree-item">개인정보 제 3자 제공 동의</p>
          <i
            class="fa-solid fa-angle-right"
            @click="openModal(AnotherpersonalAgree)"
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
          <p class="agree-title">마케팅 정보 수신 동의(선택)</p>
        </div>
        <div class="agree-item-row">
          <p class="agree-item">서비스 이용약관</p>
          <i
            class="fa-solid fa-angle-right"
            @click="openModal(MtermsOfService)"
          ></i>
        </div>
        <div class="agree-item-row">
          <p class="agree-item">개인정보 수집이용 동의</p>
          <i
            class="fa-solid fa-angle-right"
            @click="openModal(MpersonalAgree)"
          ></i>
        </div>
        <div class="agree-item-row">
          <p class="agree-item">개인정보 제 3자 제공 동의</p>
          <i
            class="fa-solid fa-angle-right"
            @click="openModal(MAnotherpersonalAgree)"
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
        <pre>{{ modalContent }}</pre>
      </div>
      <button @click="closeModal" class="modal-botton">닫기</button>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center; /* 가로 중앙 정렬 */
  /* align-items: center;세로 중앙 정렬 */
  height: 700px; /* 화면 전체 높이 */
  background-color: #f8f8f8;
}

.content {
  text-align: center;
  width: 300px; /* 원하는 카드 너비로 지정 */
  margin: 0 auto;
}

.header-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0 65px 0;
  /* gap: 100px; 버튼과 h1 사이 간격 */
}

.back-btn {
  position: absolute;
  left: 0px; /*뒤로가기 버튼 위치 조정*/
  top: 50%;
  transform: translateY(-50%);
  color: #a0a0a0;
  font-size: 18px;
  margin-top: -4px;
  cursor: pointer;
}
.header-row h1 {
  margin: 40px auto;
}
/* style 부분 */
.agree-list {
  text-align: left;
  margin-top: 30px;
  width: 100%;
}
.agree-title-row {
  display: flex;
  align-items: center;
  gap: 8px; /* 제목과 체크박스 사이 간격 */
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
  position: fixed;
  font-size: 7px;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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
  width: 70%;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  text-align: left;
  max-height: 80vh; /* 화면 높이 제한 */
  display: flex;
  flex-direction: column;
}
.modal-scroll {
  overflow-y: auto;
  flex-grow: 1;
  margin-bottom: 16px;
  max-height: 60vh; /* 실제 스크롤되는 영역의 높이 제한 */
  padding-right: 6px; /* 스크롤바 공간 */
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18); /* 그림자 작게, 눌린 느낌 */
  background: #e0e0e0; /* 배경색 살짝 어둡게 */
  transform: scale(0.98); /* 버튼이 살짝 작아짐 */
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
  /* background: #36c18c; */
  color: #ffffff;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.4);
  font-size: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.Agreecard-btn:active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18); /* 그림자 작게, 눌린 느낌 */
  background: #bdbdbd; /* 더 어둡게 */
  transform: scale(0.98); /* 살짝 작아짐 */
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18); /* 그림자 작게, 눌린 느낌 */
  background: #36c18c; /* 배경색 살짝 어둡게 */
  transform: scale(0.98); /* 버튼이 살짝 작아짐 */
  transition: box-shadow 0.1s, background 0.1s, transform 0.1s;
}
</style>
