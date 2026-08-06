var echarts = require('../../components/ec-canvas/echarts.js')
var metricStorage = require('../../storage/metric.js')
var metricLogic = require('../../logic/metric.js')

var chartInstance = null
var pendingUpdate = false

Page({
  data: {
    metric: 'weight',
    metricLabel: '体重',
    weight: '',
    fasting: '',
    afterMeal: '',
    recordDate: '',
    records: [],
    latestRecord: null,
    ec: {
      lazyLoad: true
    }
  },

  onLoad: function () {
    var metric = metricLogic.getMetricType()
    var metricLabel = metricLogic.getMetricLabel(metric)
    var today = this.formatDate(new Date())

    this.setData({
      metric: metric,
      metricLabel: metricLabel,
      recordDate: today
    })
  },

  onReady: function () {
    this.initChart()
    this.loadRecords()
  },

  onShow: function () {
    var metric = metricLogic.getMetricType()
    var metricLabel = metricLogic.getMetricLabel(metric)
    if (metric !== this.data.metric) {
      this.setData({
        metric: metric,
        metricLabel: metricLabel
      })
      this.loadRecords()
    }
  },

  loadRecords: function () {
    var allRecords = metricStorage.getRecords()
    var records = allRecords.slice(0, 8).sort(function (a, b) {
      return a.date > b.date ? 1 : a.date < b.date ? -1 : 0
    })
    var latestRecord = allRecords.length > 0 ? allRecords[0] : null

    this.setData({
      records: records,
      latestRecord: latestRecord
    })

    if (chartInstance) {
      this.updateChart()
    } else {
      pendingUpdate = true
    }
  },

  initChart: function () {
    var that = this
    this.selectComponent('#trendChart').init(function (canvas, width, height, dpr) {
      var chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      })
      canvas.setChart(chart)
      chartInstance = chart

      if (pendingUpdate) {
        pendingUpdate = false
        that.updateChart()
      }

      return chart
    })
  },

  updateChart: function () {
    if (!chartInstance) return

    var records = this.data.records
    var metric = this.data.metric
    var metricLabel = this.data.metricLabel

    if (records.length === 0) {
      chartInstance.setOption({
        title: {
          text: '暂无记录',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#94A3B8',
            fontSize: 28,
            fontWeight: 400
          }
        },
        grid: {
          show: false
        },
        xAxis: {
          show: false
        },
        yAxis: {
          show: false
        },
        series: []
      })
      return
    }

    var dates = []
    var values1 = []
    var values2 = []

    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      dates.push(r.date.slice(5))
      if (metric === 'weight') {
        values1.push(r.weight)
      } else {
        values1.push(r.fasting)
        values2.push(r.afterMeal)
      }
    }

    var series = []
    var legendData = []

    if (metric === 'weight') {
      legendData.push('体重')
      series.push({
        name: '体重',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        data: values1,
        lineStyle: {
          color: '#2563EB',
          width: 3
        },
        itemStyle: {
          color: '#2563EB',
          borderWidth: 2,
          borderColor: '#FFFFFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(37, 99, 235, 0.25)' },
            { offset: 1, color: 'rgba(37, 99, 235, 0.03)' }
          ])
        }
      })
    } else {
      legendData.push('空腹')
      legendData.push('餐后')
      series.push({
        name: '空腹',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: values1,
        lineStyle: {
          color: '#2563EB',
          width: 3
        },
        itemStyle: {
          color: '#2563EB',
          borderWidth: 2,
          borderColor: '#FFFFFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(37, 99, 235, 0.25)' },
            { offset: 1, color: 'rgba(37, 99, 235, 0.03)' }
          ])
        }
      })
      series.push({
        name: '餐后',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: values2,
        lineStyle: {
          color: '#34D399',
          width: 3
        },
        itemStyle: {
          color: '#34D399',
          borderWidth: 2,
          borderColor: '#FFFFFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(52, 211, 153, 0.2)' },
            { offset: 1, color: 'rgba(52, 211, 153, 0.02)' }
          ])
        }
      })
    }

    var yAxisName = metric === 'weight' ? 'kg' : 'mmol/L'

    var option = {
      grid: {
        left: 0,
        right: 0,
        top: 20,
        bottom: 0,
        containLabel: true
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#EFF6FF',
        borderWidth: 1,
        textStyle: {
          color: '#64748B',
          fontSize: 22
        },
        formatter: function (params) {
          var result = '<div style="font-weight:500;margin-bottom:6rpx;">' + params[0].axisValue + '</div>'
          for (var i = 0; i < params.length; i++) {
            if (params[i].value !== undefined && params[i].value !== null && params[i].value !== '') {
              result += '<div style="display:flex;align-items:center;gap:10rpx;margin:3rpx 0;">' +
                '<span style="display:inline-block;width:14rpx;height:14rpx;border-radius:50%;background:' + params[i].color + ';"></span>' +
                '<span>' + params[i].seriesName + ': ' + params[i].value + ' ' + yAxisName + '</span>' +
                '</div>'
            }
          }
          return result
        }
      },
      legend: {
        data: legendData,
        bottom: 10,
        left: 'center',
        textStyle: {
          color: '#94A3B8',
          fontSize: 20
        },
        itemWidth: 18,
        itemHeight: 8
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: {
          lineStyle: {
            color: '#EFF6FF'
          }
        },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 12,
          margin: 8
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameTextStyle: {
          color: '#94A3B8',
          fontSize: 12,
          padding: [0, 0, 0, -25]
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 12,
          margin: 8
        },
        splitNumber: 3,
        splitLine: {
          lineStyle: {
            color: '#EFF6FF',
            type: 'dashed'
          }
        }
      },
      series: series
    }

    chartInstance.setOption(option)
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

  onDateChange: function (e) {
    this.setData({ recordDate: e.detail.value })
  },

  onSave: function () {
    var that = this
    var metric = this.data.metric
    var record = {
      date: this.data.recordDate
    }

    if (metric === 'weight') {
      var weight = parseFloat(this.data.weight)
      if (!weight || weight <= 0 || weight > 300) {
        wx.showToast({ title: '请输入有效体重', icon: 'none' })
        return
      }
      record.weight = weight
    } else {
      var fasting = parseFloat(this.data.fasting)
      var afterMeal = parseFloat(this.data.afterMeal)
      if (!fasting && !afterMeal) {
        wx.showToast({ title: '请至少输入一项血糖', icon: 'none' })
        return
      }
      if (fasting && (fasting <= 0 || fasting > 30)) {
        wx.showToast({ title: '空腹血糖值无效', icon: 'none' })
        return
      }
      if (afterMeal && (afterMeal <= 0 || afterMeal > 30)) {
        wx.showToast({ title: '餐后血糖值无效', icon: 'none' })
        return
      }
      if (fasting) record.fasting = fasting
      if (afterMeal) record.afterMeal = afterMeal
    }

    var existing = metricStorage.findRecordByDate(record.date)
    if (existing) {
      wx.showModal({
        title: '提示',
        content: record.date + ' 已有记录，是否覆盖？',
        confirmText: '覆盖',
        cancelText: '取消',
        confirmColor: '#2563EB',
        success: function (res) {
          if (res.confirm) {
            that.doSave(record, true)
          }
        }
      })
    } else {
      this.doSave(record, false)
    }
  },

  doSave: function (record, isUpdate) {
    var success = isUpdate
      ? metricStorage.updateRecord(record)
      : metricStorage.saveRecord(record)
    if (success) {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      this.setData({
        weight: '',
        fasting: '',
        afterMeal: ''
      })

      var that = this
      setTimeout(function () {
        that.loadRecords()
      }, 800)
    } else {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  onBack: function () {
    wx.navigateBack()
  },

  onViewAll: function () {
    wx.navigateTo({
      url: '/pages/records/records?metric=' + this.data.metric
    })
  },

  formatDate: function (date) {
    var year = date.getFullYear()
    var month = String(date.getMonth() + 1).padStart(2, '0')
    var day = String(date.getDate()).padStart(2, '0')
    return year + '-' + month + '-' + day
  }
})
