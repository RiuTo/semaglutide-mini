const EFFECT_CURVE = [100, 92, 84, 76, 67, 57, 45]

export function getEffectCurve(injectDate: string): number[] {
  return EFFECT_CURVE.slice()
}

export function getTodayEffect(injectDate: string, today?: string | Date): number {
  let todayDate: Date
  if (!today) {
    todayDate = new Date()
  } else if (typeof today === 'string') {
    todayDate = new Date(today)
  } else {
    todayDate = today
  }

  const inject = new Date(injectDate)
  inject.setHours(0, 0, 0, 0)
  todayDate.setHours(0, 0, 0, 0)

  const diffTime = todayDate.getTime() - inject.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 0
  }

  if (diffDays >= EFFECT_CURVE.length) {
    return EFFECT_CURVE[EFFECT_CURVE.length - 1]
  }

  return EFFECT_CURVE[diffDays]
}
