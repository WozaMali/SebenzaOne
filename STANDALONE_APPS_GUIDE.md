# Standalone Apps Architecture Guide

This guide explains how to separate pages into standalone apps while maintaining a shared Supabase database.

## Overview

The Sebenza suite is being restructured into a monorepo with:
- **Shared packages**: Common code (like Supabase config) used by all apps
- **Standalone apps**: Independent Next.js applications, each handling specific functionality
- **Shared database**: All apps connect to the same Supabase instance

## Architecture

```
SebenzaOne/
├── packages/
│   └── supabase-config/     # Shared Supabase configuration
├── apps/
│   ├── projects-app/         # Standalone projects app
│   ├── tasks-app/            # Standalone tasks app
│   ├── crm-app/              # Standalone CRM app
│   └── ...                    # More standalone apps
├── landing-site/             # Existing landing page
└── office-suite/             # Original monolithic app (can be gradually migrated)
```

## Benefits

1. **Independent Deployment**: Each app can be deployed separately
2. **Isolated Development**: Teams can work on different apps independently
3. **Better Performance**: Smaller bundle sizes per app
4. **Shared Database**: All apps use the same Supabase instance
5. **Type Safety**: Shared types ensure consistency across apps

## Shared Supabase Configuration

The `@sebenza/supabase-config` package provides:

- Unified Supabase client creation
- Environment variable handling (Next.js and Vite compatible)
- Type-safe database interfaces
- Utility functions for common operations

### Usage in Apps

```typescript
import { createSupabaseClient } from '@sebenza/supabase-config'

// Create a client with a unique storage key for this app
const supabase = createSupabaseClient({
  storageKey: 'sb-projects-auth' // Unique per app
})

// Use the client
const { data, error } = await supabase.from('projects').select('*')
```

## Creating a New Standalone App

### Step 1: Create App Structure

```bash
mkdir apps/my-new-app
cd apps/my-new-app
```

### Step 2: Initialize Next.js

```bash
npx create-next-app@latest . --typescript --app --no-tailwind
```

### Step 3: Install Shared Package

```bash
npm install @sebenza/supabase-config
```

### Step 4: Update package.json

```json
{
  "name": "@sebenza/my-new-app",
  "scripts": {
    "dev": "next dev -p 3004",
    "build": "next build",
    "start": "next start -p 3004"
  },
  "dependencies": {
    "@sebenza/supabase-config": "*"
  }
}
```

### Step 5: Configure Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 6: Use Supabase in Your App

```typescript
// app/lib/supabase.ts
import { createSupabaseClient } from '@sebenza/supabase-config'

export function getSupabaseClient() {
  return createSupabaseClient({
    storageKey: 'sb-my-app-auth' // Unique key
  })
}
```

### Step 7: Create Your Pages

```typescript
// app/page.tsx
'use client'

import { getSupabaseClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    const supabase = getSupabaseClient()
    if (supabase) {
      supabase.from('your_table').select('*').then(({ data }) => {
        setData(data || [])
      })
    }
  }, [])
  
  return <div>{/* Your UI */}</div>
}
```

## Migrating Existing Pages

### Option 1: Copy and Adapt

1. Copy the page component from `office-suite/app/your-page/page.tsx`
2. Copy related components to the new app
3. Update imports to use `@sebenza/supabase-config`
4. Test and deploy

### Option 2: Gradual Migration

1. Keep the page in `office-suite` initially
2. Create the new standalone app
3. Gradually move functionality
4. Update routing/links to point to the new app
5. Remove from `office-suite` once fully migrated

## Port Configuration

Each app should use a unique port:

- `projects-app`: 3003
- `tasks-app`: 3004
- `crm-app`: 3005
- `email-app`: 3006
- etc.

Update the port in `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev -p 3003"
  }
}
```

## Development Workflow

### Running All Apps

From the root directory:

```bash
npm run dev
```

This will start all apps concurrently (you may need to configure this in root `package.json`).

### Running Individual Apps

```bash
cd apps/projects-app
npm run dev
```

### Building All Apps

```bash
npm run build
```

## Environment Variables

### Shared Variables

All apps use the same Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### App-Specific Variables

Each app can have its own additional variables:

```env
# apps/projects-app/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_NAME=Projects
```

## Authentication

Each app maintains its own authentication state using a unique `storageKey`:

```typescript
// Projects app
const supabase = createSupabaseClient({ storageKey: 'sb-projects-auth' })

// Tasks app
const supabase = createSupabaseClient({ storageKey: 'sb-tasks-auth' })
```

This allows:
- Users to be logged in to multiple apps simultaneously
- Independent session management per app
- Shared authentication (same user account across apps)

## Deployment

### Independent Deployment

Each app can be deployed separately:

1. **Vercel**: Connect each app's directory as a separate project
2. **Netlify**: Deploy each app independently
3. **Self-hosted**: Run each app on different ports/domains

### Subdomain Strategy

You can use subdomains for each app:

- `projects.sebenzawaste.co.za` → projects-app
- `tasks.sebenzawaste.co.za` → tasks-app
- `crm.sebenzawaste.co.za` → crm-app

### Shared Environment Variables

Set the same Supabase credentials in each deployment platform.

## Type Safety

The shared `@sebenza/supabase-config` package exports TypeScript types:

```typescript
import { createSupabaseClient, Database } from '@sebenza/supabase-config'

const supabase = createSupabaseClient<Database>()
```

This ensures type safety across all apps.

## Best Practices

1. **Unique Storage Keys**: Always use unique `storageKey` values per app
2. **Shared Types**: Use types from `@sebenza/supabase-config` for consistency
3. **Environment Variables**: Keep Supabase credentials consistent across apps
4. **Port Management**: Document which port each app uses
5. **Error Handling**: Handle cases where Supabase might not be configured

## Troubleshooting

### "Supabase not configured" Warning

- Check that environment variables are set correctly
- Ensure `.env.local` exists in the app directory
- Verify variable names match (NEXT_PUBLIC_ prefix for Next.js)

### Type Errors

- Make sure `@sebenza/supabase-config` is installed
- Run `npm install` in the packages directory first
- Rebuild the shared package: `cd packages/supabase-config && npm run build`

### Port Conflicts

- Each app should use a unique port
- Check `package.json` scripts for port configuration
- Update if conflicts occur

## Next Steps

1. **Build the shared package**:
   ```bash
   cd packages/supabase-config
   npm install
   npm run build
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create your first standalone app** using the example `projects-app` as a template

4. **Migrate pages gradually** from `office-suite` to standalone apps

5. **Update routing** to point to the new standalone apps

## Example: Migrating the Tasks Page

1. Create `apps/tasks-app`
2. Copy `office-suite/app/tasks/page.tsx` and related components
3. Update Supabase imports to use `@sebenza/supabase-config`
4. Test locally
5. Deploy independently
6. Update links in other apps to point to the new tasks app URL

## Questions?

For issues or questions, refer to:
- `packages/supabase-config/README.md` - Package documentation
- `apps/projects-app/README.md` - Example app documentation
