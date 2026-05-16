param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "Rodando migrations..." -ForegroundColor Cyan
npx drizzle-kit push
if ($LASTEXITCODE -ne 0) { Write-Host "Erro nas migrations." -ForegroundColor Red; exit 1 }

Write-Host "Commitando e fazendo push..." -ForegroundColor Cyan
git add -A
git commit -m $Message
git push origin master

Write-Host "Pronto!" -ForegroundColor Green
