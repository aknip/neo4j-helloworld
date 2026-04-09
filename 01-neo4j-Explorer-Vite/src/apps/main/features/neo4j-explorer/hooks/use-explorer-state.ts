import { create } from 'zustand'

type ExplorerMode = 'browse' | 'create' | 'detail'

interface ExplorerState {
  selectedLabel: string
  selectedEid: string | null
  mode: ExplorerMode
  activeTab: string
  setLabel: (label: string) => void
  setEid: (eid: string | null) => void
  setMode: (mode: ExplorerMode) => void
  setActiveTab: (tab: string) => void
  navigateToNode: (eid: string, label: string) => void
}

export const useExplorerState = create<ExplorerState>((set) => ({
  selectedLabel: '',
  selectedEid: null,
  mode: 'browse',
  activeTab: 'graph',
  setLabel: (label) => set({ selectedLabel: label }),
  setEid: (eid) => set({ selectedEid: eid }),
  setMode: (mode) => set({ mode }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  navigateToNode: (eid, label) =>
    set({
      selectedEid: eid,
      selectedLabel: label,
      mode: 'detail',
      activeTab: 'explorer',
    }),
}))
