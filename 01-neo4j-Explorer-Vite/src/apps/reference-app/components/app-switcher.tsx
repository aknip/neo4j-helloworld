import { useState } from 'react'
import { ChevronsUpDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/apps/reference-app/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/apps/reference-app/components/ui/sidebar'
import { type AppId } from '@/context/app-context'

const organizations = [
  { id: 'org1', name: 'Org 1' },
  { id: 'org2', name: 'Org 2' },
  { id: 'org3', name: 'Org 3' },
]

interface AppSwitcherProps {
  currentApp: AppId
}

export function AppSwitcher({ currentApp }: AppSwitcherProps) {
  const { isMobile } = useSidebar()
  const [selectedOrg, setSelectedOrg] = useState(organizations[0])

  const appName =
    currentApp === 'reference-app' ? 'Reference App' :
    currentApp === 'kfz-marktplatz-old' ? 'KFZ Marktplatz (OLD)' :
    currentApp === 'portal-central' ? 'Portal Central' :
    'Portal 2'
  const appInitial =
    currentApp === 'reference-app' ? 'R' :
    currentApp === 'kfz-marktplatz-old' ? 'K' :
    currentApp === 'portal-central' ? 'C' :
    '2'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-semibold'>
                {appInitial}
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{appName}</span>
                <span className='truncate text-xs'>{selectedOrg.name}</span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Organizations
            </DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => setSelectedOrg(org)}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border font-semibold text-xs'>
                  {org.name.slice(-1)}
                </div>
                <span className='font-medium flex-1'>{org.name}</span>
                {selectedOrg.id === org.id && (
                  <Check className='size-4' />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
