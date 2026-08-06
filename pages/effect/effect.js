var effect = require('../../logic/effect.js')

Page({
  data: {
    effectCurve: [],
    effectDays: []
  },

  onLoad: function () {
    this.loadData()
  },

  onShow: function () {
    this.loadData()
  },

  loadData: function () {
    var plan = require('../../logic/index.js').getCurrentPlan()
    if (!plan || !plan.records || plan.records.length === 0) {
      this.setData({
        effectCurve: effect.getEffectCurve('2026-06-26'),
        effectDays: []
      })
      return
    }

    var lastRecord = plan.records[0]
    var curve = effect.getEffectCurve(lastRecord.date)
    var days = []

    for (var i = 0; i < curve.length; i++) {
      days.push({
        day: 'D' + (i + 1),
        value: curve[i] + '%'
      })
    }

    this.setData({
      effectCurve: curve,
      effectDays: days
    })
  },

  onBack: function () {
    wx.navigateBack()
  }
})