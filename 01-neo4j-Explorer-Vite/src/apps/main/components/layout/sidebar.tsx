import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/apps/main/components/ui/sidebar'
import { AppSwitcher } from '@/apps/main/components/app-switcher'
import { referenceAppSidebarData } from './sidebar-data'
import { NavGroup } from '@/apps/main/components/layout/nav-group'
import { NavUser } from '@/apps/main/components/layout/nav-user'

export function ReferenceAppSidebar() {
  const { collapsible, variant } = useLayout()
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppSwitcher currentApp='main' />
      </SidebarHeader>
      <SidebarContent>
        {referenceAppSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={referenceAppSidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
