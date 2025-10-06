# Mail Settings Setup Guide

This guide will help you configure the mail settings feature in the Sebenza Suite Interface.

## Prerequisites

1. AWS Account with SES enabled
2. Domain name for email sending
3. Supabase account (optional, for data persistence)

## AWS SES Setup

### 1. Create AWS IAM User

1. Go to AWS Console > IAM > Users
2. Click "Create user"
3. Enter username: `sebenza-mail-service`
4. Select "Programmatic access"
5. Attach policy: `AmazonSESFullAccess` (or create custom policy with minimal permissions)
6. Download the Access Key ID and Secret Access Key

### 2. Verify Domain in AWS SES

1. Go to AWS Console > SES > Verified identities
2. Click "Create identity"
3. Select "Domain"
4. Enter your domain name (e.g., `yourdomain.com`)
5. Follow the DNS verification process
6. Add the required DNS records to your domain

### 3. Request Production Access (if needed)

- By default, SES is in sandbox mode
- To send emails to any address, request production access
- Go to SES > Account dashboard > Request production access

## DNS Records Configuration

### MX Record
```
Type: MX
Name: @ (or your domain)
Value: 10 mail.yourdomain.com
TTL: 3600
```

### SPF Record
```
Type: TXT
Name: @ (or your domain)
Value: v=spf1 include:amazonses.com -all
TTL: 3600
```

### DKIM Records
```
Type: CNAME
Name: ses1._domainkey
Value: ses1.dkim.amazonses.com
TTL: 3600

Type: CNAME
Name: ses2._domainkey
Value: ses2.dkim.amazonses.com
TTL: 3600

Type: CNAME
Name: ses3._domainkey
Value: ses3.dkim.amazonses.com
TTL: 3600
```

### DMARC Record
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com; fo=1
TTL: 3600
```

## Environment Configuration

1. Copy `.env.example` to `.env.local`
2. Fill in your AWS credentials and other settings:

```env
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=AKIA...
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_key
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_FROM_NAME=Your Company Name
```

## Supabase Setup (Optional)

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql`
3. Get your project URL and anon key
4. Add to environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Using the Settings Page

### 1. Organization Dashboard
- View email statistics
- Monitor system status
- Check domain verification status

### 2. Domains Configuration
- Add your domains
- Configure MX, SPF, DKIM, and DMARC records
- Verify DNS records automatically
- Monitor verification status

### 3. Users Management
- Add/remove users
- Set user roles (Admin, Moderator, User)
- Activate/deactivate users
- Manage user permissions

### 4. Mail Settings
- Configure SMTP settings
- Set up AWS SES integration
- Configure security settings
- Set email limits and retention

### 5. Reports
- Generate email reports
- Download usage statistics
- Monitor system performance

## Testing Your Setup

1. Go to Mail Settings tab
2. Fill in your AWS credentials
3. Click "Test Connection"
4. If successful, click "Save"
5. Go to Domains tab
6. Add your domain
7. Click "Verify DNS" to check records
8. Send a test email to verify everything works

## Troubleshooting

### Common Issues

1. **"Invalid AWS credentials"**
   - Check your Access Key ID and Secret Access Key
   - Ensure the IAM user has SES permissions

2. **"Domain not verified"**
   - Check DNS records are properly configured
   - Wait for DNS propagation (up to 48 hours)
   - Use the DNS verification tool in the settings

3. **"Email sending failed"**
   - Check if SES is in sandbox mode
   - Verify the "From" email address is verified
   - Check AWS SES sending limits

4. **"Supabase connection failed"**
   - Verify your Supabase URL and anon key
   - Check if RLS policies are properly configured
   - Ensure the database schema is set up

### Getting Help

- Check AWS SES documentation
- Review Supabase documentation
- Check the browser console for error messages
- Verify all environment variables are set correctly

## Security Best Practices

1. **Never commit credentials to version control**
2. **Use environment variables for all sensitive data**
3. **Implement proper IAM policies with minimal permissions**
4. **Enable MFA on your AWS account**
5. **Regularly rotate access keys**
6. **Monitor AWS CloudTrail for suspicious activity**

## Features Overview

### Organization Dashboard
- Real-time email statistics
- System health monitoring
- Quick access to key metrics

### Domain Management
- Add multiple domains
- Automatic DNS record generation
- Real-time verification status
- Copy-paste DNS records

### User Management
- Role-based access control
- User status management
- Bulk operations support

### Mail Configuration
- AWS SES integration
- SMTP fallback support
- Security settings
- Email limits and policies

### Reporting
- Usage analytics
- Performance metrics
- Export capabilities
- Scheduled reports

This setup will give you a fully functional mail system with professional-grade features and security.