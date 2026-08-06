/**
 * 指标记录统一存储
 * 结构：{ type: 'weight'|'glucose', enabled: true|false, records: [...] }
 * - weight 记录：{ date, weight, note? }
 * - glucose 记录：{ date, fasting, afterMeal, note? }
 */
var STORAGE_KEY = 'metric'
var injectStore = require('./injectStore.js')

/**
 * 从注射计划推断当前指标类型
 * @returns {string} 'weight' 或 'glucose'
 */
function resolveType() {
  var plan = injectStore.getPlan()
  if (!plan) return 'weight'
  var planType = plan.planType || plan.type || 'weight'
  return planType === 'weight' ? 'weight' : 'glucose'
}

/**
 * 获取指标数据 { type, enabled, records }
 * type 会自动与当前 plan 同步；enabled 默认 true
 */
function getMetric() {
  var type = resolveType()
  try {
    var data = wx.getStorageSync(STORAGE_KEY)
    if (!data || typeof data !== 'object' || !Array.isArray(data.records)) {
      return { type: type, enabled: true, records: [] }
    }
    // 同步 type 与当前 plan
    data.type = type
    // 默认开启
    if (data.enabled === undefined) {
      data.enabled = true
    }
    return data
  } catch (e) {
    console.error('读取指标记录失败', e)
    return { type: type, enabled: true, records: [] }
  }
}

/**
 * 获取记录列表
 */
function getRecords() {
  return getMetric().records
}

/**
 * 指标卡片是否展示
 */
function isEnabled() {
  return getMetric().enabled !== false
}

/**
 * 设置指标卡片展示开关
 */
function setEnabled(enabled) {
  try {
    var metric = getMetric()
    metric.enabled = !!enabled
    wx.setStorageSync(STORAGE_KEY, metric)
    return true
  } catch (e) {
    console.error('保存指标开关失败', e)
    return false
  }
}

/**
 * 按日期查找记录
 * @param {string} date YYYY-MM-DD
 * @returns {object|null}
 */
function findRecordByDate(date) {
  var records = getRecords()
  for (var i = 0; i < records.length; i++) {
    if (records[i].date === date) {
      return records[i]
    }
  }
  return null
}

/**
 * 覆盖指定日期的记录
 * @param {object} record 必须包含 date
 * @returns {boolean}
 */
function updateRecord(record) {
  try {
    var metric = getMetric()
    for (var i = 0; i < metric.records.length; i++) {
      if (metric.records[i].date === record.date) {
        metric.records[i] = record
        wx.setStorageSync(STORAGE_KEY, metric)
        console.log('指标记录已更新:', record)
        return true
      }
    }
    return false
  } catch (e) {
    console.error('更新指标记录失败', e)
    return false
  }
}

/**
 * 保存一条记录（插入到头部）
 */
function saveRecord(record) {
  try {
    var metric = getMetric()
    metric.records.unshift(record)
    wx.setStorageSync(STORAGE_KEY, metric)
    console.log('指标记录已保存:', record)
    return true
  } catch (e) {
    console.error('保存指标记录失败', e)
    return false
  }
}

/**
 * 清空指标数据
 */
function clearMetric() {
  try {
    wx.removeStorageSync(STORAGE_KEY)
  } catch (e) {
    console.error('清除指标记录失败', e)
  }
}

/**
 * 最近一次记录距今天数
 * @returns {number} 天数；无记录返回 -1
 */
function getDaysSinceLastRecord() {
  var records = getRecords()
  if (!records || records.length === 0) {
    return -1
  }
  var latest = records[0]
  if (!latest || !latest.date) {
    return -1
  }
  var latestDate = new Date(latest.date)
  latestDate.setHours(0, 0, 0, 0)
  var today = new Date()
  today.setHours(0, 0, 0, 0)
  var diff = today.getTime() - latestDate.getTime()
  return Math.floor(diff / (24 * 60 * 60 * 1000))
}

module.exports = {
  getMetric: getMetric,
  getRecords: getRecords,
  isEnabled: isEnabled,
  setEnabled: setEnabled,
  saveRecord: saveRecord,
  updateRecord: updateRecord,
  findRecordByDate: findRecordByDate,
  clearMetric: clearMetric,
  getDaysSinceLastRecord: getDaysSinceLastRecord
}
