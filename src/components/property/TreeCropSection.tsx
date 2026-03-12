import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useWizardStore } from '@/stores/wizardStore'
import type { TreeItem } from '@/core/land/types'
import { TREE_SPECIES } from '@/data/bd-land-data'
import { StepperButton } from '@/components/ui/StepperButton'
import { PropertyValueInput } from './PropertyValueInput'

interface TreeCropSectionProps {
  propertyId: string
}

export function TreeCropSection({ propertyId }: TreeCropSectionProps) {
  const property = useWizardStore((s) =>
    s.properties.find((p) => p.id === propertyId),
  )
  const updateProperty = useWizardStore((s) => s.updateProperty)
  const [isItemized, setIsItemized] = useState(false)

  if (!property) return null

  const trees = property.trees

  const handleTotalValueChange = (val: number) => {
    if (val === 0 && !isItemized) {
      updateProperty(propertyId, { trees: null })
      return
    }
    updateProperty(propertyId, {
      trees: {
        totalEstimatedValue: val,
        items: trees?.items ?? [],
        isItemized: false,
      },
    })
  }

  const toggleItemized = () => {
    const newItemized = !isItemized
    setIsItemized(newItemized)
    if (trees) {
      updateProperty(propertyId, {
        trees: { ...trees, isItemized: newItemized },
      })
    }
  }

  const addSpeciesRow = () => {
    if (!trees) return
    const newItem: TreeItem = {
      species: TREE_SPECIES[0].value,
      count: 1,
      estimatedValue: 0,
    }
    const newItems = [...trees.items, newItem]
    const newTotal = newItems.reduce((s, i) => s + i.estimatedValue, 0)
    updateProperty(propertyId, {
      trees: { ...trees, items: newItems, totalEstimatedValue: newTotal },
    })
  }

  const updateItem = (index: number, patch: Partial<TreeItem>) => {
    if (!trees) return
    const newItems = trees.items.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    )
    const newTotal = newItems.reduce((s, i) => s + i.estimatedValue, 0)
    updateProperty(propertyId, {
      trees: { ...trees, items: newItems, totalEstimatedValue: newTotal },
    })
  }

  const removeItem = (index: number) => {
    if (!trees) return
    const newItems = trees.items.filter((_, i) => i !== index)
    const newTotal = newItems.reduce((s, i) => s + i.estimatedValue, 0)
    updateProperty(propertyId, {
      trees: { ...trees, items: newItems, totalEstimatedValue: newTotal },
    })
  }

  return (
    <div className="space-y-2">
      <PropertyValueInput
        value={trees?.totalEstimatedValue ?? 0}
        onChange={handleTotalValueChange}
        label="Trees/Crops Value (BDT)"
        placeholder="Enter total tree/crop value"
      />

      {trees && trees.totalEstimatedValue > 0 && (
        <button
          type="button"
          onClick={toggleItemized}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          {isItemized ? 'Use total value' : 'Itemize by species'}
        </button>
      )}

      <AnimatePresence initial={false}>
        {isItemized && trees && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-3 rounded-lg bg-gray-50 p-3">
              {trees.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between">
                    <select
                      value={item.species}
                      onChange={(e) =>
                        updateItem(idx, { species: e.target.value })
                      }
                      className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-emerald-400 focus:outline-none"
                    >
                      {TREE_SPECIES.map((sp) => (
                        <option key={sp.value} value={sp.value}>
                          {sp.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="ml-2 text-sm text-red-400 hover:text-red-600"
                      aria-label="Remove species"
                    >
                      &times;
                    </button>
                  </div>
                  <StepperButton
                    label="Count"
                    value={item.count}
                    min={1}
                    max={999}
                    onChange={(n) => updateItem(idx, { count: n })}
                  />
                  <PropertyValueInput
                    value={item.estimatedValue}
                    onChange={(v) => updateItem(idx, { estimatedValue: v })}
                    label="Value (BDT)"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addSpeciesRow}
                className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 hover:border-emerald-400 hover:text-emerald-600"
              >
                + Add species
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
