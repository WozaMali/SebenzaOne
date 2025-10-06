# Vercel Domain Validation Troubleshooting Guide

## Issue: Vercel won't validate sebenzawaste.co.za

### Common Causes & Solutions

## 1. DNS Configuration Issues

### Check Current DNS Records
```bash
# Check A records
nslookup sebenzawaste.co.za

# Check CNAME records
nslookup www.sebenzawaste.co.za
```

### Required DNS Configuration

**Option A: A Record (Recommended)**
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600

Type: A
Name: www
Value: 76.76.19.61
TTL: 3600
```

**Option B: CNAME Record**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

## 2. Domain Verification Steps

### Step 1: Add Domain in Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `sebenzawaste.co.za`
5. Click **Add**

### Step 2: Verify Domain Ownership
Vercel will show you DNS records to add. Choose one method:

**Method 1: TXT Record (Recommended)**
```
Type: TXT
Name: @
Value: [vercel-verification-code]
TTL: 3600
```

**Method 2: CNAME Record**
```
Type: CNAME
Name: [subdomain]
Value: [vercel-verification-target]
TTL: 3600
```

### Step 3: Wait for Propagation
- DNS changes can take 24-48 hours to propagate
- Use tools like `whatsmydns.net` to check global propagation
- Vercel will automatically detect when DNS is ready

## 3. Common Issues & Fixes

### Issue: "Domain not verified"
**Solution:**
1. Double-check the TXT record is exactly as Vercel provided
2. Ensure no extra spaces or characters
3. Wait for DNS propagation (up to 48 hours)

### Issue: "Invalid domain format"
**Solution:**
1. Ensure domain is entered without `http://` or `https://`
2. Use `sebenzawaste.co.za` not `www.sebenzawaste.co.za` for root domain
3. Add `www.sebenzawaste.co.za` as a separate domain if needed

### Issue: "Domain already in use"
**Solution:**
1. Check if domain is already added to another Vercel project
2. Remove from other projects first
3. Or use a different subdomain

### Issue: "SSL Certificate error"
**Solution:**
1. Wait for Vercel to automatically provision SSL
2. This usually takes 5-10 minutes after domain verification
3. Check SSL status in Vercel dashboard

## 4. Advanced Configuration

### Custom Domain with WWW
If you want both `sebenzawaste.co.za` and `www.sebenzawaste.co.za`:

1. Add both domains in Vercel
2. Set up redirects in `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "https://sebenzawaste.co.za/$1",
      "permanent": true,
      "has": [
        {
          "type": "host",
          "value": "www.sebenzawaste.co.za"
        }
      ]
    }
  ]
}
```

### Environment Variables
Ensure your environment variables are set in Vercel:
1. Go to **Settings** → **Environment Variables**
2. Add production variables:
   - `VITE_APP_URL=https://sebenzawaste.co.za`
   - `VITE_APP_DOMAIN=sebenzawaste.co.za`

## 5. Testing Domain Setup

### Local Testing
```bash
# Test build locally
npm run build

# Test preview
npm run preview
```

### Production Testing
1. Deploy to Vercel
2. Test domain access: `https://sebenzawaste.co.za`
3. Check SSL certificate validity
4. Test all pages and functionality

## 6. Troubleshooting Commands

### Check DNS Propagation
```bash
# Windows
nslookup sebenzawaste.co.za

# Linux/Mac
dig sebenzawaste.co.za
```

### Check SSL Certificate
```bash
# Check SSL details
openssl s_client -connect sebenzawaste.co.za:443 -servername sebenzawaste.co.za
```

### Test HTTP Headers
```bash
curl -I https://sebenzawaste.co.za
```

## 7. Vercel-Specific Settings

### Project Settings
1. **Framework Preset**: Vite
2. **Build Command**: `npm run vercel-build`
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

### Build Settings
```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## 8. Still Having Issues?

### Contact Vercel Support
1. Go to Vercel dashboard
2. Click **Help** → **Contact Support**
3. Provide:
   - Domain name
   - DNS records you've added
   - Screenshots of error messages
   - Project URL

### Alternative Solutions
1. **Use Vercel's domain**: `your-project.vercel.app`
2. **Try different DNS provider**: Cloudflare, Route 53
3. **Check domain registrar**: Ensure domain is properly configured

## 9. Quick Checklist

- [ ] Domain added to Vercel project
- [ ] DNS records added correctly
- [ ] Waited for DNS propagation (24-48 hours)
- [ ] SSL certificate provisioned
- [ ] Environment variables set
- [ ] Build configuration correct
- [ ] No conflicting DNS records

## 10. Success Indicators

✅ Domain shows as "Valid" in Vercel dashboard
✅ SSL certificate is active
✅ Site loads at `https://sebenzawaste.co.za`
✅ All pages and assets load correctly
✅ No mixed content warnings
