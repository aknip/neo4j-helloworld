import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/apps/reference-app/components/layout/header'
import { ProfileDropdown } from '@/apps/reference-app/components/profile-dropdown'
import { Search } from '@/apps/reference-app/components/search'
import { ForbiddenError } from '@/apps/reference-app/features/errors/forbidden'
import { GeneralError } from '@/apps/reference-app/features/errors/general-error'
import { MaintenanceError } from '@/apps/reference-app/features/errors/maintenance-error'
import { NotFoundError } from '@/apps/reference-app/features/errors/not-found-error'
import { UnauthorisedError } from '@/apps/reference-app/features/errors/unauthorized-error'

export const Route = createFileRoute('/reference-app/_authenticated/errors/$error')({
  component: RouteComponent,
})

// eslint-disable-next-line react-refresh/only-export-components
function RouteComponent() {
  const { error } = Route.useParams()

  const errorMap: Record<string, React.ComponentType> = {
    unauthorized: UnauthorisedError,
    forbidden: ForbiddenError,
    'not-found': NotFoundError,
    'internal-server-error': GeneralError,
    'maintenance-error': MaintenanceError,
  }
  const ErrorComponent = errorMap[error] || NotFoundError

  return (
    <>
      <Header fixed className='border-b'>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>
      <div className='flex-1 [&>div]:h-full'>
        <ErrorComponent />
      </div>
    </>
  )
}
