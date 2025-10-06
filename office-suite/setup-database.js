#!/usr/bin/env node

/**
 * Database Setup Script for Sebenza Suite
 * 
 * This script helps set up the database schema in Supabase.
 * Run this after setting up your Supabase project.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Sebenza Suite Database Setup');
console.log('================================\n');

console.log('📋 Setup Instructions:');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the contents of admin-schema-fixed.sql');
console.log('4. Execute the SQL script');
console.log('5. Verify tables are created successfully\n');

console.log('📁 Schema files available:');
console.log('- admin-schema-fixed.sql (Main admin schema)');
console.log('- crm-schema.sql (CRM schema)');
console.log('- email-schema.sql (Email schema - full version)');
console.log('- email-schema-simple.sql (Email schema - simplified version)');
console.log('- email-schema-basic.sql (Email schema - basic version, NO foreign keys)');
console.log('- email-schema-minimal.sql (Email schema - minimal version, DROPS existing tables)');
console.log('- pwa-integration-schema.sql (PWA schema)\n');

console.log('🔧 Environment Setup:');
console.log('Make sure your .env.local file contains:');
console.log('- NEXT_PUBLIC_SUPABASE_URL');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY\n');

console.log('✅ After setup, visit: http://localhost:3001/test-database');
console.log('   to verify the database connection and schema.\n');

console.log('📖 For detailed instructions, see:');
console.log('- DATABASE_SETUP.md');
console.log('- REAL_DATA_SETUP.md\n');

// Check if schema files exist
const schemaFiles = [
  'admin-schema-fixed.sql',
  'crm-schema.sql',
  'email-schema.sql',
  'email-schema-simple.sql',
  'email-schema-basic.sql',
  'email-schema-minimal.sql',
  'pwa-integration-schema.sql'
];

console.log('🔍 Checking schema files...');
schemaFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`❌ ${file} (missing)`);
  }
});

console.log('\n🎯 Next Steps:');
console.log('1. Run the database schema setup');
console.log('2. Test the connection at /test-database');
console.log('3. Start migrating mock data to real data');
console.log('4. Update components to use real APIs\n');

console.log('💡 Tip: The application will work with mock data until the database is set up.');
console.log('   This allows you to develop and test without a database connection.');
