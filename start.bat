@echo off
title HabitStreak — Starting Servers...
color 0A

echo.
echo  ==========================================
echo   HabitStreak ^| Starting Dev Environment
echo  ==========================================
echo.

REM Start Backend in a new window
echo  [1/2] Starting Backend API on http://localhost:3001 ...
start "HabitStreak — Backend" cmd /k "cd /d "%~dp0backend" && color 0B && npm run dev"

REM Start Frontend in a new window
echo  [2/2] Starting Frontend on http://localhost:5173 ...
start "HabitStreak — Frontend" cmd /k "cd /d "%~dp0frontend" && color 0D && npm run dev"

REM Wait 5 seconds then open browser
ping -n 6 127.0.0.1 > nul

echo.
echo  Opening browser...
start http://localhost:5173

echo.
echo  Done! Both servers are running in their own windows.
echo  Close those windows to stop the servers.
echo.
