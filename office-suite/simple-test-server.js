const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002; // Changed port

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Test Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test import route
app.post('/api/emails/import', (req, res) => {
  const { emails } = req.body;
  
  console.log(`Received ${emails ? emails.length : 0} emails for import`);
  
  if (!Array.isArray(emails)) {
    return res.status(400).json({ error: 'Expected array of emails' });
  }

  let imported = 0;
  let failed = 0;

  emails.forEach((email, index) => {
    try {
      // Simple validation
      if (email.subject && email.from && email.to) {
        imported++;
        console.log(`Email ${index + 1}: ${email.subject} - OK`);
      } else {
        failed++;
        console.log(`Email ${index + 1}: Missing required fields - FAILED`);
      }
    } catch (err) {
      failed++;
      console.log(`Email ${index + 1}: Error - ${err.message}`);
    }
  });

  const result = { 
    imported, 
    failed, 
    message: `Imported ${imported} emails, ${failed} failed` 
  };
  
  console.log('Import result:', result);
  res.json(result);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Test Server running on http://localhost:${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   POST /api/emails/import - Import emails`);
  console.log(`\n🛑 Press Ctrl+C to stop the server`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test server...');
  process.exit(0);
});