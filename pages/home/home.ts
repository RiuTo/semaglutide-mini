import {
  initInjectionPlan,
  completeInjection,
  getDaysUntilNextInjection,
  getRecentRecords,
  getCurrentWeekValue,
  getRecommendedDoseValue,
  getNextSiteValue,
  resetPlan
} from '../../logic/index'
import type { InjectionRecord, InjectionPlan } from '../../storage/index'

Page({
  data: {
    plan: null as InjectionPlan | null,
    daysUntilNext: 0,
    recentRecords: [] as InjectionRecord[],
    currentWeek: 1,
    recommendedDose: 0.25,
    nextSite: '',
    historyCount: 0,
    planTypeName: '减重方案'
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const plan = initInjectionPlan()
    const daysUntilNext = getDaysUntilNextInjection()
    const recentRecords = getRecentRecords(20)

    const currentWeek = getCurrentWeekValue(plan.startDate)
    const recommendedDose = getRecommendedDoseValue(plan.startDate, plan.type)
    const nextSiteStr = getNextSiteValue()
    const historyCount = recentRecords.length

    const planTypeName = plan.type === 'weight' ? '减重方案' : '糖尿病方案'

    console.log('当前周数:', currentWeek)
    console.log('推荐剂量:', recommendedDose)
    console.log('下次部位:', nextSiteStr)

    this.setData({
      plan,
      daysUntilNext,
      recentRecords,
      currentWeek,
      recommendedDose,
      nextSite: nextSiteStr,
      historyCount,
      planTypeName
    })
  },

  onCompleteInjection() {
    const result = completeInjection()
    if (result) {
      console.log('注射完成:', result)
      console.log('本次剂量:', result.dose)
      console.log('本次部位:', result.site)
      console.log('下次日期:', result.nextDate)
      this.loadData()
      wx.showToast({
        title: '已完成注射',
        icon: 'success',
        duration: 2000
      })
    } else {
      wx.showToast({
        title: '今日已记录',
        icon: 'none',
        duration: 2000
      })
    }
  },

  onResetClick() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置注射计划吗？所有数据将恢复为默认值。',
      success: (res) => {
        if (res.confirm) {
          resetPlan()
          this.loadData()
          wx.showToast({
            title: '已重置',
            icon: 'success'
          })
        }
      }
    })
  },

  onViewHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  onRepair() {
    wx.navigateTo({
      url: '/pages/repair/repair'
    })
  },

  onViewEffect() {
    wx.navigateTo({
      url: '/pages/effect/effect'
    })
  },

  formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  }
})
