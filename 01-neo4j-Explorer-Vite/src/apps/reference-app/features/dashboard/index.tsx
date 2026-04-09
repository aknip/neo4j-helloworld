import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { Button } from '@/apps/reference-app/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/apps/reference-app/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/apps/reference-app/components/ui/tabs'
import { ConfigDrawer } from '@/apps/reference-app/components/config-drawer'
import { Header } from '@/apps/reference-app/components/layout/header'
import { Main } from '@/apps/reference-app/components/layout/main'
import { ProfileDropdown } from '@/apps/reference-app/components/profile-dropdown'
import { Search } from '@/apps/reference-app/components/search'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AppSwitch } from '@/apps/reference-app/components/app-switch'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { AnimatedSection } from './components/animated-section'
import {
  BASE_DELAYS,
  DASHBOARD_DELAYS,
  getDashboardStatCardDelay,
} from '@/apps/reference-app/config/animation-config'

export function Dashboard() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        steps: [
          {
            element: '#total-revenue-card',
            popover: {
              title: 'Gesamtumsatz',
              description: 'Hier sehen Sie den Gesamtumsatz mit der Veränderung zum Vormonat.',
              side: 'bottom',
              align: 'start',
            },
          },
        ],
      })
      driverObj.drive()
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitcher />
          <ConfigDrawer />
          <AppSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <AnimatedSection delay={BASE_DELAYS.header}>
          <div className='mb-2 flex items-center justify-between space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
            <div className='flex items-center space-x-2'>
              <Button>Download</Button>
            </div>
          </div>
        </AnimatedSection>
        <Tabs
          defaultValue='overview'
          className='space-y-4'
        >
          <AnimatedSection delay={DASHBOARD_DELAYS.tabs}>
            <div className='w-full overflow-x-auto pb-2'>
              <TabsList>
                <TabsTrigger value='overview'>Overview</TabsTrigger>
                <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                <TabsTrigger value='reports' disabled>
                  Reports
                </TabsTrigger>
                <TabsTrigger value='notifications' disabled>
                  Notifications
                </TabsTrigger>
              </TabsList>
            </div>
          </AnimatedSection>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <AnimatedSection delay={getDashboardStatCardDelay(0)}>
                <Card id="total-revenue-card">
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Total Revenue
                    </CardTitle>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='h-4 w-4 text-muted-foreground'
                    >
                      <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>$45,231.89</div>
                    <p className='text-xs text-muted-foreground'>
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
              <AnimatedSection delay={getDashboardStatCardDelay(1)}>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Subscriptions
                    </CardTitle>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='h-4 w-4 text-muted-foreground'
                    >
                      <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                      <circle cx='9' cy='7' r='4' />
                      <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>+2350</div>
                    <p className='text-xs text-muted-foreground'>
                      +180.1% from last month
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
              <AnimatedSection delay={getDashboardStatCardDelay(2)}>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Sales</CardTitle>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='h-4 w-4 text-muted-foreground'
                    >
                      <rect width='20' height='14' x='2' y='5' rx='2' />
                      <path d='M2 10h20' />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>+12,234</div>
                    <p className='text-xs text-muted-foreground'>
                      +19% from last month
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
              <AnimatedSection delay={getDashboardStatCardDelay(3)}>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Active Now
                    </CardTitle>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='h-4 w-4 text-muted-foreground'
                    >
                      <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>+573</div>
                    <p className='text-xs text-muted-foreground'>
                      +201 since last hour
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <AnimatedSection delay={DASHBOARD_DELAYS.overviewContent.overview} className='col-span-1 lg:col-span-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent className='ps-2'>
                    <Overview />
                  </CardContent>
                </Card>
              </AnimatedSection>
              <AnimatedSection delay={DASHBOARD_DELAYS.overviewContent.recentSales} className='col-span-1 lg:col-span-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>
                      You made 265 sales this month.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales />
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <AnimatedSection delay={DASHBOARD_DELAYS.analyticsContent}>
              <Analytics />
            </AnimatedSection>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
