var metricStorage = require('../../storage/metric.js')
var metricLogic = require('../../logic/metric.js')

Page({
  data: {
    metric: 'weight',
    metricLabel: '体重',
    date: '',
    weight: '',
    fasting: '',
    afterMeal: '',
    note: '',
    records: []
  },

  onLoad: function () {
    var today = new Date()
    var dateStr = this.formatDate(today)
    var metric = metricLogic.getMetricType()
    var metricLabel = metricLogic.getMetricLabel(metric)

    this.setData({
      metric: metric,
      metricLabel: metricLabel,
      date: dateStr
    })

    wx.setNavigationBarTitle({ title: metricLabel + '记录' })
    this.loadRecords()
  },

  onShow: function () {
    this.loadRecords()
  },

  loadRecords: function () {
    var records = metricStorage.getRecords()
    this.setData({ records: records })
  },

  onDateChange: function (e) {
    this.setData({ date: e.detail.value })
  },

  onWeightInput: function (e) {
    this.setData({ weight: e.detail.value })
  },

  onFastingInput: function (e) {
    this.setData({ fasting: e.detail.value })
  },

  onAfterMealInput: function (e) {
    this.setData({ afterMeal: e.detail.value })
  },

  onNoteInput: function (e) {
    this.setData({ note: e.detail.value })
  },

  onSave: function () {
    var data = this.data
    var record = {
      date: data.date,
      note: data.note || ''
    }

    if (data.metric === 'weight') {
      if (!data.weight) {
        wx.showToast({ title: '请输入体重', icon: 'none' })
        return
      }
      record.weight = parseFloat(data.weight)
    } else {
      if (!data.fasting && !data.afterMeal) {
        wx.showToast({ title: '请输入血糖值', icon: 'none' })
        return
      }
      record.fasting = data.fasting ? parseFloat(data.fasting) : 0
      record.afterMeal = data.afterMeal ? parseFloat(data.afterMeal) : 0
    }

    var success = metricStorage.saveRecord(record)
    if (success) {
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.setData({ weight: '', fasting: '', afterMeal: '', note: '' })
      this.loadRecords()
    } else {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  formatDate: function (date) {
    var year = date.getFullYear()
    var month = String(date.getMonth() + 1).padStart(2, '0')
    var day = String(date.getDate()).padStart(2, '0')
    return year + '-' + month + '-' + day
  },

  onBack: function () {
    wx.navigateBack()
  }
})
