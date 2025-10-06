# Sebenza Waste Suite

A comprehensive business suite consisting of a landing page and office productivity applications for waste management services.

## 🌐 Live Applications

- **Landing Page**: [sebenzawaste.co.za](https://sebenzawaste.co.za)
- **Office Suite**: [office.sebenzawaste.co.za](https://office.sebenzawaste.co.za)

## 📁 Project Structure

```
sebenza-waste-suite/
├── landing-site/          # Landing page (Vite + React + TypeScript)
│   ├── src/
│   ├── public/
│   └── package.json
├── office-suite/          # Office productivity suite (Next.js + React + TypeScript)
│   ├── app/
│   ├── src/
│   └── package.json
├── package.json           # Root package.json for monorepo management
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sebenza-waste-suite.git
cd sebenza-waste-suite
```

2. Install all dependencies:
```bash
npm run install:all
```

### Development

Start both applications in development mode:
```bash
npm run dev
```

Or start them individually:
```bash
# Landing site only (http://localhost:8080)
npm run dev:landing

# Office suite only (http://localhost:3001)
npm run dev:office
```

### Production Build

Build both applications:
```bash
npm run build
```

Or build individually:
```bash
npm run build:landing
npm run build:office
```

## 🛠️ Available Scripts

### Root Level Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both applications in development mode |
| `npm run build` | Build both applications for production |
| `npm run start` | Start both applications in production mode |
| `npm run install:all` | Install dependencies for all applications |
| `npm run clean` | Clean build artifacts from all applications |
| `npm run lint` | Run linting for all applications |

### Individual Application Commands

| Command | Description |
|---------|-------------|
| `npm run dev:landing` | Start landing site development server |
| `npm run dev:office` | Start office suite development server |
| `npm run build:landing` | Build landing site for production |
| `npm run build:office` | Build office suite for production |
| `npm run start:landing` | Start landing site production server |
| `npm run start:office` | Start office suite production server |

## 🏗️ Applications

### Landing Site (`landing-site/`)

**Technology Stack:**
- Vite
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components

**Features:**
- Modern, responsive design
- SEO optimized
- Fast loading times
- Mobile-first approach

**Development:**
```bash
cd landing-site
npm run dev
```

### Office Suite (`office-suite/`)

**Technology Stack:**
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Supabase (Database & Auth)
- AWS SES (Email)

**Features:**
- Email management
- Project management
- CRM system
- File storage
- Calendar integration
- Notes and planning tools
- Real-time collaboration

**Development:**
```bash
cd office-suite
npm run dev
```

## 🔧 Configuration

### Environment Variables

Each application has its own environment configuration:

#### Landing Site
- `.env.development` - Development settings
- `.env.production` - Production settings

#### Office Suite
- `.env.local` - Local development settings
- `.env.production` - Production settings

### Domain Configuration

- **Landing Site**: `sebenzawaste.co.za`
- **Office Suite**: `office.sebenzawaste.co.za`

Both applications are configured for cross-domain communication and can link to each other seamlessly.

## 🚀 Deployment

### DNS Configuration

Configure your DNS records:

```
sebenzawaste.co.za          A    YOUR_SERVER_IP
office.sebenzawaste.co.za   A    YOUR_SERVER_IP
```

### Deployment Steps

1. **Build Applications:**
   ```bash
   npm run build
   ```

2. **Deploy Landing Site:**
   - Upload `landing-site/dist/` to your web server
   - Configure web server to serve static files

3. **Deploy Office Suite:**
   - Upload `office-suite/.next/` to your Node.js server
   - Configure environment variables
   - Start the application

### Environment Setup

Ensure production environment variables are configured:

- Supabase credentials
- AWS credentials (for email services)
- Domain configurations
- SSL certificates

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [Domain Configuration](DOMAIN_CONFIGURATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with landing page and office suite