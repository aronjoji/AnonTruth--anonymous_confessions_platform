# Kill all existing Node processes to avoid port conflicts
Write-Host "Cleaning up old processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Start Backend
Write-Host "Launching Backend Oracle..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd backend; npm start" -WindowStyle Normal

# Wait for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Initializing Neural Interface..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "AnonTruth is coming online!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend: http://localhost:5000"
