var storage = require('../storage/index.js')

function formatDate(date) {
  var year = date.getFullYear()
  var month = String(date.getMonth() + 1).padStart(2, '0')
  var day = String(date.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}

function canInjectToday() {
  var plan = storage.getInjectionPlan()
  if (!plan || !plan.records || plan.records.length === 0) {
    return true
  }

  var today = formatDate(new Date())
  var latestDate = plan.records[0].date

  if (latestDate === today) {
    console.log('今日已注射，最新记录日期:', latestDate)
    return false
  }

  return true
}

module.exports = {
  canInjectToday: canInjectToday,
  formatDate: formatDate
}