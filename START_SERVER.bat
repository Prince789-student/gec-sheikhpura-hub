@echo off
title GEC Sheikhpura Student Life Hub - Local Server
echo ========================================================
echo   GEC Sheikhpura Student Life Hub - Local Server
echo   Website:    http://localhost:5000
echo   Mobile App: http://localhost:5000/app/
echo ========================================================
echo.
echo Starting local server at http://localhost:5000/ ...
echo Press Ctrl+C in this window to stop the server anytime.
echo.
timeout /t 2 >nul
start http://localhost:5000/
start http://localhost:5000/app/
cd /d "%~dp0server"
node server.js
pause
