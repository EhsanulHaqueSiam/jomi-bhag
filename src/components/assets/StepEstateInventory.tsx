import { StepProperties } from '@/components/property/StepProperties'
import { MovableAssetList } from './MovableAssetList'
import { useTranslation } from '@/i18n/useTranslation'

export function StepEstateInventory() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      {/* Section 1: Land & Properties */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('estate.landAndProperties')}
        </h3>
        <StepProperties />
      </section>

      <div className="border-t border-gray-200" />

      {/* Section 2: Movable Assets */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('estate.movableAssets')}
        </h3>
        <MovableAssetList />
      </section>
    </div>
  )
}
