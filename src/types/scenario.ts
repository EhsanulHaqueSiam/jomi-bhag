import type { WizardState } from '@/types/wizard'

export interface ScenarioSummary {
  heirSummary: string
  totalEstateValue: number
  adjustment: 'none' | 'awl' | 'radd'
  heirCount: number
}

export interface Scenario {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  state: WizardState
  summary: ScenarioSummary
}

export type AppPage = 'wizard' | 'scenarios' | 'division' | 'distribution'
