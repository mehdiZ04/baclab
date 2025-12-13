# Database Setup Helper Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PostgreSQL Database Setup Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Current DATABASE_URL from .env:" -ForegroundColor Yellow
$envContent = Get-Content .env | Where-Object { $_ -match "^DATABASE_URL=" }
Write-Host $envContent -ForegroundColor White
Write-Host ""

Write-Host "Please ensure:" -ForegroundColor Yellow
Write-Host "1. PostgreSQL is installed and running" -ForegroundColor White
Write-Host "2. You can connect with the credentials in .env" -ForegroundColor White
Write-Host "3. The database 'zoom_dashboard' exists (or will be created)" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Do you want to continue with setup? (Y/N)"

if ($continue -ne "Y" -and $continue -ne "y") {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Attempting to create database if it doesn't exist..." -ForegroundColor Green

# Try to create the database using psql
$createDbCommand = @"
psql -U postgres -h localhost -p 5432 -tc "SELECT 1 FROM pg_database WHERE datname = 'zoom_dashboard'" | findstr /C:"1" > nul
if %errorlevel% neq 0 (
    psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE zoom_dashboard;"
    echo Database created successfully
) else (
    echo Database already exists
)
"@

Write-Host ""
Write-Host "If you don't have psql in your PATH, you can manually create the database:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1 - Using pgAdmin:" -ForegroundColor Cyan
Write-Host "  1. Open pgAdmin" -ForegroundColor White
Write-Host "  2. Right-click 'Databases' -> Create -> Database" -ForegroundColor White
Write-Host "  3. Name: zoom_dashboard" -ForegroundColor White
Write-Host "  4. Owner: postgres" -ForegroundColor White
Write-Host ""
Write-Host "Option 2 - Using SQL:" -ForegroundColor Cyan
Write-Host "  CREATE DATABASE zoom_dashboard;" -ForegroundColor White
Write-Host ""
Write-Host "Option 3 - Using psql command line:" -ForegroundColor Cyan
Write-Host "  psql -U postgres -c 'CREATE DATABASE zoom_dashboard;'" -ForegroundColor White
Write-Host ""

$dbCreated = Read-Host "Have you created the database? (Y/N)"

if ($dbCreated -ne "Y" -and $dbCreated -ne "y") {
    Write-Host "Please create the database first, then run this script again." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Running Prisma migrations..." -ForegroundColor Green
npx prisma migrate dev --name init

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Database setup complete." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step: Run the seed script to add sample data" -ForegroundColor Yellow
    Write-Host "  npm run prisma:seed" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Migration failed. Please check:" -ForegroundColor Red
    Write-Host "  - PostgreSQL is running" -ForegroundColor Yellow
    Write-Host "  - Database credentials are correct in .env" -ForegroundColor Yellow
    Write-Host "  - Database 'zoom_dashboard' exists" -ForegroundColor Yellow
    Write-Host ""
}
