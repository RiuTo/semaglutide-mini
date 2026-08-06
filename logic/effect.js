var EFFECT_CURVE = [100, 92, 84, 76, 67, 57, 45]

function getEffectCurve(injectDate) {
  return EFFECT_CURVE.slice()
}

function getTodayEffect(injectDate, today) {
  if (!today) {
    today = new Date()
  } else {
    today = new Date(today)
  }

  var inject = new Date(injectDate)
  inject.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  var diffTime = today.getTime() - inject.getTime()
  var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 0
  }

  if (diffDays >= EFFECT_CURVE.length) {
    return EFFECT_CURVE[EFFECT_CURVE.length - 1]
  }

  return EFFECT_CURVE[diffDays]
}

module.exports = {
  getEffectCurve: getEffectCurve,
  getTodayEffect: getTodayEffect
}