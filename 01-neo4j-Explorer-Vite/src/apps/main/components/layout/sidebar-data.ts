import {
  LayoutDashboard,
  Database,
  Bug,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Monitor,
  ShieldCheck,
  Construction,
} from 'lucide-react'
import { type SidebarData } from '@/apps/main/components/layout/types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/main/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Neo4j Explorer',
          url: '/main/neo4j-explorer',
          icon: Database,
        },
      ],
    },
    {
      title: 'Pages',
      items: [
        {
          title: 'System Pages',
          icon: Bug,
          items: [
            {
              title: 'Sign In',
              url: '/main/sign-in',
              icon: ShieldCheck,
            },
            {
              title: 'Sign In (2 Col)',
              url: '/main/sign-in-2',
              icon: ShieldCheck,
            },
            {
              title: 'Sign Up',
              url: '/main/sign-up',
              icon: ShieldCheck,
            },
            {
              title: 'Forgot Password',
              url: '/main/forgot-password',
              icon: ShieldCheck,
            },
            {
              title: 'OTP',
              url: '/main/otp',
              icon: ShieldCheck,
            },
            {
              title: 'Unauthorized',
              url: '/main/401',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/main/403',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/main/404',
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: '/main/500',
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/main/503',
              icon: Construction,
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/main/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/main/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/main/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/main/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/main/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/main/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}

// Also export as referenceAppSidebarData for backwards compatibility
export const referenceAppSidebarData = sidebarData
