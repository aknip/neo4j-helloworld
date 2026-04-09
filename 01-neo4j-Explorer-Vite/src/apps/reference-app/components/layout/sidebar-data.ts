import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  LayoutGrid,
  Car,
} from 'lucide-react'
import { type SidebarData } from '@/apps/reference-app/components/layout/types'

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
          url: '/reference-app/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/reference-app/tasks',
          icon: ListTodo,
        },
        {
          title: 'Chats',
          url: '/reference-app/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/reference-app/users',
          icon: Users,
        },
      ],
    },
    {
      title: 'Pages',
      items: [
        {
          title: 'Landing Page',
          url: '/reference-app/kfz-marktplatz',
          icon: Car,
        },
        {
          title: 'Component Overview',
          url: '/reference-app/component-showcase',
          icon: LayoutGrid,
        },
        {
          title: 'Apps',
          url: '/reference-app/apps',
          icon: Package,
        },
        {
          title: 'System Pages',
          icon: Bug,
          items: [
            {
              title: 'Sign In',
              url: '/reference-app/sign-in',
              icon: ShieldCheck,
            },
            {
              title: 'Sign In (2 Col)',
              url: '/reference-app/sign-in-2',
              icon: ShieldCheck,
            },
            {
              title: 'Sign Up',
              url: '/reference-app/sign-up',
              icon: ShieldCheck,
            },
            {
              title: 'Forgot Password',
              url: '/reference-app/forgot-password',
              icon: ShieldCheck,
            },
            {
              title: 'OTP',
              url: '/reference-app/otp',
              icon: ShieldCheck,
            },
            {
              title: 'Unauthorized',
              url: '/reference-app/401',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/reference-app/403',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/reference-app/404',
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: '/reference-app/500',
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/reference-app/503',
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
              url: '/reference-app/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/reference-app/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/reference-app/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/reference-app/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/reference-app/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/reference-app/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}

// Also export as referenceAppSidebarData for backwards compatibility
export const referenceAppSidebarData = sidebarData
