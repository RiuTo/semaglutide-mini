var injectStore = require('../../storage/injectStore.js')
var drugCatalog = require('../../logic/drugCatalog.js')
var metricLogic = require('../../logic/metric.js')
var config = require('../../config/index.js')

Page({
  data: {
    drugName: '',
    brandName: '',
    specDisplayName: '',
    planTypeName: '',
    metric: 'weight',
    metricLabel: '体重',
    injectionCount: 0,
    metricCount: 0,
    version: '',
    env: ''
  },

  onLoad: function () {
    this.loadData()
  },

  onShow: function () {
    this.loadData()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  loadData: function () {
    var plan = injectStore.getPlan()
    var spec = drugCatalog.getDrugSpec(plan.specKey)
    var metric = metricLogic.getMetricType()
    var metricLabel = metricLogic.getMetricLabel(metric)
    var planTypeName = metric === 'weight' ? '减重方案' : '糖尿病方案'
    var injectionCount = (plan.records && plan.records.length) || 0

    var metricStorage = require('../../storage/metric.js')
    var metricCount = metricStorage.getRecords().length

    var specDisplayName = ''
    if (spec) {
      if (metric === 'glucose' || plan.drug === 'tirzepatide') {
        specDisplayName = spec.volume + ' mL:' + spec.totalDose + ' mg'
      } else {
        specDisplayName = spec.concentration + 'mg/ml，' + spec.volume + 'ml' + (spec.form || '')
      }
    }

    this.setData({
      drugName: spec ? spec.drugName : '',
      brandName: spec ? spec.brandName : '',
      specDisplayName: specDisplayName,
      planTypeName: planTypeName,
      metric: metric,
      metricLabel: metricLabel,
      injectionCount: injectionCount,
      metricCount: metricCount,
      version: config.getVersion(),
      env: config.getEnv()
    })
  },

  onPlanSettings: function () {
    wx.navigateTo({
      url: '/pages/planSettings/planSettings'
    })
  },

  onReminder: function () {
    wx.navigateTo({
      url: '/pages/reminder/reminder'
    })
  },

  onPenList: function () {
    wx.navigateTo({
      url: '/pages/penList/penList'
    })
  },

  onExport: function () {
    wx.navigateTo({
      url: '/pages/export/export'
    })
  },

  onRepair: function () {
    wx.navigateTo({
      url: '/pages/repair/repair'
    })
  },

  onAbout: function () {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  onInject: function () {
    wx.navigateTo({
      url: '/pages/inject/inject'
    })
  }
})
