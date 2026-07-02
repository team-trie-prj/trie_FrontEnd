@echo off
chcp 65001 >nul
cd /d %~dp0
echo ============================================================
echo  지능형 정보 시스템 · 융합 데모 (VLM x 하이브리드 RAG x 에이전트)
echo ============================================================
where python >nul 2>nul || ( echo [오류] Python 3.10+ 가 필요합니다. && pause && exit /b 1 )
echo [1/2] 의존성 설치 (최초 1회)...
python -m pip install -r requirements.txt -q
echo [2/2] 서버 시작 -- 브라우저에서 http://localhost:8000 접속
python app.py
pause
