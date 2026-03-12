import { useState } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { Tooltip } from '@/components/ui/Tooltip'
import type { RelationshipType } from '@/types/wizard'

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'husband', label: 'Husband' },
  { value: 'wife', label: 'Wife' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
  { value: 'other', label: 'Other' },
]

export function StepRelationship() {
  const relationship = useWizardStore((s) => s.relationship)
  const userGender = useWizardStore((s) => s.userGender)
  const motherAlive = useWizardStore((s) => s.motherAlive)
  const mfloEnabled = useWizardStore((s) => s.mfloEnabled)
  const deceasedGender = useWizardStore((s) => s.deceasedGender)
  const setRelationship = useWizardStore((s) => s.setRelationship)
  const setUserGender = useWizardStore((s) => s.setUserGender)
  const setMotherAlive = useWizardStore((s) => s.setMotherAlive)
  const setDeceasedGender = useWizardStore((s) => s.setDeceasedGender)
  const setMfloEnabled = useWizardStore((s) => s.setMfloEnabled)

  const [advancedOpen, setAdvancedOpen] = useState(false)

  const needsGenderDisambiguation =
    relationship === 'father' || relationship === 'mother'

  const needsMotherAlivePrompt = relationship === 'father'

  const needsDeceasedGenderSelector = relationship === 'other'

  return (
    <div className="space-y-6">
      {/* Section heading */}
      <h2 className="mb-4 text-lg font-semibold text-gray-800">
        I am calculating inheritance for my...
      </h2>

      {/* Relationship selector grid */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        {RELATIONSHIP_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRelationship(opt.value)}
            className={`rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
              relationship === opt.value
                ? 'bg-emerald-600 text-white shadow-md'
                : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Gender disambiguation for father/mother */}
      {needsGenderDisambiguation && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            I am the deceased's...
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setUserGender('male')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                userGender === 'male'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
              }`}
            >
              Son
            </button>
            <button
              type="button"
              onClick={() => setUserGender('female')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                userGender === 'female'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
              }`}
            >
              Daughter
            </button>
          </div>
        </div>
      )}

      {/* Mother-alive prompt (only for 'father' relationship) */}
      {needsMotherAlivePrompt && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Is the deceased's wife (your mother) alive?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMotherAlive(true)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                motherAlive === true
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setMotherAlive(false)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                motherAlive === false
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
              }`}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* "Other" flow: deceased gender selector */}
      {needsDeceasedGenderSelector && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            The deceased was...
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeceasedGender('male')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                deceasedGender === 'male'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setDeceasedGender('female')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                deceasedGender === 'female'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
              }`}
            >
              Female
            </button>
          </div>
        </div>
      )}

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Advanced section with MFLO toggle */}
      <div>
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <span
            className={`inline-block transition-transform ${advancedOpen ? 'rotate-90' : ''}`}
          >
            &#9654;
          </span>
          Advanced options
        </button>

        {advancedOpen && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              {/* Pill toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={mfloEnabled}
                onClick={() => setMfloEnabled(!mfloEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  mfloEnabled ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    mfloEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">
                Apply MFLO Section 4 (orphaned grandchildren)
              </span>
              <Tooltip content="The Muslim Family Laws Ordinance 1961 Section 4 allows orphaned grandchildren to inherit their parent's share. This diverges from traditional Hanafi jurisprudence." />
            </div>

            {/* Warning banner when MFLO is enabled */}
            {mfloEnabled && (
              <div className="flex gap-2 rounded-lg border border-gold-500 bg-gold-50 p-3 text-sm text-gold-600">
                <span className="mt-0.5 flex-shrink-0">&#9888;</span>
                <p>
                  MFLO Section 4 modifies traditional Hanafi inheritance rules.
                  Consult a qualified scholar for guidance.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
