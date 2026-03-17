# Accounts App

Standalone Next.js application for accounting and financial management, connected to the shared Supabase database.

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
cd ../../apps/accounts-app
```

5. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3008`

## Migration Status

⚠️ **In Progress**: The AccountingPage component needs to be fully migrated.

### Current Status
- ✅ App structure created
- ✅ Supabase configuration set up
- ✅ UI components copied
- ✅ Basic page wrapper created
- ⚠️ Full AccountingPage component needs to be copied and adapted

### To Complete Migration

1. **Copy the AccountingPage component:**
   ```bash
   # Copy from office-suite
   cp ../../office-suite/src/pages/accounting/AccountingPage.tsx components/AccountingPage.tsx
   ```

2. **Update imports in AccountingPage.tsx:**
   - Change: `import { supabase, isSupabaseEnabled } from "@/lib/supabase-client"`
   - To: `import { getSupabaseClient } from "@/app/lib/supabase"`
   - Then replace `supabase` usage with: `const supabase = getSupabaseClient()`
   - Replace `isSupabaseEnabled()` checks with: `if (!supabase) return`

3. **Update component imports:**
   - All `@/components/ui/*` imports should work as-is
   - Update `@/hooks/use-toast` to use the local hook

4. **Test the functionality:**
   - Verify Supabase connection
   - Test all accounting features
   - Check data persistence

## Architecture

This app:
- Uses the shared `@sebenza/supabase-config` package
- Connects to the same Supabase database as other apps
- Has its own authentication state (via `storageKey: 'sb-accounts-auth'`)
- Can be deployed independently

## Port Configuration

This app runs on port 3008 by default. To change it, update the `dev` and `start` scripts in `package.json`.

## Dependencies

This app includes:
- All necessary UI components (Button, Card, Dialog, etc.)
- Toast notification system
- Tailwind CSS for styling
- Shared Supabase configuration

## Deployment

This app can be deployed independently to any platform that supports Next.js:
- Vercel
- Netlify
- AWS Amplify
- Self-hosted

Make sure to set the environment variables in your deployment platform.
