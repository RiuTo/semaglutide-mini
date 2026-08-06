export type PlanType = 'weight' | 'diabetes'

export function getCurrentWeek(startDate: string): number {
  const start = new Date(startDate)
  const today = new Date()
  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const week = Math.floor(diffDays / 7) + 1

  return week > 0 ? week : 1
}

export function getDose(startDate: string, planType: PlanType): number {
  const week = getCurrentWeek(startDate)

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