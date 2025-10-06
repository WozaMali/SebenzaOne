const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./data/sebenza-suite.db');

// Initialize database tables
const initDatabase = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Emails table
  db.run(`
    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      from_name TEXT NOT NULL,
      from_email TEXT NOT NULL,
      to_emails TEXT NOT NULL,
      cc_emails TEXT,
      bcc_emails TEXT,
      body TEXT NOT NULL,
      is_html BOOLEAN DEFAULT 0,
      date DATETIME NOT NULL,
      folder TEXT DEFAULT 'inbox',
      is_read BOOLEAN DEFAULT 0,
      is_starred BOOLEAN DEFAULT 0,
      is_important BOOLEAN DEFAULT 0,
      is_pinned BOOLEAN DEFAULT 0,
      is_draft BOOLEAN DEFAULT 0,
      is_sent BOOLEAN DEFAULT 0,
      is_deleted BOOLEAN DEFAULT 0,
      is_spam BOOLEAN DEFAULT 0,
      has_attachments BOOLEAN DEFAULT 0,
      labels TEXT,
      priority TEXT DEFAULT 'normal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Folders table
  db.run(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      path TEXT NOT NULL,
      unread_count INTEGER DEFAULT 0,
      total_count INTEGER DEFAULT 0,
      is_system BOOLEAN DEFAULT 1,
      color TEXT,
      sync_enabled BOOLEAN DEFAULT 1,
      permissions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Mail settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS mail_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      smtp_host TEXT,
      smtp_port INTEGER,
      smtp_user TEXT,
      smtp_pass TEXT,
      from_email TEXT,
      from_name TEXT,
      aws_access_key TEXT,
      aws_secret_key TEXT,
      aws_region TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Domains table
  db.run(`
    CREATE TABLE IF NOT EXISTS domains (
      id TEXT PRIMARY KEY,
      domain TEXT UNIQUE NOT NULL,
      is_verified BOOLEAN DEFAULT 0,
      mx_record TEXT,
      spf_record TEXT,
      dkim_record TEXT,
      dmarc_record TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Reports table
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Initialize default folders
  const defaultFolders = [
    { id: 'inbox', name: 'Inbox', type: 'inbox', path: '/inbox', is_system: 1 },
    { id: 'sent', name: 'Sent', type: 'sent', path: '/sent', is_system: 1 },
    { id: 'drafts', name: 'Drafts', type: 'drafts', path: '/drafts', is_system: 1 },
    { id: 'starred', name: 'Starred', type: 'starred', path: '/starred', is_system: 1 },
    { id: 'archive', name: 'Archive', type: 'archive', path: '/archive', is_system: 1 },
    { id: 'spam', name: 'Spam', type: 'spam', path: '/spam', is_system: 1 },
    { id: 'trash', name: 'Trash', type: 'trash', path: '/trash', is_system: 1 }
  ];

  defaultFolders.forEach(folder => {
    db.run(`
      INSERT OR IGNORE INTO folders (id, name, type, path, is_system)
      VALUES (?, ?, ?, ?, ?)
    `, [folder.id, folder.name, folder.type, folder.path, folder.is_system]);
  });
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sebenza Suite Local Server is running' });
});

// Get all emails
app.get('/api/emails', (req, res) => {
  const { folder, search, limit = 50, offset = 0 } = req.query;
  
  let query = 'SELECT * FROM emails WHERE 1=1';
  let params = [];

  if (folder) {
    query += ' AND folder = ?';
    params.push(folder);
  }

  if (search) {
    query += ' AND (subject LIKE ? OR from_name LIKE ? OR from_email LIKE ? OR body LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single email
app.get('/api/emails/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM emails WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }
    res.json(row);
  });
});

// Create email
app.post('/api/emails', (req, res) => {
  const {
    subject, from_name, from_email, to_emails, cc_emails, bcc_emails,
    body, is_html, folder, is_draft, labels, priority
  } = req.body;

  const id = uuidv4();
  const date = new Date().toISOString();

  db.run(`
    INSERT INTO emails (
      id, subject, from_name, from_email, to_emails, cc_emails, bcc_emails,
      body, is_html, date, folder, is_draft, labels, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, subject, from_name, from_email, JSON.stringify(to_emails),
    JSON.stringify(cc_emails), JSON.stringify(bcc_emails), body, is_html ? 1 : 0,
    date, folder || 'inbox', is_draft ? 1 : 0, JSON.stringify(labels || []), priority || 'normal'
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, message: 'Email created successfully' });
  });
});

// Update email
app.put('/api/emails/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  values.push(id);

  db.run(`UPDATE emails SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Email updated successfully' });
  });
});

// Delete email
app.delete('/api/emails/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM emails WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Email deleted successfully' });
  });
});

// Get folders
app.get('/api/folders', (req, res) => {
  db.all('SELECT * FROM folders ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get mail settings
app.get('/api/mail/settings', (req, res) => {
  db.get('SELECT * FROM mail_settings ORDER BY created_at DESC LIMIT 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || {});
  });
});

// Save mail settings
app.post('/api/mail/settings', (req, res) => {
  const settings = req.body;
  
  db.run(`
    INSERT OR REPLACE INTO mail_settings (
      smtp_host, smtp_port, smtp_user, smtp_pass, from_email, from_name,
      aws_access_key, aws_secret_key, aws_region
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    settings.smtp_host, settings.smtp_port, settings.smtp_user, settings.smtp_pass,
    settings.from_email, settings.from_name, settings.aws_access_key,
    settings.aws_secret_key, settings.aws_region
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Settings saved successfully' });
  });
});

// Import emails from backup
app.post('/api/emails/import', (req, res) => {
  const { emails } = req.body;
  
  if (!Array.isArray(emails)) {
    res.status(400).json({ error: 'Expected array of emails' });
    return;
  }

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO emails (
      id, subject, from_name, from_email, to_emails, cc_emails, bcc_emails,
      body, is_html, date, folder, is_read, is_starred, is_important, is_pinned,
      is_draft, is_sent, is_deleted, is_spam, has_attachments, labels, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let imported = 0;
  let failed = 0;

  emails.forEach(email => {
    try {
      stmt.run([
        email.id || uuidv4(),
        email.subject || '',
        email.from?.name || email.from_name || '',
        email.from?.email || email.from_email || '',
        JSON.stringify(email.to || []),
        JSON.stringify(email.cc || []),
        JSON.stringify(email.bcc || []),
        email.body || '',
        email.isHtml ? 1 : 0,
        email.date || new Date().toISOString(),
        email.folder || 'inbox',
        email.isRead ? 1 : 0,
        email.isStarred ? 1 : 0,
        email.isImportant ? 1 : 0,
        email.isPinned ? 1 : 0,
        email.isDraft ? 1 : 0,
        email.isSent ? 1 : 0,
        email.isDeleted ? 1 : 0,
        email.isSpam ? 1 : 0,
        email.hasAttachments ? 1 : 0,
        JSON.stringify(email.labels || []),
        email.priority || 'normal'
      ]);
      imported++;
    } catch (err) {
      console.error('Failed to import email:', err);
      failed++;
    }
  });

  stmt.finalize();
  res.json({ imported, failed, message: `Imported ${imported} emails, ${failed} failed` });
});

// Create data directory
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data');
}

// Initialize database
initDatabase();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sebenza Suite Local Server running on port ${PORT}`);
  console.log(`📊 Database: ./data/sebenza-suite.db`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`💾 Data stored locally in ./data directory`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});
