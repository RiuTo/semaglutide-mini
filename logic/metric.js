/**
 * 指标类型模块
 * 统一入口：根据方案类型返回指标类型（weight / glucose）
 */
var injectStore = require('../storage/injectStore.js')
var metricStorage = require('../storage/metric.js')

/**
 * 获取当前指标类型
 * @returns {string} 'weight' 或 'glucose'
 */
function getMetricType() {
  var plan = injectStore.getPlan()
  if (!plan) return 'weight'
  var planType = plan.planType || plan.type || 'weight'
  return planType === 'weight' ? 'weight' : 'glucose'
}

/**
 * 获取指标显示名称
 * @param {string} metricType - 指标类型
 * @returns {string} '体重' 或 '血糖'
 */
function getMetricLabel(metricType) {
  return metricType === 'glucose' ? '血糖' : '体重'
}

/**
 * 获取指标图标
 * @param {string} metricType - 指标类型
 * @returns {string} emoji 图标
 */
function getMetricIcon(metricType) {
  return metricType === 'glucose' ? '🩸' : '⚖️'
}

/**
 * 获取指标卡片状态
 * 返回值：
 * - EMPTY：无记录
 * - ONE：减重 + 仅 1 条记录
 * - READY：减重 + ≥2 条记录，或降糖 + 有记录
 * - HIDDEN：用户关闭了指标展示
 * @returns {string} 'EMPTY' | 'ONE' | 'READY' | 'HIDDEN'
 */
function getMetricCardState() {
  // 用户关闭了展示
  if (!metricStorage.isEnabled()) {
    return 'HIDDEN'
  }

  var metric = getMetricType()
  var records = metricStorage.getRecords()
  var count = records.length

  if (metric === 'weight') {
    if (count === 0) return 'EMPTY'
    if (count === 1) return 'ONE'
    return 'READY'
  } else {
    // glucose
    if (count === 0) return 'EMPTY'
    return 'READY'
  }
}

/**
 * 获取指标卡片展示数据
 * @returns {object|null} 卡片数据；HIDDEN 时返回 null
 */
function getMetricCardData() {
  var state = getMetricCardState()
  if (state === 'HIDDEN') {
    return null
  }

  var metric = getMetricType()
  var metricLabel = getMetricLabel(metric)
  var records = metricStorage.getRecords()
  var count = records.length

  var data = {
    state: state,
    metric: metric,
    metricLabel: metricLabel,
    count: count,
    // 通用字段
    latestWeight: null,
    diffFromFirst: null,
    diffText: '',
    latestFasting: null,
    latestAfterMeal: null
  }

  if (state === 'EMPTY') {
    return data
  }

  if (metric === 'weight') {
    var latest = records[0]
    data.latestWeight = latest.weight

    if (state === 'READY') {
      // records 头部是最新，尾部是最旧
      var first = records[records.length - 1]
      var diff = latest.weight - first.weight
      data.diffFromFirst = diff
      // diff < 0 表示较首次下降
      var absDiff = Math.abs(diff).toFixed(1)
      if (diff < 0) {
        data.diffText = '较首次↓' + absDiff + 'kg'
      } else if (diff > 0) {
        data.diffText = '较首次↑' + absDiff + 'kg'
      } else {
        data.diffText = '较首次持平'
      }
    }
  } else {
    // glucose
    var latestG = records[0]
    data.latestFasting = latestG.fasting
    data.latestAfterMeal = latestG.afterMeal
  }

  return data
}

/**
 * 获取指标提醒（连续≥7天未记录）
 * @returns {object|null} { text } 或 null
 */
function getMetricReminder() {
  var state = getMetricCardState()
  if (state === 'HIDDEN' || state === 'EMPTY') {
    // 无记录场景由卡片自身提示，这里不重复
    return null
  }

  var days = metricStorage.getDaysSinceLastRecord()
  if (days >= 7) {
    var metric = getMetricType()
    var label = getMetricLabel(metric)
    return {
      text: '最近没有记录' + label,
      days: days
    }
  }
  return null
}

module.exports = {
  getMetricType: getMetricType,
  getMetricLabel: getMetricLabel,
  getMetricIcon: getMetricIcon,
  getMetricCardState: getMetricCardState,
  getMetricCardData: getMetricCardData,
  getMetricReminder: getMetricReminder
}
