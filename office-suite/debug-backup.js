const fs = require('fs');
const path = require('path');

// Simple debug script to analyze backup files
function analyzeBackupFile(filePath) {
  try {
    console.log(`Analyzing backup file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`File size: ${content.length} characters`);
    
    let data;
    try {
      data = JSON.parse(content);
      console.log('✅ Valid JSON file');
    } catch (e) {
      console.log('❌ Not a valid JSON file');
      console.log('First 200 characters:', content.substring(0, 200));
      return;
    }
    
    console.log('Data type:', Array.isArray(data) ? 'Array' : 'Object');
    
    if (Array.isArray(data)) {
      console.log(`Array length: ${data.length}`);
      if (data.length > 0) {
        console.log('First item keys:', Object.keys(data[0]));
        console.log('First item sample:', JSON.stringify(data[0], null, 2));
      }
    } else {
      console.log('Object keys:', Object.keys(data));
      
      if (data.emails && Array.isArray(data.emails)) {
        console.log(`Emails array length: ${data.emails.length}`);
        if (data.emails.length > 0) {
          console.log('First email keys:', Object.keys(data.emails[0]));
          console.log('First email sample:', JSON.stringify(data.emails[0], null, 2));
        }
      }
    }
    
  } catch (error) {
    console.error('Error analyzing file:', error);
  }
}

// Get file path from command line argument
const filePath = process.argv[2];
if (!filePath) {
  console.log('Usage: node debug-backup.js <path-to-backup-file>');
  console.log('Example: node debug-backup.js backup.json');
} else {
  analyzeBackupFile(filePath);
}
