export interface InjectionPlan {
  planType?: 'weight' | 'diabetes'
  startDate?: string
  currentDose?: number
  nextInjectionDate?: string
  injectionIntervalDays?: number
  currentSite?: string
  records?: InjectionRecord[]
  initialized?: boolean
}

export interface InjectionRecord {
  id: string
  date: string
  dose: number
  site: string
  note?: string
}

const STORAGE_KEY = 'injection_plan'
const INIT_KEY = 'injection_initialized'

export function migrateData(data: any): InjectionPlan | null {
  if (!data) return null

  let migrated = false

  if (!data.planType) {
    data.planType = data.type || 'weight'
    migrated = true
  }

  if (!data.startDate && data.records && data.records.length > 0) {
    const dates = data.records.map((r: any) => r.date).sort()
    data.startDate = dates[0]
    migrated = true
  } else if (!data.startDate) {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    data.startDate = `${year}-${month}-${day}`
    migrated = true
  }

  if (!data.currentSite) {
    if (data.records && data.records.length > 0) {
      data.currentSite = data.records[0].site || '腹左'
    } else {
      data.currentSite = '腹左'
    }
    migrated = true
  }

  if (data.type) {
    delete data.type
    migrated = true
  }

  if (migrated) {
    savePlan(data)
    console.log('数据迁移完成')
  }

  return data as InjectionPlan
}

/**
 * 检测是否首次启动
 */
export function isFirstLaunch(): boolean {
  try {
    const initialized = wx.getStorageSync(INIT_KEY)
    return !initialized
  } catch (e) {
    console.error('检测首次启动失败', e)
    return true
  }
}

/**
 * 标记已初始化
 */
export function setInitialized(): void {
  try {
    wx.setStorageSync(INIT_KEY, true)
  } catch (e) {
    console.error('标记初始化失败', e)
  }
}

export function getPlan(): InjectionPlan {
  try {
    const data = wx.getStorageSync(STORAGE_KEY)
    if (data) {
      const migrated = migrateData(data)
      if (migrated) return migrated
    }
  } catch (e) {
    console.error('读取注射计划失败', e)
  }

  // 首次启动，返回空状态
  return {
    initialized: false,
    records: []
  }
}

export function savePlan(plan: InjectionPlan): void {
  try {
    wx.setStorageSync(STORAGE_KEY, plan)
  } catch (e) {
    console.error('保存注射计划失败', e)
  }
}

/**
 * 初始化注射计划（用于 onboarding 完成后）
 */
export function initPlan(planType: string, startDate: string): InjectionPlan {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`

  const nextDate = new Date(today)
  nextDate.setDate(today.getDate() + 7)
  const nextDateStr = formatDate(nextDate)

  const newPlan: InjectionPlan = {
    planType: (planType || 'weight') as 'weight' | 'diabetes',
    startDate: startDate || todayStr,
    currentDose: 0.25,
    nextInjectionDate: nextDateStr,
    injectionIntervalDays: 7,
    currentSite: '腹左',
    records: []
  }

  savePlan(newPlan)
  setInitialized()

  console.log('注射计划初始化完成:', newPlan)
  return newPlan
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}