Set-Location $PSScriptRoot
Write-Host "지능형 정보 시스템 · 융합 데모 시작" -ForegroundColor Cyan
python -m pip install -r requirements.txt -q
python app.py
