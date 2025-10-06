# Sebenza Suite Remote Server

This setup allows you to run a local server on a different computer to store all your Sebenza Suite data.

## Quick Start (5 minutes)

### On the Server Computer (where data will be stored):

1. **Download and install Node.js** from https://nodejs.org/
2. **Run the setup script:**
   ```powershell
   .\setup-remote-server.ps1
   ```
3. **The script will:**
   - Install all dependencies
   - Create the database
   - Find your computer's IP address
   - Generate a configuration file for your client

### On the Client Computer (where you use Sebenza Suite):

1. **Copy the generated `client-config.env` file** from the server computer
2. **Rename it to `.env.local`** in your `office-suite` folder
3. **Update the email settings** in the `.env.local` file
4. **Start your Sebenza Suite application**

## Manual Setup

If you prefer to set up manually:

### Server Computer:
```bash
# 1. Create server directory
mkdir sebenza-server
cd sebenza-server

# 2. Copy the local-server folder contents here

# 3. Install dependencies
npm install

# 4. Start the server
npm start
```

### Client Computer:
```bash
# 1. Create .env.local file with:
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:3001/api
NEXT_PUBLIC_SUPABASE_URL=http://YOUR_SERVER_IP:3001/api

# 2. Start your application
npm run dev
```

## Features

✅ **Local Data Storage** - All data stays on your server computer
✅ **SQLite Database** - Lightweight, file-based database
✅ **REST API** - Complete API for all features
✅ **Email Management** - Full email CRUD operations
✅ **Backup & Restore** - Import/export functionality
✅ **Multi-User Support** - Multiple users can connect
✅ **Real-time Updates** - Live data synchronization

## Security

- All data stored locally on your network
- No external dependencies
- User authentication system
- Encrypted data storage
- Backup and restore capabilities

## Troubleshooting

### Server won't start:
- Check if Node.js is installed: `node --version`
- Check if port 3001 is available
- Run `npm install` to install dependencies

### Can't connect from client:
- Verify the server IP address
- Check firewall settings
- Ensure both computers are on the same network
- Test with: `curl http://YOUR_SERVER_IP:3001/api/health`

### Database issues:
- Database file: `./data/sebenza-suite.db`
- Delete the file to reset the database
- Restart the server to recreate tables

## File Structure

```
sebenza-server/
├── server.js              # Main server file
├── package.json           # Dependencies
├── data/
│   └── sebenza-suite.db   # SQLite database
├── start-server.bat       # Windows startup script
└── start-server.sh        # macOS/Linux startup script
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/emails` - Get emails
- `POST /api/emails` - Create email
- `PUT /api/emails/:id` - Update email
- `DELETE /api/emails/:id` - Delete email
- `GET /api/folders` - Get folders
- `POST /api/emails/import` - Import emails
- `GET /api/mail/settings` - Get mail settings
- `POST /api/mail/settings` - Save mail settings

## Maintenance

### Starting the server:
```bash
cd sebenza-server
npm start
```

### Stopping the server:
Press `Ctrl+C` in the terminal

### Backing up data:
Copy the `./data/sebenza-suite.db` file

### Updating the server:
Replace the server files and restart

## Support

For issues:
1. Check server logs in the terminal
2. Verify network connectivity
3. Ensure all dependencies are installed
4. Check firewall and port settings

## Advanced Configuration

### Custom Port:
Edit `server.js` and change the PORT variable

### HTTPS Setup:
Add SSL certificates and configure HTTPS

### Remote Access:
Configure port forwarding on your router
