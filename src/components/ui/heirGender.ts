import type { HeirType } from '@/core/faraid/types'

/** Heir types considered feminine for icon selection. */
export const feminineHeirs = new Set<HeirType>([
  'wife',
  'daughter',
  'daughter_of_son',
  'mother',
  'paternal_grandmother',
  'maternal_grandmother',
  'sister_full',
  'sister_consanguine',
  'sister_uterine',
])
