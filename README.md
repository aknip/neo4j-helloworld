# Prototype UI

A multi-app React platform with runtime theming and a CLI tool for generating themed demo apps from shadcn/ui presets.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: TanStack Router (file-based routing)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

## Project Structure

```
public/
└── themes/              # Runtime-loadable theme CSS and config

src/
├── main.tsx              # Entry point (Router, QueryClient, Theme providers)
├── routeTree.gen.ts      # Auto-generated route tree (do not edit)
├── apps/                 # Generated themed demo apps
│   └── [app-name]/       # Each app has:
│       ├── components/   # App-specific components
│       ├── context/      # Theme, layout, font providers
│       ├── features/     # Dashboard, component-showcase
│       └── styles/       # App-specific CSS
├── components/           # Shared UI components
│   ├── ui/              # 31 shadcn/ui base components
│   ├── layout/          # Layout components (sidebar, header, nav)
│   └── data-table/      # Reusable data table utilities
├── context/             # React context providers
│   ├── flexible-theme-provider.tsx  # Runtime theme switching
│   ├── theme-provider.tsx
│   ├── layout-provider.tsx
│   └── direction-provider.tsx       # RTL/LTR support
├── features/            # Feature modules per app
├── routes/              # TanStack Router file-based routes
├── lib/                 # Utility functions
│   ├── utils.ts         # cn() utility for Tailwind classes
│   ├── theme-registry.ts # Theme metadata and default mappings
│   └── theme-loader.ts   # Dynamic CSS loading
├── stores/              # Zustand state stores
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── styles/              # CSS files
```

## Development Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Build for production (tsc + vite build)
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm run knip         # Find unused code/dependencies
```

## Runtime Theme System

Switch themes without page reload using the flexible theme system.

### Key Components

1. **Theme Registry** (`src/lib/theme-registry.ts`) - Available themes and default mappings
2. **Theme Loader** (`src/lib/theme-loader.ts`) - Dynamic CSS loading
3. **FlexibleThemeProvider** (`src/context/flexible-theme-provider.tsx`) - React context with URL sync

### Theme Configuration (config.json)

```json
{
  "name": "Nova Orange Light",
  "layout": {
    "type": "sidebar",
    "maxWidth": "100%",
    "contentPadding": "2rem"
  },
  "navigation": {
    "position": "left",
    "width": "16rem",
    "collapsedWidth": "4rem",
    "collapsible": true
  },
  "header": {
    "height": "3.5rem",
    "sticky": true
  }
}
```

### Usage

```tsx
import { useFlexibleTheme } from '@/context/flexible-theme-provider';

function MyComponent() {
  const {
    currentTheme,     // e.g., "nova-orange-light"
    setTheme,         // Switch to any valid theme
    toggleDarkMode,   // Toggle light/dark counterpart
    isDark,           // Is current theme dark?
    availableThemes,  // All registered themes
    themeConfig       // config.json contents
  } = useFlexibleTheme();

  return (
    <button onClick={toggleDarkMode}>
      {isDark ? 'Switch to Light' : 'Switch to Dark'}
    </button>
  );
}
```

## Key Conventions

### Routing (TanStack Router)

- File-based routing in `src/routes/`
- `_authenticated/` prefix = protected routes requiring auth
- `(groupName)/` prefix = route groups without URL segment
- Route files export `Route` using `createFileRoute()`

### Components

- Use shadcn/ui components from `@/components/ui/`
- Feature-specific components in `src/features/<app>/<feature>/components/`
- Use `cn()` utility from `@/lib/utils` for conditional classes

### State Management

- **Zustand stores** in `src/stores/` for client state
- **TanStack Query** for server state management

### Styling

- Tailwind CSS classes directly in JSX
- CSS variables for theming (see `src/styles/theme.css`)
- Support for light/dark themes and RTL direction

### Forms

- React Hook Form for form state
- Zod schemas for validation in `data/schema.ts`
- Multi-step forms: Use Zustand store pattern

### Feature Organization

```
feature-name/
├── components/          # Feature-specific React components
├── data/
│   ├── schema.ts       # Zod validation schemas
│   └── data.tsx        # Mock/static data, type definitions
└── index.tsx           # Main feature component/export
```

## Shared Components

**shadcn/ui Base** (`@/components/ui/`) - 31 components:
- Form inputs: `input`, `textarea`, `password-input`, `label`, `checkbox`, `radio-group`, `select`
- Layout: `card`, `separator`, `tabs`, `accordion`, `collapsible`, `scroll-area`
- Dialogs: `dialog`, `alert-dialog`, `popover`, `tooltip`, `command`, `dropdown-menu`, `sheet`
- Feedback: `alert`, `badge`, `button`, `skeleton`, `sonner`
- Special: `stepper`, `table`, `date-picker`, `input-otp`, `sidebar`

**Data Table** (`@/components/data-table/`):
- `bulk-actions.tsx`, `column-header.tsx`, `faceted-filter.tsx`, `pagination.tsx`, `toolbar.tsx`, `view-options.tsx`

**Layout** (`@/components/layout/`):
- `app-sidebar.tsx`, `header.tsx`, `main.tsx`, `top-nav.tsx`, `nav-group.tsx`, `nav-user.tsx`

## Path Aliases

`@/` maps to `src/` - use this for all imports.

## Additional Directories

- `.tanstack/` - TanStack Router configuration (do not edit)
- `routeTree.gen.ts` - Auto-generated route tree (do not edit)
- `scripts/create-app/` - CLI tool for generating themed apps
- `public/themes/` - Runtime-loadable theme CSS and config
- `src/apps/` - Generated themed demo app components

