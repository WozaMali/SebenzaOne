# Quick Start: Standalone Apps

This guide will help you get started with the standalone apps architecture.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase project credentials

## Initial Setup

### 1. Build the Shared Package

First, build the shared Supabase configuration package:

```bash
cd packages/supabase-config
npm install
npm run build
cd ../..
```

### 2. Install All Dependencies

From the root directory:

```bash
npm install
```

This will install dependencies for all workspaces.

## Creating a New Standalone App

### Option 1: Using the Script (Recommended)

**Windows (PowerShell):**
```powershell
.\scripts\create-standalone-app.ps1 tasks-app 3004
```

**Linux/Mac:**
```bash
chmod +x scripts/create-standalone-app.sh
./scripts/create-standalone-app.sh tasks-app 3004
```

### Option 2: Manual Creation

1. Copy the `apps/projects-app` directory as a template
2. Rename it to your app name
3. Update `package.json` with your app name and port
4. Update the `storageKey` in your Supabase client creation

## Setting Up Environment Variables

Each app needs Supabase credentials. Create `.env.local` in each app directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Important:** All apps use the same Supabase URL and anon key - they share the same database.

## Running Apps

### Run a Single App

```bash
cd apps/projects-app
npm run dev
```

### Run Multiple Apps

You can run multiple apps in separate terminals, or use a process manager like `concurrently`.

## Port Assignments

To avoid conflicts, use these port assignments:

- `projects-app`: 3003
- `tasks-app`: 3004
- `crm-app`: 3005
- `email-app`: 3006
- `calendar-app`: 3007
- `accounting-app`: 3008
- etc.

## Example: Using Supabase in Your App

```typescript
// app/lib/supabase.ts
import { createSupabaseClient } from '@sebenza/supabase-config'

export function getSupabaseClient() {
  return createSupabaseClient({
    storageKey: 'sb-my-app-auth' // Unique per app
  })
}
```

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
      supabase
        .from('your_table')
        .select('*')
        .then(({ data, error }) => {
          if (error) console.error(error)
          else setData(data || [])
        })
    }
  }, [])
  
  return <div>{/* Your UI */}</div>
}
```

## Testing the Setup

1. **Test the shared package:**
   ```bash
   cd packages/supabase-config
   npm run type-check
   ```

2. **Test an app:**
   ```bash
   cd apps/projects-app
   npm run dev
   ```
   Visit `http://localhost:3003` and check the browser console for any errors.

## Common Issues

### "Cannot find module '@sebenza/supabase-config'"

**Solution:** Build the shared package first:
```bash
cd packages/supabase-config
npm run build
cd ../..
npm install
```

### "Supabase not configured" Warning

**Solution:** Make sure `.env.local` exists in your app directory with the correct variables.

### Port Already in Use

**Solution:** Change the port in your app's `package.json` scripts.

## Next Steps

1. Read `STANDALONE_APPS_GUIDE.md` for detailed documentation
2. Check `packages/supabase-config/README.md` for package API
3. Use `apps/projects-app` as a reference implementation

## Need Help?

- Check the main guide: `STANDALONE_APPS_GUIDE.md`
- Review the example app: `apps/projects-app/README.md`
- Check package docs: `packages/supabase-config/README.md`
