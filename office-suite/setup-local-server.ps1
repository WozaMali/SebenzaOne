# Sebenza Suite Local Server Setup Script
# Run this script to set up your local data storage server

Write-Host "🚀 Setting up Sebenza Suite Local Server..." -ForegroundColor Green

# Check if Docker is installed
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not available. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

# Create data directories
Write-Host "📁 Creating data directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path ".\data\postgres"
New-Item -ItemType Directory -Force -Path ".\data\redis"
New-Item -ItemType Directory -Force -Path ".\data\storage"

# Generate secure keys
Write-Host "🔐 Generating secure keys..." -ForegroundColor Yellow
$anonKey = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString())))
$serviceKey = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString())))
$jwtSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString())))
$encryptionKey = -join ((1..32) | ForEach {[char]((65..90) + (97..122) | Get-Random)})

# Create .env.local file
Write-Host "📝 Creating environment configuration..." -ForegroundColor Yellow
$envContent = @"
# Local Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:9999
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceKey

# Database Configuration
DATABASE_URL=postgres://postgres:your-super-secret-password@localhost:5432/sebenza_suite

# Email Configuration (Local SMTP)
NEXT_PUBLIC_SMTP_HOST=localhost
NEXT_PUBLIC_SMTP_PORT=587
NEXT_PUBLIC_SMTP_USER=your-email@example.com
NEXT_PUBLIC_SMTP_PASS=your-email-password
NEXT_PUBLIC_FROM_EMAIL=noreply@sebenza-suite.local
NEXT_PUBLIC_FROM_NAME=Sebenza Suite

# AWS SES (Optional - for external email sending)
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_aws_access_key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_aws_secret_key
NEXT_PUBLIC_AWS_REGION=us-east-1

# Local Storage
NEXT_PUBLIC_STORAGE_URL=http://localhost:5000
NEXT_PUBLIC_STORAGE_BUCKET=sebenza-suite

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=$jwtSecret
ENCRYPTION_KEY=$encryptionKey
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

# Start the local server
Write-Host "🐳 Starting local server containers..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check if services are running
Write-Host "🔍 Checking service status..." -ForegroundColor Yellow
docker-compose ps

Write-Host "✅ Local server setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access your local services:" -ForegroundColor Cyan
Write-Host "   • Database Admin: http://localhost:8080" -ForegroundColor White
Write-Host "   • API Endpoint: http://localhost:9999" -ForegroundColor White
Write-Host "   • Storage API: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update your .env.local file with your email settings" -ForegroundColor White
Write-Host "   2. Run 'npm run dev' to start the application" -ForegroundColor White
Write-Host "   3. Your data will be stored locally in the ./data directory" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop the server: docker-compose down" -ForegroundColor Yellow
Write-Host "🔄 To restart: docker-compose restart" -ForegroundColor Yellow
