# Sebenza Waste - Deployment Guide

## Repository Structure

This repository contains two applications:

- **Landing Site** (`landing-site/`) → `sebenzawaste.co.za`
- **Office Suite** (`office-suite/`) → `office.sebenzawaste.co.za`

## Development

### Start the Landing Site
```bash
cd landing-site
npm run dev
```

### Start the Office Suite Application
```bash
cd office-suite
npm run dev
```

## URLs

- **Landing Site**: http://localhost:8080 (sebenzawaste.co.za)
- **Office Suite**: http://localhost:3001 (office.sebenzawaste.co.za)

## Production Deployment

### Landing Site (sebenzawaste.co.za)
1. Build the application:
   ```bash
   cd landing-site
   npm run build
   ```

2. Deploy the `dist` directory to your hosting provider
3. Configure DNS to point `sebenzawaste.co.za` to your hosting

### Office Suite (office.sebenzawaste.co.za)
1. Build the application:
   ```bash
   cd office-suite
   npm run build
   ```

2. Deploy the `.next` directory to your hosting provider
3. Configure DNS to point `office.sebenzawaste.co.za` to your hosting

## Environment Variables

Both applications have their own environment variables:

- `landing-site/.env.production` - Landing site production configuration
- `landing-site/.env.development` - Landing site development configuration
- `office-suite/.env.production` - Office suite production configuration
- `office-suite/.env.local` - Office suite local configuration

## DNS Configuration

Configure your DNS records:

```
sebenzawaste.co.za          A    YOUR_SERVER_IP
office.sebenzawaste.co.za   A    YOUR_SERVER_IP
```

Or use CNAME records if using a CDN:

```
sebenzawaste.co.za          CNAME    your-cdn-domain.com
office.sebenzawaste.co.za   CNAME    your-cdn-domain.com
```

## Features

### Office Suite
- Complete business productivity suite
- Mail, Projects, CRM, Drive, Notes, etc.
- User authentication
- Real-time collaboration
