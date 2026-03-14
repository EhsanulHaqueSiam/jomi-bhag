import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { AppPage } from '@/types/scenario'
import { AppLayout } from '@/components/layout/AppLayout'
import { WizardShell } from '@/components/wizard/WizardShell'
import { ScenariosPage } from '@/components/scenarios/ScenariosPage'
import { DistributionPage } from '@/components/distribution/DistributionPage'

function App() {
  const [page, setPage] = useState<AppPage>('wizard')

  return (
    <AppLayout page={page} onNavigate={setPage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {page === 'wizard' && <WizardShell onNavigate={setPage} />}
          {page === 'scenarios' && <ScenariosPage onNavigate={setPage} />}
          {page === 'distribution' && <DistributionPage onNavigate={setPage} />}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  )
}

export default App
