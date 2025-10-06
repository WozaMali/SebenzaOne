# Sebenza Waste Landing Site

A modern, responsive landing page for Sebenza Nathi Waste Group's recycling rewards program.

## 🌐 Live Site

**URL**: [sebenzawaste.co.za](https://sebenzawaste.co.za)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/WozaMali/SebenzaOne.git
cd SebenzaOne/landing-site

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:8080`

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🏗️ Technology Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

## 📁 Project Structure

```
landing-site/
├── src/
│   ├── components/     # React components
│   ├── assets/        # Images and static files
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utility functions
│   └── pages/         # Page components
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## 🎨 Features

- **Responsive Design** - Mobile-first approach
- **Modern UI** - Clean, professional design
- **Fast Loading** - Optimized for performance
- **SEO Optimized** - Meta tags and structured data
- **Accessibility** - WCAG compliant components

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to Production

1. Build the application: `npm run build`
2. Upload the `dist/` directory to your web server
3. Configure your web server to serve static files
4. Set up DNS to point `sebenzawaste.co.za` to your server

## 🔧 Configuration

### Environment Variables

- `.env.development` - Development settings
- `.env.production` - Production settings

### Domain Configuration

The site is configured for:
- **Production**: `sebenzawaste.co.za`
- **Development**: `localhost:8080`

## 📱 Components

- **Hero Section** - Main landing area with call-to-action
- **Features** - Key benefits and features
- **About** - Company information
- **Contact** - Contact form and information
- **Footer** - Links and additional information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team