# Email Testing Guide

This guide explains how to use the comprehensive email testing system for your Sebenza Suite platform.

## Overview

The email testing system provides live validation of:
- **DNS Records**: MX, SPF, DKIM, DMARC
- **Email Delivery**: Send test emails and verify delivery
- **Bounce Handling**: Check for bounced emails
- **Spam Scoring**: Assess email deliverability

## Quick Start

### 1. Access the Test Dashboard

Navigate to `/email-test` in your application to access the Email Test Dashboard.

### 2. Test DNS Records

1. Click on the "DNS Records" tab
2. Click "Test DNS Records" to validate:
   - **MX Record**: Points to your mail server
   - **SPF Record**: Authorizes Amazon SES to send emails
   - **DKIM Records**: Digital signatures for email authentication
   - **DMARC Record**: Policy for handling authentication failures

### 3. Test Email Delivery

1. Click on the "Email Delivery" tab
2. Enter a test email address
3. Click "Send Test Email" to verify:
   - Email sending functionality
   - Delivery status
   - Bounce status
   - Spam score

### 4. Run Full Test Suite

1. Click on the "Full Test Suite" tab
2. Enter a test email address
3. Click "Run Full Test Suite" for comprehensive testing

## DNS Record Requirements

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

### DKIM Records (3 required)
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

## API Endpoints

### DNS Validation
- `GET /api/dns/mx?domain=yourdomain.com` - Check MX records
- `GET /api/dns/spf?domain=yourdomain.com` - Check SPF record
- `GET /api/dns/dkim?domain=yourdomain.com` - Check DKIM records
- `GET /api/dns/dmarc?domain=yourdomain.com` - Check DMARC record

### Email Testing
- `POST /api/email/test-delivery` - Run email tests
- `GET /api/email/delivery-status?messageId=xxx` - Check delivery status
- `GET /api/email/bounce-check?email=test@example.com` - Check bounce status

## Environment Variables

Ensure these environment variables are set:

```env
# AWS SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Email Configuration
MAIL_FROM_EMAIL=noreply@yourdomain.com
MAIL_FROM_NAME=Your App Name
```

## Troubleshooting

### Common Issues

1. **"No MX record found"**
   - Add MX record pointing to your mail server
   - Wait for DNS propagation (up to 48 hours)

2. **"SPF record needs to include amazonses.com"**
   - Add SPF record: `v=spf1 include:amazonses.com -all`
   - Ensure no duplicate SPF records

3. **"Only X/3 DKIM records found"**
   - Add all 3 DKIM CNAME records from AWS SES
   - Verify domain is verified in AWS SES

4. **"Failed to send test email"**
   - Check AWS SES credentials
   - Verify domain is verified in AWS SES
   - Check if SES is in sandbox mode

5. **"No DMARC record found"**
   - Add DMARC record with policy and reporting
   - Start with `p=none` for monitoring

### AWS SES Setup

1. **Verify Domain in AWS SES**
   - Go to AWS Console > SES > Verified identities
   - Add your domain
   - Add required DNS records

2. **Request Production Access**
   - By default, SES is in sandbox mode
   - Request production access to send to any email address

3. **Configure SNS Notifications** (Optional)
   - Set up bounce and complaint notifications
   - This enables real-time delivery tracking

## Test Results Interpretation

### DNS Validation
- ✅ **PASS**: Record is properly configured
- ❌ **FAIL**: Record is missing or misconfigured

### Email Delivery
- ✅ **PASS**: Email sent successfully
- ❌ **FAIL**: Email sending failed (check AWS SES)

### Overall Status
- **All Tests Passed**: Your email configuration is working correctly
- **Some Tests Failed**: Review recommendations and fix issues

## Best Practices

1. **Test Regularly**: Run tests after any DNS or configuration changes
2. **Use Real Email Addresses**: Test with actual email addresses you can access
3. **Monitor Bounces**: Set up bounce handling to maintain sender reputation
4. **Gradual DMARC Policy**: Start with `p=none`, then `p=quarantine`, finally `p=reject`
5. **Keep Records Updated**: Ensure DNS records match your current email provider

## Advanced Features

### Automated Testing
- Use the EmailTestRunner component for automated testing
- Integrate with CI/CD pipelines
- Set up monitoring and alerts

### Custom Test Scenarios
- Modify the EmailTestingService for specific test cases
- Add custom validation rules
- Integrate with third-party services

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your DNS records using external tools
3. Check AWS SES console for detailed error messages
4. Review the application logs for specific error details

## Security Notes

- Never expose AWS credentials in client-side code
- Use environment variables for sensitive configuration
- Regularly rotate AWS access keys
- Monitor AWS SES usage and costs
