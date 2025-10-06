# Sebenza Suite Remote Server Setup
# Run this script on the computer that will store your data

Write-Host "🚀 Setting up Sebenza Suite Remote Server..." -ForegroundColor Green

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Download the LTS version and restart this script after installation." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Node.js is installed: $(node --version)" -ForegroundColor Green

# Create server directory
$serverDir = "sebenza-server"
if (!(Test-Path $serverDir)) {
    Write-Host "📁 Creating server directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $serverDir
}

# Copy server files
Write-Host "📋 Copying server files..." -ForegroundColor Yellow
Copy-Item "local-server\*" -Destination $serverDir -Recurse -Force

# Navigate to server directory
Set-Location $serverDir

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create data directory
if (!(Test-Path "data")) {
    New-Item -ItemType Directory -Path "data"
}

# Get local IP address
Write-Host "🔍 Finding your computer's IP address..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.16.*" } | Select-Object -First 1).IPAddress

if (!$ipAddress) {
    $ipAddress = "localhost"
    Write-Host "⚠️  Could not determine IP address, using localhost" -ForegroundColor Yellow
}

Write-Host "✅ Your server IP address: $ipAddress" -ForegroundColor Green

# Create client configuration file
Write-Host "📝 Creating client configuration..." -ForegroundColor Yellow
$clientConfig = @"
# Remote Server Configuration
NEXT_PUBLIC_API_URL=http://$ipAddress:3001/api
NEXT_PUBLIC_SUPABASE_URL=http://$ipAddress:3001/api
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-server-key

# Email Configuration
NEXT_PUBLIC_SMTP_HOST=$ipAddress
NEXT_PUBLIC_SMTP_PORT=587
NEXT_PUBLIC_SMTP_USER=your-email@example.com
NEXT_PUBLIC_SMTP_PASS=your-email-password
NEXT_PUBLIC_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_FROM_NAME=Sebenza Suite

# Storage Configuration
NEXT_PUBLIC_STORAGE_URL=http://$ipAddress:3001/api/storage
NEXT_PUBLIC_STORAGE_BUCKET=sebenza-suite

# Security
JWT_SECRET=your-local-jwt-secret
ENCRYPTION_KEY=your-32-character-encryption-key
"@

$clientConfig | Out-File -FilePath "client-config.env" -Encoding UTF8

Write-Host "✅ Server setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy the 'client-config.env' file to your main computer" -ForegroundColor White
Write-Host "2. Rename it to '.env.local' in your office-suite folder" -ForegroundColor White
Write-Host "3. Update the email settings in the .env.local file" -ForegroundColor White
Write-Host "4. Start the server by running: npm start" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Server will be available at: http://$ipAddress:3001" -ForegroundColor Cyan
Write-Host "📊 Database will be stored in: .\data\sebenza-suite.db" -ForegroundColor Cyan
Write-Host ""
Write-Host "🛑 To stop the server: Press Ctrl+C" -ForegroundColor Yellow
Write-Host "🔄 To restart: npm start" -ForegroundColor Yellow
Write-Host ""

$start = Read-Host "Start the server now? (y/n)"
if ($start -eq "y" -or $start -eq "Y") {
    Write-Host "🚀 Starting server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm start
} else {
    Write-Host "To start the server later, run: npm start" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
}
