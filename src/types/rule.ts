export type ImpactLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MEDIUM-HIGH' | 'LOW-MEDIUM'

export interface Rule {
  id: string
  title: string
  impact: ImpactLevel
  impactDescription?: string
  tags: string[]
  incorrectCode?: string
  incorrectDescription?: string
  correctCode?: string
  correctDescription?: string
  reference?: string
}

export interface Category {
  id: string
  impact: ImpactLevel
  rules: Rule[]
}

export interface CategoryMeta {
  id: string
  title: string
  impact: ImpactLevel
  description: string
  prefix: string
}
