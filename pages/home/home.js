var logic = require('../../logic/index.js')
var titration = require('../../logic/titration.js')
var rotate = require('../../logic/rotate.js')
var effect = require('../../logic/effect.js')
var reminderStorage = require('../../storage/reminder.js')
var notify = require('../../services/notify.js')
var config = require('../../config/index.js')
var injectStore = require('../../storage/injectStore.js')
var pen = require('../../logic/pen.js')
var drugCatalog = require('../../logic/drugCatalog.js')
var refill = require('../../logic/refill.js')
var metricLogic = require('../../logic/metric.js')
var metricStorage = require('../../storage/metric.js')

Page({
  data: {
    plan: null,
    daysUntilNext: 0,
    isInjectDay: false,
    hasRecords: false,
    injectionCount: 0,
    recentRecords: [],
    currentWeek: 1,
    recommendedDose: 0.25,
    currentDose: 0,
    nextSite: '',
    historyCount: 0,
    planTypeName: '减重方案',
    todayEffect: 0,
    nextReminderText: '',
    nextInjectionShortDate: '',
    lastInjectionShortDate: '',
    reminderCountdownText: '',
    reminderCountdownHours: 0,
    reminderCountdownMinutes: 0,
    version: '',
    env: '',
    drugName: '',
    brandName: '',
    penSize: 0,
    remainDose: 0,
    remainPercent: 0,
    totalUsedDose: 0,
    needReplacePen: false,
    refillRemainDose: 0,
    metric: 'weight',
    metricLabel: '体重',
    metricIcon: '⚖️',
    metricCardState: 'EMPTY',
    metricCardData: null,
    metricReminder: null,
    metricCardEnabled: true
  },

  onLoad: function () {
    if (!getApp().checkInitialized()) {
      wx.redirectTo({
        url: '/pages/onboarding/onboarding'
      })
      return
    }
    this.loadData()
  },

  onShow: function () {
    // 同步 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    this.loadData()
  },

  loadData: function () {
    var plan = logic.initInjectionPlan()
    var daysUntilNext = logic.getDaysUntilNextInjection()
    var isInjectDay = daysUntilNext === 0
    var recentRecords = logic.getRecentRecords(1)
    var hasRecords = recentRecords.length > 0
    var injectionCount = (plan.records && plan.records.length) || 0

    var currentWeek = logic.getCurrentWeek(plan.startDate)
    var planType = plan.planType || plan.type || 'weight'
    var recommendedDose = logic.getRecommendedDose(plan.startDate, planType)
    var currentDose = (recentRecords.length > 0 && recentRecords[0].dose)
      ? (recentRecords[0].dose + 'mg')
      : '未记录'
    var lastDose = (recentRecords.length > 0 && recentRecords[0].dose)
      ? recentRecords[0].dose
      : 0
    var lastSite = (recentRecords.length > 0 && recentRecords[0].site)
      ? recentRecords[0].site
      : ''
    var suggestedSite = rotate.getSuggestedSite()
    var historyCount = recentRecords.length

    var metric = metricLogic.getMetricType()
    var metricLabel = metricLogic.getMetricLabel(metric)
    var metricIcon = metricLogic.getMetricIcon(metric)
    var planTypeName = metric === 'weight' ? '减重方案' : '糖尿病方案'

    var todayEffect = null
    if (recentRecords.length > 0) {
      todayEffect = effect.getTodayEffect(recentRecords[0].date)
    }

    var nextReminderText = reminderStorage.getNextReminderText(plan.nextInjectionDate || plan.nextInject)
    var countdown = notify.getReminderCountdown()

    var nextInjectionShortDate = this.formatShortDate(plan.nextInjectionDate || plan.nextInject)
    var lastInjectionShortDate = ''
    if (recentRecords.length > 0) {
      lastInjectionShortDate = this.formatShortDate(recentRecords[0].date)
    }

    var spec = drugCatalog.getDrugSpec(plan.specKey)
    var drugName = spec ? spec.drugName : ''
    var brandName = spec ? spec.brandName : ''
    var penSize = plan.penSize || 0

    var remain = pen.getRemainDose(plan)
    var totalUsedDose = (plan.penSize || 0) - remain.remainDose

    var refillInfo = refill.getRefillInfo(plan, recommendedDose)

    var metricCardState = metricLogic.getMetricCardState()
    var metricCardData = metricLogic.getMetricCardData()
    var metricReminder = metricLogic.getMetricReminder()
    var metricCardEnabled = metricStorage.isEnabled()

    this.setData({
      plan: plan,
      daysUntilNext: daysUntilNext,
      isInjectDay: isInjectDay,
      hasRecords: hasRecords,
      injectionCount: injectionCount,
      recentRecords: this.formatRecords(recentRecords),
      currentWeek: currentWeek,
      recommendedDose: recommendedDose,
      currentDose: currentDose,
      lastDose: lastDose,
      lastSite: lastSite,
      nextSite: suggestedSite,
      historyCount: historyCount,
      planTypeName: planTypeName,
      todayEffect: todayEffect,
      nextReminderText: nextReminderText,
      nextInjectionShortDate: nextInjectionShortDate,
      lastInjectionShortDate: lastInjectionShortDate,
      reminderCountdownText: countdown.text,
      reminderCountdownHours: countdown.hours,
      reminderCountdownMinutes: countdown.minutes,
      version: config.getVersion(),
      env: config.getEnv(),
      drugName: drugName,
      brandName: brandName,
      penSize: penSize,
      remainDose: remain.remainDose,
      remainPercent: remain.remainPercent,
      totalUsedDose: totalUsedDose,
      needReplacePen: refillInfo.needReplace,
      refillRemainDose: refillInfo.remainDose,
      metric: metric,
      metricLabel: metricLabel,
      metricIcon: metricIcon,
      metricCardState: metricCardState,
      metricCardData: metricCardData,
      metricReminder: metricReminder,
      metricCardEnabled: metricCardEnabled
    })
  },

  onCompleteInjection: function () {
    wx.navigateTo({
      url: '/pages/inject/inject'
    })
  },

  onResetClick: function () {
    var that = this
    wx.showModal({
      title: '确认重置',
      content: '确定要重置注射计划吗？所有数据将恢复为默认值。',
      success: function (res) {
        if (res.confirm) {
          logic.resetPlan()
          that.loadData()
          wx.showToast({
            title: '已重置',
            icon: 'success'
          })
        }
      }
    })
  },

  onViewHistory: function () {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  onViewEffect: function () {
    wx.navigateTo({
      url: '/pages/effect/effect'
    })
  },

  onViewMetric: function () {
    wx.navigateTo({
      url: '/pages/metric/metric'
    })
  },

  onToggleMetricCard: function () {
    var newEnabled = !this.data.metricCardEnabled
    metricStorage.setEnabled(newEnabled)
    this.setData({
      metricCardEnabled: newEnabled,
      metricCardState: newEnabled ? metricLogic.getMetricCardState() : 'HIDDEN',
      metricCardData: newEnabled ? metricLogic.getMetricCardData() : null,
      metricReminder: newEnabled ? metricLogic.getMetricReminder() : null
    })
    wx.showToast({
      title: newEnabled ? '已显示指标卡片' : '已隐藏指标卡片',
      icon: 'none'
    })
  },

  onViewTrend: function () {
    wx.switchTab({
      url: '/pages/trend/trend'
    })
  },

  onReminder: function () {
    wx.navigateTo({
      url: '/pages/reminder/reminder'
    })
  },

  onViewAll: function () {
    wx.switchTab({
      url: '/pages/trend/trend'
    })
  },

  onGoPenList: function () {
    wx.navigateTo({
      url: '/pages/penList/penList'
    })
  },

  formatRecords: function (records) {
    for (var i = 0; i < records.length; i++) {
      records[i].shortDate = this.formatShortDate(records[i].date)
      if (records[i].time) {
        records[i].timeStr = records[i].time
      } else {
        records[i].timeStr = '00:00'
      }
    }
    return records
  },

  formatDate: function (dateStr) {
    var date = new Date(dateStr)
    var month = date.getMonth() + 1
    var day = date.getDate()
    return month + '月' + day + '日'
  },

  formatShortDate: function (dateStr) {
    if (!dateStr) {
      return ''
    }
    var date = new Date(dateStr)
    var month = date.getMonth() + 1
    var day = date.getDate()
    return month + '/' + day
  }
})
