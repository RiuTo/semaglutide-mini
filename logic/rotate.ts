import { getInjectionPlan, setInjectionPlan } from '../storage/index'

const sites = ['腹左', '腹右', '腿左', '腿右', '臂左', '臂右']

export function getCurrentSite(): string {
  const plan = getInjectionPlan()
  if (!plan) return '腹左'
  if (plan.currentSite) return plan.currentSite
  if (plan.records && plan.records.length > 0) {
    return plan.records[0].site || '腹左'
  }
  return '腹左'
}

export function getNextSite(): string {
  const current = getCurrentSite()
  const index = sites.indexOf(current)
  if (index === -1) {
    return sites[0]
  }
  const nextIndex = (index + 1) % sites.length
  return sites[nextIndex]
}

export function nextSite(currentSite: string): string {
  const index = sites.indexOf(currentSite)
  if (index === -1) {
    return sites[0]
  }
  const nextIndex = (index + 1) % sites.length
  return sites[nextIndex]
}

export function recordInjection(): string {
  const plan = getInjectionPlan()
  if (!plan) return '腹左'

  const currentSite = getCurrentSite()
  let index = sites.indexOf(currentSite)
  if (index === -1) {
    index = 0
  }
  const nextIndex = (index + 1) % sites.length
  const next = sites[nextIndex]

  plan.currentSite = next
  setInjectionPlan(plan)
  console.log('部位已轮换:', currentSite, '→', next)

  return next
}
