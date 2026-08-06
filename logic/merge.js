var effect = require('./effect.js')
var metricStorage = require('../storage/metric.js')
var metricLogic = require('./metric.js')
var logic = require('./index.js')

/**
 * 合并趋势数据
 * 减重方案：[{ date, effect, weight }]
 * 降糖方案：[{ date, effect, fasting, afterMeal? }]
 * @returns {array} 趋势数据数组
 */
function mergeTrend() {
  var recentRecords = logic.getRecentRecords(1)
  if (!recentRecords || recentRecords.length === 0) {
    return []
  }

  var latestRecord = recentRecords[0]
  var injectDate = latestRecord.date

  var effectCurve = effect.getEffectCurve(injectDate)
  var metricType = metricLogic.getMetricType()
  var metricRecords = metricStorage.getRecords()

  var metricMap = {}
  for (var i = 0; i < metricRecords.length; i++) {
    var m = metricRecords[i]
    metricMap[m.date] = m
  }

  var result = []
  var injectDateObj = new Date(injectDate)
  injectDateObj.setHours(0, 0, 0, 0)

  for (var d = 0; d < effectCurve.length; d++) {
    var dayDate = new Date(injectDateObj)
    dayDate.setDate(injectDateObj.getDate() + d)
    var dateStr = formatDate(dayDate)
    var metricRecord = metricMap[dateStr]

    var item = {
      date: dateStr,
      effect: effectCurve[d]
    }

    if (metricRecord) {
      if (metricType === 'weight') {
        if (metricRecord.weight !== undefined) {
          item.weight = metricRecord.weight
        }
      } else {
        if (metricRecord.fasting !== undefined) {
          item.fasting = metricRecord.fasting
        }
        if (metricRecord.afterMeal !== undefined && metricRecord.afterMeal > 0) {
          item.afterMeal = metricRecord.afterMeal
        }
      }
    }

    result.push(item)
  }

  return result
}

function formatDate(date) {
  var year = date.getFullYear()
  var month = String(date.getMonth() + 1).padStart(2, '0')
  var day = String(date.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}

module.exports = {
  mergeTrend: mergeTrend
}
