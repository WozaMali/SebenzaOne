# Projects App

Standalone Next.js application for project management, connected to the shared Supabase database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Build the shared Supabase package (if not already built):
```bash
cd ../../packages/supabase-config
npm install
npm run build
cd ../../apps/projects-app
```

5. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3009`

## Architecture

This app:
- Uses the shared `@sebenza/supabase-config` package
- Connects to the same Supabase database as other apps
- Has its own authentication state (via `storageKey: 'sb-projects-auth'`)
- Can be deployed independently

## Port Configuration

This app runs on port 3009 by default. To change it, update the `dev` and `start` scripts in `package.json`.

## Migration Status

⚠️ **In Progress**: The ProjectsPage component needs to be fully migrated from office-suite.

### Current Status
- ✅ App structure created
- ✅ Supabase configuration set up
- ✅ UI components copied
- ✅ Basic page wrapper created
- ⚠️ ProjectsPage component needs to be copied and adapted from office-suite

### To Complete Migration

1. **Copy the ProjectsPage component and adapt it:**
   - Remove React Router dependencies (`useLocation` -> use Next.js `useSearchParams`)
   - Update imports to match the new structure
   - Copy supporting components (ProjectsListPage, ProjectsTable, CreateProjectDialog, EditProjectDialog, DeleteProjectDialog, ProjectsFilters)
   - Copy necessary hooks (useLocalStorage)
   - Copy necessary utilities (supabase-projects lib)
   - Copy additional components if needed (WorkloadReport, CollaborationFeed)

2. **Update component imports:**
   - Change: `import { useLocation } from "react-router-dom"` 
   - To: `import { useSearchParams } from "next/navigation"`
   - Replace `location.search` with Next.js search params
   - All `@/components/ui/*` imports should work as-is
   - Update `@/hooks/*` to use local hooks
   - Update `@/lib/*` to use local lib files

3. **Test the functionality:**
   - Verify Supabase connection
   - Test all project management features
   - Check data persistence

## Dependencies

This app includes:
- All necessary UI components (Button, Card, Dialog, Table, etc.)
- Tailwind CSS for styling
- Shared Supabase configuration
- React-to-print for printing functionality
- Date-fns for date handling

## Deployment

This app can be deployed independently to any platform that supports Next.js:
- Vercel
- Netlify
- AWS Amplify
- Self-hosted

Make sure to set the environment variables in your deployment platform.
