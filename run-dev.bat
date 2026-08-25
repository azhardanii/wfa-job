@echo off
cd /d "%~dp0"
title WFA JOB Dev Server
echo ===================================================
echo   Starting WFA JOB Platform (Escrow & Trust System)
echo   Target URL: http://localhost:3000
echo   Color Palette: Dark Teal & Soft Teal
echo   Currency: $ USD ($1 = Rp. 17.000)
echo ===================================================
npm run dev
