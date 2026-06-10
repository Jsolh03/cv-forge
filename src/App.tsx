import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useOllamaStatus } from '@/hooks/useOllamaStatus'
import { Sidebar } from '@/components/layout/Sidebar'
import { SettingsModal } from '@/components/layout/SettingsModal'
import { StepNav } from '@/components/layout/StepNav'
import { viewDef } from '@/components/layout/views'
import { Toaster } from '@/components/ui/Toaster'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

import { JobView } from '@/components/job/JobView'
import { ProfileView } from '@/components/cv/ProfileView'
import { AnalyzeView } from '@/components/analysis/AnalyzeView'
import { BuildView } from '@/components/ai/BuildView'
import { CoverLetterView } from '@/components/cover/CoverLetterView'
import { ExportView } from '@/components/cv/ExportView'

export default function App() {
  const view = useAppStore((s) => s.view)
  const { status, recheck } = useOllamaStatus()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const def = viewDef(view)

  return (
    <div className="shell">
      <Sidebar ai={status} onOpenSettings={() => setSettingsOpen(true)} />

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar__crumb">Paso {def.step} de 5</div>
            <h1 className="topbar__title">{def.title}</h1>
          </div>
          <div className="row gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Icon name="cpu" size={15} />}
              onClick={() => setSettingsOpen(true)}
            >
              {status.ollamaAvailable ? 'IA: Ollama' : 'IA: Heurística'}
            </Button>
          </div>
        </header>

        <div className="content">
          <div className="content__inner">
            <div key={view} className="animate-in">
              {view === 'job' && <JobView ai={status} />}
              {view === 'profile' && <ProfileView ai={status} />}
              {view === 'analyze' && <AnalyzeView ai={status} />}
              {view === 'build' && <BuildView ai={status} />}
              {view === 'cover' && <CoverLetterView ai={status} />}
              {view === 'export' && <ExportView />}
            </div>
            {view !== 'export' && <StepNav />}
          </div>
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        ai={status}
        onRecheck={recheck}
      />
      <Toaster />
    </div>
  )
}
