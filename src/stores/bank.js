// src/stores/bank.js
import { defineStore } from 'pinia';

export const useBankStore = defineStore('bank', {
  state: () => ({
    banks: [
      {
        name: '산업은행',
        code: '0002',
        logo: '/resources/images/financial/kdbbank.png',
        connected: false,
      },
      {
        name: '기업은행',
        code: '0003',
        logo: '/resources/images/financial/ibkbank.png',
        connected: false,
      },
      {
        name: '국민은행',
        code: '0004',
        logo: '/resources/images/financial/kbbank.png',
        connected: false,
      },
      {
        name: '우리은행',
        code: '0020',
        logo: '/resources/images/financial/wooribank.png',
        connected: false,
      },
      {
        name: '수협은행',
        code: '0007',
        logo: '/resources/images/financial/suhyupbank.png',
        connected: false,
      },
      {
        name: '농협은행',
        code: '0011',
        logo: '/resources/images/financial/nhbank.png',
        connected: false,
      },
      {
        name: 'SC은행',
        code: '0023',
        logo: '/resources/images/financial/scbank.png',
        connected: false,
      },
      {
        name: '씨티은행',
        code: '0027',
        logo: '/resources/images/financial/citybank.png',
        connected: false,
      },
      {
        name: '대구은행',
        code: '0031',
        logo: '/resources/images/financial/daegubank.png',
        connected: false,
      },
      {
        name: '부산은행',
        code: '0032',
        logo: '/resources/images/financial/bnkbank.png',
        connected: false,
      },
      {
        name: '광주은행',
        code: '0034',
        logo: '/resources/images/financial/gwangjubank.png',
        connected: false,
      },
      {
        name: '제주은행',
        code: '0035',
        logo: '/resources/images/financial/shinhanbank.png',
        connected: false,
      },
      {
        name: '전북은행',
        code: '0037',
        logo: '/resources/images/financial/jeonbuk.png',
        connected: false,
      },
      {
        name: '경남은행',
        code: '0039',
        logo: '/resources/images/financial/bnkbank.png',
        connected: false,
      },
      {
        name: '새마을금고',
        code: '0045',
        logo: '/resources/images/financial/KFCCbank.png',
        connected: false,
      },
      {
        name: '신협은행',
        code: '0048',
        logo: '/resources/images/financial/sinhyupbank.png',
        connected: false,
      },
      {
        name: '우체국',
        code: '0071',
        logo: '/resources/images/financial/koreapostbank.png',
        connected: false,
      },
      {
        name: 'KEB하나은행',
        code: '0081',
        logo: '/resources/images/financial/kebhanabank.png',
        connected: false,
      },
      {
        name: '신한은행',
        code: '0088',
        logo: '/resources/images/financial/shinhanbank.png',
        connected: false,
      },
      {
        name: 'K뱅크',
        code: '0089',
        logo: '/resources/images/financial/kbank.png',
        connected: false,
      },
    ],
  }),
  actions: {
    markAsConnected(code) {
      const bank = this.banks.find((b) => b.code === code);
      if (bank) bank.connected = true;
    },
  },
  getters: {
    connectedCount: (state) => state.banks.filter((b) => b.connected).length,
  },
});
