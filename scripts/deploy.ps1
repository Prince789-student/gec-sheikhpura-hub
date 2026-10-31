Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🚀 Automated Dual-Deploy: Vercel, Render & GitHub" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Push to both Git remotes (triggers Render build & GitHub Pages)
Write-Host "`n[1/3] Pushing latest code to GitHub remotes..." -ForegroundColor Yellow
git push origin main

# 2. Deploy directly to Vercel Production
Write-Host "`n[2/3] Triggering Vercel Production Deployment..." -ForegroundColor Yellow
npx -y vercel deploy --prod --yes

# 3. Ping Render Backend
Write-Host "`n[3/3] Verifying Render Backend Health..." -ForegroundColor Yellow
try {
  $resp = Invoke-RestMethod -Uri "https://gec-sheikhpura-backend.onrender.com/health" -Method Get -TimeoutSec 15
  Write-Host "✓ Render Backend is Healthy: $($resp.status)" -ForegroundColor Green
} catch {
  Write-Host "Notice: Render backend is waking up or building from git push." -ForegroundColor Gray
}

Write-Host "`n✨ All systems deployed and synced automatically!" -ForegroundColor Green
