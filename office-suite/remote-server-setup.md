# Sebenza Suite Remote Server Setup

This guide will help you set up a local server on a different computer to store all your Sebenza Suite data.

## Prerequisites

- A computer running Windows, macOS, or Linux
- Node.js installed (version 16 or higher)
- Internet connection for initial setup

## Quick Setup (5 minutes)

### Step 1: Download and Install Node.js
1. Go to https://nodejs.org/
2. Download and install the LTS version
3. Verify installation by opening Command Prompt/Terminal and running:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Download Server Files
1. Create a folder called `sebenza-server` on your server computer
2. Copy the `local-server` folder contents to this directory
3. Or download the server files from the provided link

### Step 3: Install Dependencies
Open Command Prompt/Terminal in the server folder and run:
```bash
npm install
```

### Step 4: Start the Server
```bash
npm start
```

The server will start on port 3001 and create a local SQLite database.

## Configuration

### Server Computer Setup
1. **Find your computer's IP address:**
   - Windows: Run `ipconfig` in Command Prompt
   - macOS/Linux: Run `ifconfig` in Terminal
   - Look for your local IP (usually starts with 192.168.x.x or 10.x.x.x)

2. **Configure firewall:**
   - Allow incoming connections on port 3001
   - Windows: Windows Defender Firewall → Allow an app → Add Node.js
   - macOS: System Preferences → Security & Privacy → Firewall → Allow Node.js

### Client Computer Setup
1. **Update your .env.local file:**
   ```
   NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:3001/api
   NEXT_PUBLIC_SUPABASE_URL=http://YOUR_SERVER_IP:3001/api
   ```

2. **Replace YOUR_SERVER_IP with the actual IP address of your server computer**

## Features

✅ **Local Data Storage** - All data stored on your server computer
✅ **SQLite Database** - Lightweight, file-based database
✅ **REST API** - Complete API for all Sebenza Suite features
✅ **Email Import/Export** - Backup and restore functionality
✅ **User Management** - Multi-user support
✅ **File Storage** - Attachment and document storage
✅ **Real-time Updates** - Live data synchronization

## Security

- All data stays on your local network
- No external dependencies
- Encrypted connections (if configured)
- User authentication system
- Backup and restore capabilities

## Maintenance

### Starting the Server
```bash
cd sebenza-server
npm start
```

### Stopping the Server
Press `Ctrl+C` in the terminal

### Backing Up Data
The database file is located at `./data/sebenza-suite.db`
Copy this file to backup your data

### Updating the Server
Replace the server files and restart:
```bash
npm start
```

## Troubleshooting

### Server Won't Start
- Check if port 3001 is already in use
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version: `node --version`

### Can't Connect from Client
- Verify the server IP address
- Check firewall settings
- Ensure both computers are on the same network
- Test with: `curl http://YOUR_SERVER_IP:3001/api/health`

### Database Issues
- Delete `./data/sebenza-suite.db` to reset the database
- Restart the server to recreate tables

## Advanced Configuration

### Custom Port
Edit `server.js` and change:
```javascript
const PORT = process.env.PORT || 3001;
```

### HTTPS Setup
Add SSL certificates and configure HTTPS in the server

### Remote Access
Configure port forwarding on your router to access from outside your network

## Support

For issues or questions:
1. Check the server logs in the terminal
2. Verify network connectivity
3. Ensure all dependencies are installed
4. Check firewall and port settings
