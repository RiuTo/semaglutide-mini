var metricStorage = require('../../storage/metric.js')

Page({
  data: {
    metric: 'weight',
    metricLabel: '体重',
    records: [],
    groupedRecords: []
  },

  onLoad: function (options) {
    var metric = options.metric || 'weight'
    var metricLabel = metric === 'weight' ? '体重' : '血糖'
    this.setData({
      metric: metric,
      metricLabel: metricLabel
    })
    this.loadRecords()
  },

  onShow: function () {
    this.loadRecords()
  },

  loadRecords: function () {
    var allRecords = metricStorage.getRecords()
    var records = []
    for (var i = 0; i < allRecords.length; i++) {
      var r = allRecords[i]
      var item = {
        date: r.date,
        shortDate: this.formatShortDate(r.date)
      }
      if (this.data.metric === 'weight') {
        item.weight = r.weight
        item.unit = 'kg'
        item.value = r.weight
      } else {
        item.fasting = r.fasting
        item.afterMeal = r.afterMeal
        item.unit = 'mmol/L'
        item.fastingDisplay = r.fasting ? r.fasting : '-'
        item.afterMealDisplay = r.afterMeal ? r.afterMeal : '-'
      }
      records.push(item)
    }

    this.setData({
      records: records
    })
  },

  onBack: function () {
    wx.navigateBack()
  },

  formatShortDate: function (dateStr) {
    var date = new Date(dateStr)
    var month = date.getMonth() + 1
    var day = date.getDate()
    return month + '月' + day + '日'
  }
})
