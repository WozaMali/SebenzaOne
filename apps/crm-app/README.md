# CRM App

Standalone CRM application extracted from Sebenza Office Suite.

## Features

- Contact Management
- Company Management
- Deal Pipeline
- Activity Tracking
- Analytics & Reporting
- Kanban Board View
- Email Integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3009

## Port

This app runs on port 3009 by default to avoid conflicts with other Sebenza apps.
