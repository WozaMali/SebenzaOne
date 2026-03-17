# Standalone Apps Architecture - Summary

## What Was Created

### 1. Shared Supabase Configuration Package
**Location:** `packages/supabase-config/`

A reusable package that provides:
- Unified Supabase client creation
- Environment variable handling (Next.js & Vite compatible)
- Type-safe database interfaces
- Utility functions

**Key Files:**
- `src/index.ts` - Main package code
- `package.json` - Package configuration
- `README.md` - Package documentation

### 2. Example Standalone App
**Location:** `apps/projects-app/`

A complete example Next.js app showing:
- How to use the shared Supabase config
- Basic app structure
- Environment setup

**Key Files:**
- `app/page.tsx` - Main page component
- `app/lib/supabase.ts` - Supabase client helper
- `package.json` - App configuration
- `README.md` - App documentation

### 3. Helper Scripts
**Location:** `scripts/`

Scripts to quickly create new standalone apps:
- `create-standalone-app.sh` - Bash script (Linux/Mac)
- `create-standalone-app.ps1` - PowerShell script (Windows)

### 4. Documentation
- `STANDALONE_APPS_GUIDE.md` - Comprehensive guide
- `QUICK_START_STANDALONE_APPS.md` - Quick start guide
- `packages/supabase-config/README.md` - Package docs
- `apps/projects-app/README.md` - Example app docs

## Architecture Overview

```
SebenzaOne/
├── packages/
│   └── supabase-config/          # Shared Supabase package
├── apps/
│   ├── projects-app/             # Example standalone app
│   └── [your-new-apps]/          # Future standalone apps
├── landing-site/                 # Existing landing page
├── office-suite/                 # Original app (can migrate gradually)
└── scripts/                      # Helper scripts
```

## Key Concepts

### 1. Shared Database
All apps connect to the **same Supabase database** using the same credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Independent Authentication
Each app maintains its own auth state using unique `storageKey`:
```typescript
// Projects app
createSupabaseClient({ storageKey: 'sb-projects-auth' })

// Tasks app
createSupabaseClient({ storageKey: 'sb-tasks-auth' })
```

### 3. Independent Deployment
Each app can be deployed separately to:
- Different subdomains (projects.sebenzawaste.co.za)
- Different platforms (Vercel, Netlify, etc.)
- Different servers

## How to Use

### Create a New App

**Windows:**
```powershell
.\scripts\create-standalone-app.ps1 tasks-app 3004
```

**Linux/Mac:**
```bash
./scripts/create-standalone-app.sh tasks-app 3004
```

### Setup the App

```bash
cd apps/tasks-app
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

### Use Supabase

```typescript
import { createSupabaseClient } from '@sebenza/supabase-config'

const supabase = createSupabaseClient({
  storageKey: 'sb-tasks-auth'
})

const { data } = await supabase.from('tasks').select('*')
```

## Migration Strategy

### Option 1: Gradual Migration
1. Keep pages in `office-suite` initially
2. Create standalone apps for new features
3. Gradually migrate existing pages
4. Update links/routing as you migrate

### Option 2: Big Bang Migration
1. Create all standalone apps at once
2. Copy all pages and components
3. Update all links
4. Deploy all apps simultaneously

**Recommended:** Option 1 (Gradual) for lower risk

## Port Management

Assign unique ports to avoid conflicts:

| App | Port |
|-----|------|
| landing-site | 3000 |
| office-suite | 3001 |
| projects-app | 3003 |
| tasks-app | 3004 |
| crm-app | 3005 |
| email-app | 3006 |
| calendar-app | 3007 |
| accounting-app | 3008 |

## Next Steps

1. **Build the shared package:**
   ```bash
   cd packages/supabase-config
   npm install
   npm run build
   ```

2. **Test the example app:**
   ```bash
   cd apps/projects-app
   npm install
   npm run dev
   ```

3. **Create your first standalone app** using the script or template

4. **Migrate pages gradually** from `office-suite` to standalone apps

## Benefits Achieved

✅ **Independent Deployment** - Deploy apps separately  
✅ **Isolated Development** - Work on apps independently  
✅ **Shared Database** - Single source of truth  
✅ **Type Safety** - Shared types across apps  
✅ **Better Performance** - Smaller bundles per app  
✅ **Scalability** - Easy to add new apps  

## Support

- **Main Guide:** `STANDALONE_APPS_GUIDE.md`
- **Quick Start:** `QUICK_START_STANDALONE_APPS.md`
- **Package Docs:** `packages/supabase-config/README.md`
- **Example App:** `apps/projects-app/README.md`

## Notes

- The shared package must be built before apps can use it
- All apps share the same Supabase database
- Each app has its own authentication state
- Ports should be unique to avoid conflicts
- Environment variables are app-specific but use the same Supabase credentials
