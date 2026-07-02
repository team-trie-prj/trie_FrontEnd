#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "지능형 정보 시스템 · 융합 데모"
python3 -m pip install -r requirements.txt -q 2>/dev/null || true
python3 app.py
