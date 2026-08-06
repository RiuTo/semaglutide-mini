var storage = require('../storage/index.js')

var sites = ['腹左', '腹右', '腿左', '腿右', '臂左', '臂右']

function getCurrentSite() {
  var plan = storage.getInjectionPlan()
  if (!plan) return '腹左'
  if (plan.currentSite) return plan.currentSite
  if (plan.records && plan.records.length > 0) {
    return plan.records[0].site || '腹左'
  }
  return '腹左'
}

function getNextSite() {
  var current = getCurrentSite()
  var index = sites.indexOf(current)
  if (index === -1) {
    return sites[0]
  }
  var nextIndex = (index + 1) % sites.length
  return sites[nextIndex]
}

function nextSite(currentSite) {
  var index = sites.indexOf(currentSite)
  if (index === -1) {
    return sites[0]
  }
  var nextIndex = (index + 1) % sites.length
  return sites[nextIndex]
}

/**
 * 获取建议注射部位
 * 规则：
 * - records为空 → 返回腹左
 * - 否则 → 读取最后记录site，返回下一部位
 */
function getSuggestedSite() {
  var plan = storage.getInjectionPlan()
  if (!plan || !plan.records || plan.records.length === 0) {
    return '腹左'
  }
  // records 倒序排列，最新的在 [0]
  var lastSite = plan.records[0].site
  if (!lastSite) {
    return '腹左'
  }
  return nextSite(lastSite)
}

function recordInjection() {
  var plan = storage.getInjectionPlan()
  if (!plan) return '腹左'

  var currentSite = getCurrentSite()
  var index = sites.indexOf(currentSite)
  if (index === -1) {
    index = 0
  }
  var nextIndex = (index + 1) % sites.length
  var next = sites[nextIndex]

  plan.currentSite = next
  storage.setInjectionPlan(plan)
  console.log('部位已轮换:', currentSite, '→', next)

  return next
}

module.exports = {
  nextSite: nextSite,
  getNextSite: getNextSite,
  recordInjection: recordInjection,
  getSuggestedSite: getSuggestedSite
}