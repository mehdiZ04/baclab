# Live Session Platform - Quick Setup Script
# Run this script to set up the database and seed initial data

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Live Session Platform - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your database configuration." -ForegroundColor Yellow
    Write-Host "See DATABASE_SETUP.md for details." -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Green
npm run prisma:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Running database migrations..." -ForegroundColor Green
$migrationName = "init"
Write-Host "Migration name: $migrationName" -ForegroundColor Yellow
npx prisma migrate dev --name $migrationName

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to run migrations" -ForegroundColor Red
    Write-Host "Please check your database connection in .env file" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 3: Seeding database with sample data..." -ForegroundColor Green
npm run prisma:seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to seed database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now login with these credentials:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Admin User:" -ForegroundColor Cyan
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Instructor User:" -ForegroundColor Cyan
Write-Host "  Email: instructor@example.com" -ForegroundColor White
Write-Host "  Password: instructor123" -ForegroundColor White
Write-Host ""
Write-Host "Start the development server with:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
