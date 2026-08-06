function getCurrentWeek(startDate) {
  var start = new Date(startDate)
  var today = new Date()
  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  var diffTime = today.getTime() - start.getTime()
  var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  var week = Math.floor(diffDays / 7) + 1

  return week > 0 ? week : 1
}

function getDose(startDate, planType) {
  var week = getCurrentWeek(startDate)

  if (planType === 'weight') {
    if (week >= 1 && week <= 4) return 0.25
    if (week >= 5 && week <= 8) return 0.5
    if (week >= 9 && week <= 12) return 1.0
    if (week >= 13 && week <= 16) return 1.7
    return 2.4
  }

  if (planType === 'diabetes') {
    if (week >= 1 && week <= 4) return 0.25
    if (week >= 5 && week <= 8) return 0.5
    return 1.0
  }

  return 0.25
}

module.exports = {
  getCurrentWeek: getCurrentWeek,
  getDose: getDose
}