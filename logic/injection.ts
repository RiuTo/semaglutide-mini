import { getInjectionPlan } from '../storage/index'

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function canInjectToday(): boolean {
  const plan = getInjectionPlan()
  if (!plan || !plan.records || plan.records.length === 0) {
    return true
  }

  const today = formatDate(new Date())
  const latestDate = plan.records[0].date

  if (latestDate === today) {
    console.log('今日已注射，最新记录日期:', latestDate)
    return false
  }

  return true
}

export { formatDate }
