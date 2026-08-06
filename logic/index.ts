import {
  getInjectionPlan,
  setInjectionPlan,
  addInjectionRecord,
  updateCurrentDose,
  updateNextInjectionDate,
  clearInjectionPlan,
  type InjectionPlan,
  type InjectionRecord
} from '../storage/index'
import { getNextSite, recordInjection as rotateRecordInjection } from './rotate'
import { getDose, getCurrentWeek } from './titration'
import { canInjectToday } from './injection'

export function initInjectionPlan(): InjectionPlan {
  const plan = getInjectionPlan()
  return plan
}

export function getCurrentPlan(): InjectionPlan | null {
  return getInjectionPlan()
}

export function completeInjection(): {
  record: InjectionRecord
  nextDate: string
  dose: number
  site: string
  nextSite: string
} | null {
  const plan = getInjectionPlan()
  if (!plan) return null

  if (!canInjectToday()) {
    console.log('今日已注射，不重复记录')
    return null
  }

  const today = new Date()
  const todayStr = formatDate(today)

  const site = getNextSite()

  const recommendedDose = getDose(plan.startDate, plan.planType || plan.type)

  const record: InjectionRecord = {
    id: `record_${Date.now()}`,
    date: todayStr,
    dose: recommendedDose,
    site: site,
    note: ''
  }

  addInjectionRecord(record)

  const nextSite = rotateRecordInjection()

  const nextDate = new Date(today)
  nextDate.setDate(today.getDate() + plan.injectionIntervalDays)
  updateNextInjectionDate(formatDate(nextDate))

  updateCurrentDose(recommendedDose)

  return {
    record,
    nextDate: formatDate(nextDate),
    dose: recommendedDose,
    site,
    nextSite
  }
}

export function recordInjection(dose: number, note?: string): void {
  const plan = getInjectionPlan()
  if (!plan) return

  const today = new Date()
  const site = getNextSite()

  const record: InjectionRecord = {
    id: `record_${Date.now()}`,
    date: formatDate(today),
    dose,
    site,
    note
  }

  addInjectionRecord(record)
  rotateRecordInjection()

  const nextDate = new Date(today)
  nextDate.setDate(today.getDate() + plan.injectionIntervalDays)
  updateNextInjectionDate(formatDate(nextDate))

  updateCurrentDose(dose)
}

export function adjustDose(newDose: number): void {
  updateCurrentDose(newDose)
}

export function getDaysUntilNextInjection(): number {
  const plan = getInjectionPlan()
  if (!plan) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextDate = new Date(plan.nextInjectionDate)
  nextDate.setHours(0, 0, 0, 0)

  const diffTime = nextDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getRecentRecords(count: number = 5): InjectionRecord[] {
  const plan = getInjectionPlan()
  if (!plan) return []
  return plan.records.slice(0, count)
}

export function getCurrentWeekValue(startDate: string): number {
  return getCurrentWeek(startDate)
}

export function getRecommendedDoseValue(startDate: string, type: 'weight' | 'diabetes'): number {
  return getDose(startDate, type)
}

export function getNextSiteValue(): string {
  return getNextSite()
}

export function shiftNextInjectionDate(newDate: string): void {
  updateNextInjectionDate(newDate)
}

export function resetPlan(): void {
  clearInjectionPlan()
  initInjectionPlan()
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
