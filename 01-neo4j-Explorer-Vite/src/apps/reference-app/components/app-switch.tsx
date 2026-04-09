import { useNavigate } from '@tanstack/react-router'
import { Check, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/apps/reference-app/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/apps/reference-app/components/ui/dropdown-menu'
import { useCurrentApp } from '@/context/app-context'

const apps = [
  { id: 'main', name: 'Main App', path: '/main/dashboard' },
  { id: 'reference-app', name: 'Referenz App', path: '/reference-app/dashboard' },
] as const

export function AppSwitch() {
  const { appId } = useCurrentApp()
  const navigate = useNavigate()

  const handleAppSwitch = (appPath: string) => {
    navigate({ to: appPath as any })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          <Monitor className='size-[1.2rem]' />
          <span className='sr-only'>Switch app</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {apps.map((app) => (
          <DropdownMenuItem
            key={app.id}
            onClick={() => handleAppSwitch(app.path)}
          >
            {app.name}
            <Check
              size={14}
              className={cn('ms-auto', appId !== app.id && 'hidden')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
