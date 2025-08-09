import { defineStore } from 'pinia'

export const useTabStore = defineStore('tabStore', {
  state: () => ({
    currentTab: null, // 'main' | 'recommend' | 'goal' | 'asset' | 'search'
  }),
  actions: {
    setTab(tab) {
      this.currentTab = tab
    },
    clearTab() {
      this.currentTab = null
    },
  },
})

