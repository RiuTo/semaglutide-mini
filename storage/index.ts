export interface InjectionRecord {
  id: string
  date: string
  dose: number
  site: string
  note?: string
}

export interface InjectionPlan {
  currentDose: number
  nextInjectionDate: string
  injectionIntervalDays: number
  startDate: string
  type: 'weight' | 'diabetes'
  records: InjectionRecord[]
}

const STORAGE_KEY = 'injection_plan'

export function getInjectionPlan(): InjectionPlan | null {
  try {
    const data = wx.getStorageSync(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('获取注射计划失败', e)
    return null
  }
}

export function setInjectionPlan(plan: InjectionPlan): void {
  try {
    wx.setStorageSync(STORAGE_KEY, JSON.stringify(plan))
  } catch (e) {
    console.error('保存注射计划失败', e)
  }
}

export function addInjectionRecord(record: InjectionRecord): void {
  const plan = getInjectionPlan()
  if (plan) {
    plan.records.unshift(record)
    setInjectionPlan(plan)
  }
}

export function updateCurrentDose(dose: number): void {
  const plan = getInjectionPlan()
  if (plan) {
    plan.currentDose = dose
    setInjectionPlan(plan)
  }
}

export function updateNextInjectionDate(date: string): void {
  const plan = getInjectionPlan()
  if (plan) {
    plan.nextInjectionDate = date
    setInjectionPlan(plan)
  }
}

export function clearInjectionPlan(): void {
  try {
    wx.removeStorageSync(STORAGE_KEY)
  } catch (e) {
    console.error('清除注射计划失败', e)
  }
}
