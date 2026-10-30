@echo off
title GEC Sheikhpura Student Life Hub - Local Server
echo ========================================================
echo   GEC Sheikhpura Student Life Hub - Local Web Server
echo ========================================================
echo.
echo Starting local web server at http://localhost:3000/ ...
echo Press Ctrl+C in this window to stop the server anytime.
echo.
start http://localhost:3000/
python -m http.server 3000
pause
