Component({
  properties: {
    effectData: {
      type: Array,
      value: []
    },
    metricData: {
      type: Array,
      value: []
    },
    metric: {
      type: String,
      value: 'glucose'
    },
    metricLabel: {
      type: String,
      value: '血糖'
    }
  },

  data: {
    canvasWidth: 0,
    canvasHeight: 300
  },

  observers: {
    'effectData, metricData, metric': function () {
      if (this.data.canvasWidth > 0) {
        this.drawChart()
      }
    }
  },

  ready: function () {
    this.initCanvas()
  },

  methods: {
    initCanvas: function () {
      var that = this
      wx.getSystemInfo({
        success: function (res) {
          var width = res.windowWidth - 48
          that.setData({ canvasWidth: width })
          that.drawChart()
        }
      })
    },

    drawChart: function () {
      var effectData = this.data.effectData || []
      var metricData = this.data.metricData || []
      var metric = this.data.metric || 'glucose'
      var metricLabel = this.data.metricLabel || '指标'

      if (effectData.length === 0 && metricData.length === 0) {
        return
      }

      var width = this.data.canvasWidth
      var height = this.data.canvasHeight
      var padding = { top: 20, right: 60, bottom: 40, left: 50 }
      var chartWidth = width - padding.left - padding.right
      var chartHeight = height - padding.top - padding.bottom

      var context = wx.createCanvasContext('trendCanvas', this)
      context.clearRect(0, 0, width, height)

      var effectPoints = []
      var metricPoints = []

      var maxLen = Math.max(effectData.length, metricData.length)

      var leftMax = 100
      var leftMin = 0

      // 右轴范围根据 metric 类型动态计算
      var rightMax
      var rightMin
      if (metric === 'weight') {
        // 体重：根据数据动态计算
        rightMax = 100
        rightMin = 50
        for (var i = 0; i < metricData.length; i++) {
          var wv = metricData[i]
          if (wv !== null && wv !== undefined && wv !== '') {
            if (wv > rightMax) rightMax = Math.ceil(wv)
            if (wv < rightMin) rightMin = Math.floor(wv)
          }
        }
        if (rightMax - rightMin < 20) {
          var mid = (rightMax + rightMin) / 2
          rightMax = Math.ceil(mid + 10)
          rightMin = Math.floor(mid - 10)
          if (rightMin < 0) rightMin = 0
        }
      } else {
        // 血糖：默认 4-10，根据数据调整
        rightMax = 10
        rightMin = 4
        for (var j = 0; j < metricData.length; j++) {
          var gv = metricData[j]
          if (gv !== null && gv !== undefined && gv !== '') {
            if (gv > rightMax) rightMax = gv + 1
            if (gv < rightMin) rightMin = gv - 1
          }
        }
      }

      var leftRange = leftMax - leftMin
      var rightRange = rightMax - rightMin

      function getLeftX(index, total) {
        return padding.left + (index / (total - 1 || 1)) * chartWidth
      }

      function getLeftY(val) {
        return padding.top + (1 - (val - leftMin) / leftRange) * chartHeight
      }

      function getRightX(index, total) {
        return getLeftX(index, total)
      }

      function getRightY(val) {
        return padding.top + (1 - (val - rightMin) / rightRange) * chartHeight
      }

      // 绘制网格线
      context.setStrokeStyle('#EFF6FF')
      context.setLineWidth(1)
      for (var g = 0; g <= 4; g++) {
        var gy = padding.top + (g / 4) * chartHeight
        context.beginPath()
        context.moveTo(padding.left, gy)
        context.lineTo(width - padding.right, gy)
        context.stroke()
      }

      // X轴标签
      context.setFillStyle('#94A3B8')
      context.setFontSize(18)
      context.setTextAlign('center')
      for (var xIdx = 0; xIdx < maxLen; xIdx++) {
        var xpos = getLeftX(xIdx, maxLen)
        context.fillText('D' + (xIdx + 1), xpos, height - 10)
      }

      // 左Y轴标签（药效）
      context.setFillStyle('#2563EB')
      context.setTextAlign('right')
      context.setFontSize(16)
      for (var li = 0; li <= 4; li++) {
        var lv = leftMax - (li / 4) * leftRange
        var ly = padding.top + (li / 4) * chartHeight
        context.fillText(Math.round(lv) + '%', padding.left - 5, ly + 6)
      }

      // 右Y轴标签（体重/血糖）
      context.setFillStyle('#34D399')
      context.setTextAlign('left')
      context.setFontSize(16)
      for (var ri = 0; ri <= 4; ri++) {
        var rv = rightMax - (ri / 4) * rightRange
        var ry = padding.top + (ri / 4) * chartHeight
        context.fillText(rv.toFixed(1), width - padding.right + 5, ry + 6)
      }

      // 绘制指标折线（空值断线）
      if (metricData.length > 0) {
        context.setStrokeStyle('#34D399')
        context.setLineWidth(2)
        var metricSegStart = -1
        for (var mi = 0; mi < metricData.length; mi++) {
          var mv = metricData[mi]
          if (mv !== null && mv !== undefined && mv !== '') {
            var mx = getRightX(mi, maxLen)
            var my = getRightY(mv)
            if (metricSegStart === -1) {
              context.beginPath()
              context.moveTo(mx, my)
              metricSegStart = mi
            } else {
              context.lineTo(mx, my)
            }
          } else {
            if (metricSegStart !== -1) {
              context.stroke()
              context.beginPath()
              metricSegStart = -1
            }
          }
        }
        if (metricSegStart !== -1) {
          context.stroke()
        }
      }

      // 绘制药效折线（连续）
      if (effectData.length > 0) {
        context.setStrokeStyle('#2563EB')
        context.setLineWidth(3)
        context.beginPath()
        var firstEffect = true
        for (var ei = 0; ei < effectData.length; ei++) {
          var ev = effectData[ei]
          var ex = getLeftX(ei, maxLen)
          var ey = getLeftY(ev)
          if (firstEffect) {
            context.moveTo(ex, ey)
            firstEffect = false
          } else {
            context.lineTo(ex, ey)
          }
        }
        context.stroke()

        // 药效点标记
        context.setFillStyle('#2563EB')
        for (var ep = 0; ep < effectData.length; ep++) {
          var epx = getLeftX(ep, maxLen)
          var epy = getLeftY(effectData[ep])
          context.beginPath()
          context.arc(epx, epy, 3, 0, 2 * Math.PI)
          context.fill()
        }
      }

      // 绘制指标点标记
      if (metricData.length > 0) {
        context.setFillStyle('#34D399')
        for (var mp = 0; mp < metricData.length; mp++) {
          var mv2 = metricData[mp]
          if (mv2 !== null && mv2 !== undefined && mv2 !== '') {
            var mpx = getRightX(mp, maxLen)
            var mpy = getRightY(mv2)
            context.beginPath()
            context.arc(mpx, mpy, 3, 0, 2 * Math.PI)
            context.fill()
          }
        }
      }

      // 标题
      context.setFillStyle('#64748B')
      context.setFontSize(18)
      context.setTextAlign('center')
      context.fillText('药效/' + metricLabel + '趋势', width / 2, 14)

      context.draw()
    }
  }
})
