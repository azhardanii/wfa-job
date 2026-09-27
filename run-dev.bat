@echo off
cd /d "%~dp0"
title WFA JOB Dev Server
echo ===================================================
echo   Starting WFA JOB Platform (Info Loker & Escrow)
echo   Target URL: http://localhost:3000
echo ===================================================
set PATH=%~dp0bin;%PATH%
"%~dp0bin\node.exe" "./node_modules/next/dist/bin/next" dev -p 3000
pause
