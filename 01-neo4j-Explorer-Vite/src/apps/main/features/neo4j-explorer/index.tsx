import { useEffect, useRef } from 'react'
import { Header } from '@/apps/main/components/layout/header'
import { Main } from '@/apps/main/components/layout/main'
import { ProfileDropdown } from '@/apps/main/components/profile-dropdown'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AppSwitch } from '@/apps/main/components/app-switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/apps/main/components/ui/tabs'
import { useExplorerState } from './hooks/use-explorer-state'
import { GraphTab } from './components/graph-tab'
import { ExplorerTab } from './components/explorer-tab'
import { SearchTab } from './components/search-tab'
import { SchemaTab } from './components/schema-tab'
import { ImportTab } from './components/import-tab'
import { SettingsTab } from './components/settings-tab'
import { clearSummaryCache } from './components/node-summary'

export function Neo4jExplorer() {
  const { activeTab, setActiveTab } = useExplorerState()
  const prevTabRef = useRef(activeTab)

  // Clear summary cache when switching away from explorer tab
  useEffect(() => {
    if (prevTabRef.current === 'explorer' && activeTab !== 'explorer') {
      clearSummaryCache()
    }
    prevTabRef.current = activeTab
  }, [activeTab])

  // Clear summary cache when leaving the page (sidebar navigation)
  useEffect(() => {
    return () => clearSummaryCache()
  }, [])

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitcher />
          <AppSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>Neo4j Explorer</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='graph'>Graph</TabsTrigger>
            <TabsTrigger value='explorer'>Explorer</TabsTrigger>
            <TabsTrigger value='search'>Suche</TabsTrigger>
            <TabsTrigger value='schema'>Schema</TabsTrigger>
            <TabsTrigger value='import'>Import</TabsTrigger>
            <TabsTrigger value='settings'>Einstellungen</TabsTrigger>
          </TabsList>

          <TabsContent value='graph' className='mt-4'>
            <GraphTab />
          </TabsContent>
          <TabsContent value='explorer' className='mt-4'>
            <ExplorerTab />
          </TabsContent>
          <TabsContent value='search' className='mt-4'>
            <SearchTab />
          </TabsContent>
          <TabsContent value='schema' className='mt-4'>
            <SchemaTab />
          </TabsContent>
          <TabsContent value='import' className='mt-4'>
            <ImportTab />
          </TabsContent>
          <TabsContent value='settings' className='mt-4'>
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
