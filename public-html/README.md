# Sebenza Waste - Static HTML Landing Page

This folder contains the complete static HTML version of the Sebenza Waste landing page that you can upload to any web server.

## 📁 File Structure

```
public-html/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css          # Main stylesheet
│   └── animations.css      # Animation styles
├── js/
│   └── main.js            # JavaScript functionality
├── assets/                # Images and media files
│   ├── SNWG LOGO.png
│   ├── Phakama Soweto.png
│   ├── WozaMali.png
│   ├── Green Scholar.png
│   ├── Soweto.png
│   ├── favi.png
│   └── hero-landfill.jpg
└── README.md              # This file
```

## 🚀 Deployment Instructions

### Option 1: Upload to Web Server
1. Upload all files to your web server's public directory
2. Ensure the folder structure is maintained
3. Access via your domain (e.g., `https://sebenzawaste.co.za`)

### Option 2: GitHub Pages
1. Create a new repository on GitHub
2. Upload all files to the repository
3. Enable GitHub Pages in repository settings
4. Access via `https://yourusername.github.io/repository-name`

### Option 3: Netlify
1. Drag and drop the entire `public-html` folder to Netlify
2. Your site will be live instantly
3. You can connect a custom domain later

### Option 4: Vercel
1. Create a new project on Vercel
2. Upload the `public-html` folder
3. Deploy and get a Vercel URL

## 🔧 Customization

### Changing Colors
Edit `css/styles.css` and look for these CSS variables:
- Primary color: `#2d5a27` (green)
- Secondary color: `#4ade80` (light green)
- Text color: `#333` (dark gray)

### Updating Content
Edit `index.html` to change:
- Text content
- Images (update `src` attributes)
- Contact information
- Links and buttons

### Adding New Sections
1. Add HTML structure in `index.html`
2. Add corresponding styles in `css/styles.css`
3. Add any JavaScript functionality in `js/main.js`

## 📱 Features

- ✅ Fully responsive design
- ✅ Mobile-first approach
- ✅ Smooth scrolling navigation
- ✅ Animated hero section
- ✅ Interactive FAQ section
- ✅ Contact form with validation
- ✅ SEO optimized
- ✅ Fast loading
- ✅ Cross-browser compatible

## 🌐 SEO Features

- Meta tags for social sharing
- Open Graph tags for Facebook/LinkedIn
- Twitter Card tags
- Structured data ready
- Semantic HTML structure
- Alt tags for all images

## 📞 Contact Information

Update the contact section in `index.html` with your actual:
- Email address
- Phone number
- Physical address
- Social media links

## 🔗 Links to Update

Before going live, update these links in `index.html`:
- Office suite URL (currently placeholder)
- Social media links
- Contact form action (if using server-side processing)
- Any external links

## 🚀 Performance Tips

1. **Optimize Images**: Compress images before uploading
2. **Enable Compression**: Configure your server for gzip compression
3. **Use CDN**: Consider using a CDN for faster global delivery
4. **Cache Headers**: Set appropriate cache headers for static assets

## 🛠️ Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Analytics

To add Google Analytics or other tracking:
1. Add the tracking code before the closing `</head>` tag in `index.html`
2. Or add it in the `js/main.js` file

## 🔒 Security

- No server-side code (static files only)
- No database connections
- No sensitive information in client-side code
- HTTPS recommended for production

## 📝 License

This static HTML version is part of the Sebenza Waste project and follows the same licensing terms.

---

**Ready to deploy?** Just upload the entire `public-html` folder to your web server and you're live! 🚀
