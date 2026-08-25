#Requires -Version 5.1
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "DongHak local setup" -ForegroundColor Green

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host "Node.js 18+ 가 필요합니다. https://nodejs.org 에서 LTS를 설치하세요." -ForegroundColor Red
  exit 1
}

$version = node -v
Write-Host "node $version"

npm install

if (-not (Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host ".env.local 을 만들었습니다. LLM_API_KEY 를 넣은 뒤 npm run dev 하세요." -ForegroundColor Yellow
} else {
  Write-Host ".env.local 이미 있음"
}

Write-Host "실행: npm run dev  ->  http://localhost:3000" -ForegroundColor Green
