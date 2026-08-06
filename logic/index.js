var storage = require('../storage/index.js')
var rotate = require('./rotate.js')
var titration = require('./titration.js')
var injection = require('./injection.js')

function initInjectionPlan() {
  var plan = storage.getInjectionPlan()
  return plan
}

function getCurrentPlan() {
  return storage.getInjectionPlan()
}

function completeInjection() {
  var plan = storage.getInjectionPlan()
  if (!plan) return null

  if (!injection.canInjectToday()) {
    console.log('今日已注射，不重复记录')
    return null
  }

  var today = new Date()
  var todayStr = formatDate(today)
  var hours = String(today.getHours()).padStart(2, '0')
  var minutes = String(today.getMinutes()).padStart(2, '0')
  var timeStr = hours + ':' + minutes

  var site = rotate.getNextSite()

  var planType = plan.planType || plan.type || 'weight'
  var recommendedDose = titration.getDose(plan.startDate, planType)

  var record = {
    id: 'record_' + Date.now(),
    date: todayStr,
    time: timeStr,
    dose: recommendedDose,
    site: site,
    note: ''
  }

  // 写入历史
  storage.addInjectionRecord(record)

  // 自动轮换部位，写回 currentSite
  var nextSite = rotate.recordInjection()

  // 下次注射日期 + 7天
  var nextDate = new Date(today)
  nextDate.setDate(today.getDate() + plan.injectionIntervalDays)
  storage.updateNextInjectionDate(formatDate(nextDate))

  // 更新当前剂量
  storage.updateCurrentDose(recommendedDose)

  return {
    record: record,
    nextDate: formatDate(nextDate),
    dose: recommendedDose,
    site: site,
    nextSite: nextSite
  }
}

function recordInjection(dose, note) {
  var plan = storage.getInjectionPlan()
  if (!plan) return

  var today = new Date()
  var hours = String(today.getHours()).padStart(2, '0')
  var minutes = String(today.getMinutes()).padStart(2, '0')
  var timeStr = hours + ':' + minutes
  var site = rotate.getNextSite()

  var record = {
    id: 'record_' + Date.now(),
    date: formatDate(today),
    time: timeStr,
    dose: dose,
    site: site,
    note: note
  }

  storage.addInjectionRecord(record)
  rotate.recordInjection()

  var nextDate = new Date(today)
  nextDate.setDate(today.getDate() + plan.injectionIntervalDays)
  storage.updateNextInjectionDate(formatDate(nextDate))

  storage.updateCurrentDose(dose)
}

function adjustDose(newDose) {
  storage.updateCurrentDose(newDose)
}

function getDaysUntilNextInjection() {
  var plan = storage.getInjectionPlan()
  if (!plan) return 0

  var today = new Date()
  today.setHours(0, 0, 0, 0)
  var nextDate = new Date(plan.nextInjectionDate)
  nextDate.setHours(0, 0, 0, 0)

  var diffTime = nextDate.getTime() - today.getTime()
  var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function getRecentRecords(count) {
  if (count === undefined) count = 5
  var plan = storage.getInjectionPlan()
  if (!plan) return []
  return plan.records.slice(0, count)
}

function getCurrentWeek(startDate) {
  return titration.getCurrentWeek(startDate)
}

function getRecommendedDose(startDate, type) {
  return titration.getDose(startDate, type)
}

function getNextSite() {
  return rotate.getNextSite()
}

function shiftNextInjectionDate(newDate) {
  storage.updateNextInjectionDate(newDate)
}

function resetPlan() {
  storage.clearInjectionPlan()
  initInjectionPlan()
}

function formatDate(date) {
  var year = date.getFullYear()
  var month = String(date.getMonth() + 1).padStart(2, '0')
  var day = String(date.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}

module.exports = {
  initInjectionPlan: initInjectionPlan,
  getCurrentPlan: getCurrentPlan,
  completeInjection: completeInjection,
  recordInjection: recordInjection,
  adjustDose: adjustDose,
  getDaysUntilNextInjection: getDaysUntilNextInjection,
  getRecentRecords: getRecentRecords,
  getCurrentWeek: getCurrentWeek,
  getRecommendedDose: getRecommendedDose,
  getNextSite: getNextSite,
  shiftNextInjectionDate: shiftNextInjectionDate,
  resetPlan: resetPlan
}