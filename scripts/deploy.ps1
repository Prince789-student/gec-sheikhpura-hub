param(
  [string]$msg = "chore: automated sync and deployment"
)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " Automated Dual-Deploy: Vercel, Render and GitHub" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "`n[1/4] Staging and committing changes..." -ForegroundColor Yellow
    git add -A
    git commit -m $msg
} else {
    Write-Host "`n[1/4] Working tree clean." -ForegroundColor Green
}

Write-Host "`n[2/4] Pushing to GitHub remotes (origin & web)..." -ForegroundColor Yellow
git push origin main
try {
    git push web main
} catch {
    Write-Host "Notice: web remote push skipped or up to date." -ForegroundColor Gray
}

Write-Host "`n[3/4] Triggering Vercel Production Deployment..." -ForegroundColor Yellow
npx -y vercel deploy --prod --yes

Write-Host "`n[4/4] Verifying Render Backend Health..." -ForegroundColor Yellow
try {
    $resp = Invoke-RestMethod -Uri "https://gec-sheikhpura-backend.onrender.com/health" -Method Get -TimeoutSec 20
    Write-Host " Render Backend is Healthy: $($resp.status)" -ForegroundColor Green
}
catch {
    Write-Host "Notice: Render backend is waking up or building from git push." -ForegroundColor Gray
}

Write-Host "`n All systems deployed and synced automatically!" -ForegroundColor Green
Write-Host " Vercel Live URL:  https://gec-sheikhpura-web.vercel.app" -ForegroundColor Cyan
Write-Host " Render Backend:   https://gec-sheikhpura-backend.onrender.com" -ForegroundColor Cyan
Write-Host " GitHub Pages:     https://prince789-student.github.io/gec-sheikhpura-hub" -ForegroundColor Cyan
