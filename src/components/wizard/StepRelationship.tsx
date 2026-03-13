import { useState } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { Tooltip } from '@/components/ui/Tooltip'
import { ImportDropZone } from '@/components/json/ImportDropZone'
import { ImportConfirmDialog } from '@/components/json/ImportConfirmDialog'
import { Toast } from '@/components/json/Toast'
import { useJsonImport } from '@/hooks/useJsonImport'

export function StepRelationship() {
  const relationship = useWizardStore((s) => s.relationship)
  const userGender = useWizardStore((s) => s.userGender)
  const motherAlive = useWizardStore((s) => s.motherAlive)
  const mfloEnabled = useWizardStore((s) => s.mfloEnabled)
  const deceasedGender = useWizardStore((s) => s.deceasedGender)
  const setUserGender = useWizardStore((s) => s.setUserGender)
  const setMotherAlive = useWizardStore((s) => s.setMotherAlive)
  const setDeceasedGender = useWizardStore((s) => s.setDeceasedGender)
  const setMfloEnabled = useWizardStore((s) => s.setMfloEnabled)

  const [advancedOpen, setAdvancedOpen] = useState(false)
  const { importFromFile, pendingState, confirmImport, cancelImport, toast, dismissToast } = useJsonImport()

  const needsGenderDisambiguation =
    relationship === 'father' || relationship === 'mother'

  const needsMotherAlivePrompt = relationship === 'father'

  const needsDeceasedGenderSelector = relationship === 'other'

  // Show follow-up options only when a relationship is selected
  const hasFollowUp =
    needsGenderDisambiguation ||
    needsDeceasedGenderSelector ||
    relationship !== null

  return (
    <div className="space-y-5">
      {/* Gender disambiguation for father/mother */}
      {needsGenderDisambiguation && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            I am the deceased's...
          </p>
          <div className="flex gap-3">
            <OptionButton
              label="Son"
              selected={userGender === 'male'}
              onClick={() => setUserGender('male')}
            />
            <OptionButton
              label="Daughter"
              selected={userGender === 'female'}
              onClick={() => setUserGender('female')}
            />
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
            <OptionButton
              label="Yes"
              selected={motherAlive === true}
              onClick={() => setMotherAlive(true)}
            />
            <OptionButton
              label="No"
              selected={motherAlive === false}
              onClick={() => setMotherAlive(false)}
            />
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
            <OptionButton
              label="Male"
              selected={deceasedGender === 'male'}
              onClick={() => setDeceasedGender('male')}
            />
            <OptionButton
              label="Female"
              selected={deceasedGender === 'female'}
              onClick={() => setDeceasedGender('female')}
            />
          </div>
        </div>
      )}

      {/* Divider + advanced section only when relationship is selected */}
      {hasFollowUp && (
        <>
          {/* Divider before advanced */}
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
        </>
      )}

      {/* Import from file */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-gray-500">or import from file</span>
        </div>
      </div>
      <ImportDropZone onFileSelected={importFromFile} />
      <ImportConfirmDialog isOpen={!!pendingState} onConfirm={confirmImport} onCancel={cancelImport} />
      <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
    </div>
  )
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? 'bg-emerald-600 text-white shadow-md'
          : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
      }`}
    >
      {label}
    </button>
  )
}
