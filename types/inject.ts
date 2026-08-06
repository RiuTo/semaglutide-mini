export type PlanType =
  | 'weight'
  | 'diabetes'

export interface InjectionRecord {
  date:string
  site:string
  dose:number
}

export interface TreatmentPlan {

  type:PlanType

  startDate:string

  nextInject:string

  currentDose:number

  history:InjectionRecord[]
}