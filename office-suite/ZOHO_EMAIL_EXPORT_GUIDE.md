# Zoho Email Export Guide

## Best Methods to Export Emails from Zoho

### Method 1: Zoho Mail Export Tool (Recommended)

1. **Access Zoho Mail Admin Console**
   - Go to https://mailadmin.zoho.com
   - Login with your admin credentials

2. **Navigate to Export Tool**
   - Go to "Mail Export" or "Data Export" section
   - Select the user account you want to export

3. **Choose Export Format**
   - **EML Format** (Recommended for our system)
   - **PST Format** (for Outlook compatibility)
   - **MBOX Format** (for Thunderbird compatibility)

4. **Select Date Range and Folders**
   - Choose the date range for emails
   - Select specific folders (Inbox, Sent, Drafts, etc.)
   - Choose to include attachments

5. **Download Export**
   - The export will be provided as a ZIP file
   - Download and extract the files

### Method 2: IMAP Migration (Built-in Tool)

1. **Go to Settings → Migration in our app**
2. **Configure Zoho IMAP Settings**
   - Hostname: `imap.zoho.com`
   - Port: `993`
   - SSL: Enabled
   - Username: Your full Zoho email address
   - Password: Use App Password (not your regular password)

3. **Create App Password**
   - Go to https://accounts.zoho.com
   - Security → App Passwords
   - Generate new app password for "Mail"
   - Use this password in the migration tool

4. **Start Migration**
   - Click "Start Migration"
   - The tool will fetch all emails from Zoho

### Method 3: Manual EML Export

1. **Access Zoho Mail Web Interface**
   - Login to https://mail.zoho.com
   - Go to Settings → Mail → Forwarding and POP/IMAP

2. **Enable IMAP Access**
   - Enable IMAP access
   - Note down the IMAP settings

3. **Use Email Client**
   - Configure Thunderbird, Outlook, or Apple Mail
   - Connect using IMAP settings
   - Export emails as EML files

### Method 4: Zoho API (Advanced)

1. **Get API Access**
   - Register at https://api-console.zoho.com
   - Create a new application
   - Get client ID and secret

2. **Use Zoho Mail API**
   - Use the Mail API to fetch emails
   - Convert to EML format
   - Import into our system

## Recommended Approach

**For most users, I recommend Method 2 (IMAP Migration)** because:

✅ **Easiest to use** - Built into our app
✅ **No manual work** - Automatic import
✅ **Preserves formatting** - HTML emails display correctly
✅ **Handles all folders** - Inbox, Sent, Drafts, etc.
✅ **Supports large volumes** - Can handle thousands of emails
✅ **Real-time** - Get latest emails

## Troubleshooting

### If emails show as code:
1. **Clear existing emails** - Go to Settings → Migration → Clear All Data
2. **Re-import using IMAP** - Use the built-in migration tool
3. **Check HTML detection** - Our system now better detects HTML content

### If IMAP connection fails:
1. **Use App Password** - Not your regular Zoho password
2. **Enable 2FA** - Required for app passwords
3. **Check IMAP settings** - Ensure IMAP is enabled in Zoho

### If export is incomplete:
1. **Check date range** - Make sure it covers all emails
2. **Verify folder selection** - Include all needed folders
3. **Try smaller batches** - Export in smaller date ranges

## Step-by-Step Instructions

### Quick Start (5 minutes):

1. **Open our app** → Go to Settings → Migration
2. **Click "Zoho Defaults"** → This fills in the correct settings
3. **Enter your email** → Your full Zoho email address
4. **Get App Password** → Go to Zoho accounts and create app password
5. **Enter App Password** → Use the generated app password
6. **Click "Start Migration"** → Wait for emails to import
7. **Check Mail** → Your emails should now display properly

### For Large Email Volumes:

1. **Use date ranges** → Export 6 months at a time
2. **Select specific folders** → Start with Inbox only
3. **Monitor progress** → Watch the import status
4. **Repeat for other folders** → Sent, Drafts, etc.

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify your Zoho IMAP settings
3. Try the "Test Connection" button first
4. Contact support with specific error details

The IMAP migration method is the most reliable and will ensure your emails display correctly with proper HTML formatting.
