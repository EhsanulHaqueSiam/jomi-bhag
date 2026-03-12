/**
 * Faraid Calculation Engine
 *
 * Main orchestrator that runs the complete Islamic inheritance calculation pipeline.
 * This is the single entry point for the entire engine:
 *   calculateInheritance(input) -> FaraidOutput
 *
 * Pipeline:
 * 1. Validate input
 * 2. Build heir context
 * 3. Detect special cases
 * 4. Apply MFLO (if enabled)
 * 5. Apply Hajb blocking
 * 6. Assign fixed shares
 * 7. Apply Umariyyatayn/Mushtarakah special cases
 * 8. Assign residuary (Asaba)
 * 9. Apply adjustment (Awl or Radd)
 * 10. Attach references
 * 11. Build final output
 */

import type {
  FaraidInput,
  FaraidOutput,
  ShareResult,
  CalculationStep,
  AdjustmentType,
} from '@/core/faraid/types'
import { validateHeirInput } from '@/core/faraid/validation'
import { buildHeirContext, assignFixedShares } from '@/core/faraid/shares'
import { applyHajb } from '@/core/faraid/blocking'
import {
  detectSpecialCases,
  applyUmariyyatayn,
  applyMushtarakah,
} from '@/core/faraid/special-cases'
import { assignResiduary } from '@/core/faraid/residuary'
import { applyAdjustment } from '@/core/faraid/adjustments'
import { applyMFLO } from '@/core/faraid/mflo'
import { getAllReferences } from '@/core/faraid/references'
import { ONE, ZERO, sumFractions, formatShare } from '@/core/utils/fraction'

/**
 * Calculate Islamic inheritance shares for the given input.
 *
 * This is the main entry point for the Faraid engine.
 * Returns complete output with shares, steps, references, and adjustment info.
 */
export function calculateInheritance(input: FaraidInput): FaraidOutput {
  const steps: CalculationStep[] = []
  let stepNumber = 1

  // ── Step 1: Validate Input ──────────────────────────────

  const validation = validateHeirInput(input)
  if (!validation.valid) {
    throw new Error(
      `Invalid Faraid input: ${validation.errors.join('; ')}`,
    )
  }

  // ── Step 2: Build Heir Context ──────────────────────────

  const ctx = buildHeirContext(input)

  steps.push({
    step: stepNumber++,
    description: 'Identified heirs',
    detail:
      `Input heirs: ${input.heirs.map((h) => `${h.type} (${h.count})`).join(', ')}. ` +
      `Deceased gender: ${input.deceasedGender}. ` +
      (ctx.isKalalah ? 'Kalalah condition detected (no children, no father, no grandfather).' : ''),
  })

  // ── Step 3: Detect Special Cases ────────────────────────

  const specialCases = detectSpecialCases(ctx)
  if (specialCases.length > 0) {
    steps.push({
      step: stepNumber++,
      description: 'Special cases detected',
      detail: `Detected: ${specialCases.join(', ')}`,
    })
  }

  // ── Step 4: Apply MFLO (if enabled) ─────────────────────

  let mfloApplied = false
  const mfloResult = applyMFLO(input, ctx)
  if (mfloResult) {
    mfloApplied = true
    mfloResult.explanation.step = stepNumber++
    steps.push(mfloResult.explanation)
  }

  // ── Step 5: Apply Hajb Blocking ─────────────────────────

  const hajbResult = applyHajb(input.heirs, ctx)
  const { activeHeirs, blocked, reductions } = hajbResult

  if (blocked.length > 0) {
    steps.push({
      step: stepNumber++,
      description: 'Applied blocking rules (Hajb)',
      detail:
        `Blocked heirs: ${blocked.map((b) => `${b.heirType} (blocked by ${b.blockedBy}: ${b.rule})`).join('; ')}. ` +
        `Active heirs: ${activeHeirs.map((h) => `${h.type} (${h.count})`).join(', ')}.`,
    })
  } else {
    steps.push({
      step: stepNumber++,
      description: 'Applied blocking rules (Hajb)',
      detail: 'No heirs were blocked. All heirs remain active.',
    })
  }

  // ── Step 6: Assign Fixed Shares ─────────────────────────

  let shares = assignFixedShares(activeHeirs, ctx, reductions)

  const fardSharesDetail = shares
    .filter((s) => !s.totalShare.equals(ZERO))
    .map((s) => `${s.heirType}: ${s.totalShare.toFraction()} (${s.explanation})`)
    .join('; ')

  const asabaHeirsDetail = shares
    .filter((s) => s.totalShare.equals(ZERO) && (s.shareType === 'asaba' || s.shareType === 'fard_and_asaba'))
    .map((s) => s.heirType)
    .join(', ')

  steps.push({
    step: stepNumber++,
    description: 'Assigned fixed shares (Fard)',
    detail:
      `Fixed shares: ${fardSharesDetail || 'None (all heirs are Asaba)'}. ` +
      (asabaHeirsDetail ? `Asaba heirs pending residuary: ${asabaHeirsDetail}.` : ''),
  })

  // ── Step 7: Apply Special Case Adjustments ──────────────

  if (specialCases.includes('umariyyatayn')) {
    shares = applyUmariyyatayn(shares, ctx)
    steps.push({
      step: stepNumber++,
      description: 'Applied Umariyyatayn special case',
      detail:
        "Per Omar's (RA) ruling: mother receives 1/3 of the remainder after spouse's share, " +
        'not 1/3 of the entire estate. Father takes the remaining portion.',
    })
  }

  if (specialCases.includes('mushtarakah')) {
    shares = applyMushtarakah(shares, ctx)
    steps.push({
      step: stepNumber++,
      description: 'Applied Mushtarakah special case',
      detail:
        'Hanafi ruling: full siblings receive nothing (Asaba with no remainder). ' +
        "Note: Shafi'i and Maliki schools would have full siblings share in the uterine siblings' 1/3.",
    })
  }

  // ── Step 8: Assign Residuary (Asaba) ────────────────────

  const totalBeforeResiduary = sumFractions(shares.map((s) => s.totalShare))
  shares = assignResiduary(activeHeirs, shares, ctx)

  const asabaAssigned = shares.filter(
    (s) =>
      s.shareType === 'asaba' &&
      !s.totalShare.equals(ZERO),
  )
  const fardAndAsaba = shares.filter(
    (s) => s.shareType === 'fard_and_asaba',
  )

  if (asabaAssigned.length > 0 || fardAndAsaba.length > 0) {
    const remainder = ONE.sub(totalBeforeResiduary)
    const residuaryDetail = [...asabaAssigned, ...fardAndAsaba]
      .map((s) => `${s.heirType}: ${s.totalShare.toFraction()}`)
      .join('; ')
    steps.push({
      step: stepNumber++,
      description: 'Distributed residuary (Asaba)',
      detail:
        `Remainder after fixed shares: ${remainder.toFraction()}. ` +
        `Residuary distribution: ${residuaryDetail}.`,
    })
  }

  // ── Step 9: Apply Adjustment (Awl or Radd) ──────────────

  const totalBeforeAdjustment = sumFractions(shares.map((s) => s.totalShare))
  const adjustmentResult = applyAdjustment(shares)
  shares = adjustmentResult.adjusted
  const adjustmentType: AdjustmentType = adjustmentResult.adjustmentType

  if (adjustmentResult.explanation) {
    adjustmentResult.explanation.step = stepNumber++
    steps.push(adjustmentResult.explanation)
  }

  // ── Step 10: Final Summary ──────────────────────────────

  steps.push({
    step: stepNumber++,
    description: 'Final shares',
    detail:
      `Final distribution: ${shares.map((s) => `${s.heirType}: ${formatShare(s.totalShare)} (${s.count > 1 ? `${s.count} heirs, ${formatShare(s.sharePerHeir)} each` : 'sole'})`).join('; ')}. ` +
      `Adjustment: ${adjustmentType}. Total: ${formatShare(sumFractions(shares.map((s) => s.totalShare)))}.`,
  })

  // ── Step 11: Build Output ───────────────────────────────

  // Convert ShareAssignment[] to ShareResult[]
  const shareResults: ShareResult[] = shares.map((s) => ({
    heirType: s.heirType,
    count: s.count,
    sharePerHeir: s.sharePerHeir,
    totalShare: s.totalShare,
    shareType: s.shareType === 'fard_and_asaba' ? 'fard' : s.shareType,
    quranRef: s.quranRef,
    hadithRef: s.hadithRef,
    explanation: s.explanation,
    notes: s.notes,
  }))

  // Build a partial output for reference collection
  const partialOutput: FaraidOutput = {
    shares: shareResults,
    adjustment: adjustmentType,
    totalBeforeAdjustment,
    blockedHeirs: blocked,
    specialCases,
    mfloApplied,
    steps,
    references: [],
  }

  // Collect all references
  const references = getAllReferences(partialOutput)

  return {
    ...partialOutput,
    references,
  }
}
