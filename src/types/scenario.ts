import type { WizardState } from '@/types/wizard'
import type { IndividualColumn } from '@/core/distribution/individual-types'
import type { DistributionItem } from '@/core/distribution/types'

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
  individualDistribution?: {
    individuals: IndividualColumn[]
    items: DistributionItem[]
    customNames: Record<string, string>
    qurahUsed: boolean
  } | null
}

export type AppPage = 'wizard' | 'scenarios' | 'distribution'
