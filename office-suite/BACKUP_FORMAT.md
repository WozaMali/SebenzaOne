# Backup File Format Documentation

This document describes the supported backup file formats for the Sebenza Suite Mail Settings migration feature.

## JSON Backup Format

The JSON backup format is the recommended format for complete system backups. It includes all settings, domains, users, and reports in a single file.

### Structure

```json
{
  "mailSettings": {
    "smtpHost": "email-smtp.us-east-1.amazonaws.com",
    "smtpPort": "587",
    "fromEmail": "noreply@yourdomain.com",
    "fromName": "Your Company",
    "sslEnabled": true,
    "spamProtection": true,
    "virusScanning": true,
    "twoFactorEnabled": false,
    "maxAttachmentSize": 25,
    "maxRecipients": 100,
    "retentionDays": 365,
    "awsRegion": "us-east-1",
    "awsAccessKeyId": "AKIA...",
    "awsSecretAccessKey": "your_secret_key",
    "supabaseUrl": "https://your-project.supabase.co",
    "supabaseAnonKey": "your_anon_key"
  },
  "domains": [
    {
      "id": "domain-1",
      "name": "yourdomain.com",
      "status": "verified",
      "users": 5,
      "mxTarget": "mail.yourdomain.com",
      "spfValue": "v=spf1 include:amazonses.com -all",
      "dkimSelectors": ["ses1", "ses2", "ses3"],
      "dmarcValue": "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com; fo=1",
      "verification": {
        "mx": true,
        "spf": true,
        "dkim": [true, true, true],
        "dmarc": true,
        "lastChecked": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "users": [
    {
      "id": "user-1",
      "name": "John Doe",
      "email": "john@yourdomain.com",
      "role": "Admin",
      "status": "Active"
    },
    {
      "id": "user-2",
      "name": "Jane Smith",
      "email": "jane@yourdomain.com",
      "role": "User",
      "status": "Active"
    }
  ],
  "reports": [
    {
      "id": "report-1",
      "name": "Monthly Email Report",
      "date": "2024-01-15",
      "type": "PDF",
      "size": "2.3 MB",
      "data": {
        "generatedAt": "2024-01-15T10:30:00Z",
        "reportType": "monthly",
        "domainCount": 1,
        "userCount": 2,
        "verifiedDomains": 1
      }
    }
  ],
  "exportedAt": "2024-01-15T10:30:00Z",
  "version": "1.0"
}
```

## CSV Format

CSV format is supported for importing individual data types (users, domains, etc.).

### Users CSV Format

```csv
id,name,email,role,status
user-1,John Doe,john@yourdomain.com,Admin,Active
user-2,Jane Smith,jane@yourdomain.com,User,Active
user-3,Bob Johnson,bob@yourdomain.com,Moderator,Inactive
```

### Domains CSV Format

```csv
id,name,status,users,mxTarget,spfValue,dkimSelectors,dmarcValue
domain-1,yourdomain.com,verified,5,mail.yourdomain.com,"v=spf1 include:amazonses.com -all","ses1,ses2,ses3","v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com; fo=1"
domain-2,subdomain.yourdomain.com,pending,2,mail.subdomain.yourdomain.com,"v=spf1 include:amazonses.com -all","ses1,ses2,ses3","v=DMARC1; p=none; rua=mailto:dmarc@subdomain.yourdomain.com; ruf=mailto:dmarc@subdomain.yourdomain.com; fo=1"
```

## Import Process

### 1. Select Backup Type

When uploading a backup file, select the appropriate type:
- **Settings**: Complete system configuration
- **Users**: User accounts and permissions
- **Domains**: Domain configurations and DNS records
- **Emails**: Email data and messages

### 2. File Upload

1. Click "Upload Backup" in the Migration tab
2. Select the backup type from the dropdown
3. Choose your backup file (JSON or CSV)
4. The system will automatically process and import the data

### 3. Validation

The system validates:
- File format (JSON/CSV)
- Required fields for each data type
- Data integrity and consistency
- Duplicate prevention

## Export Process

### 1. Complete Backup

To export all settings:
1. Go to Migration tab
2. Click "Export Settings"
3. A JSON file will be downloaded with all current settings

### 2. Individual Data Export

For specific data types, you can export:
- Users list as CSV
- Domains configuration as CSV
- Reports as individual files

## Best Practices

### Backup Frequency
- Export settings before major changes
- Create backups after adding new domains or users
- Regular weekly/monthly backups for production systems

### File Naming
- Use descriptive names: `sebenza-backup-2024-01-15.json`
- Include date in filename for easy identification
- Keep multiple backup versions

### Security
- Store backup files securely
- Remove sensitive data (AWS keys) before sharing
- Use encryption for sensitive backups

### Testing
- Test backup restoration in a development environment
- Verify all settings are correctly imported
- Check DNS records and user permissions

## Troubleshooting

### Common Issues

1. **"Invalid file format"**
   - Ensure file is valid JSON or CSV
   - Check file extension matches content

2. **"Missing required fields"**
   - Verify all required fields are present
   - Check field names match exactly

3. **"Import failed"**
   - Check file size (max 10MB)
   - Verify data format and structure
   - Check for special characters in data

### File Size Limits
- Maximum file size: 10MB
- Recommended: Keep backups under 5MB
- Split large datasets into multiple files

### Supported Characters
- UTF-8 encoding required
- Special characters in CSV must be properly escaped
- JSON supports all Unicode characters

## Migration from Other Systems

### From Gmail/Google Workspace
1. Export contacts as CSV
2. Export email settings manually
3. Create domains configuration
4. Import using the backup feature

### From Outlook/Exchange
1. Export user list as CSV
2. Configure SMTP settings
3. Set up domain verification
4. Import configuration

### From Other Email Systems
1. Export data in supported formats
2. Map fields to Sebenza format
3. Create backup file
4. Import using migration tool

This backup system ensures you can easily migrate your email configuration and data to the Sebenza Suite Mail system.
