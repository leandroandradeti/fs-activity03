@echo off
setlocal enabledelayedexpansion

rem === Config ===
set BACKEND_PORT=5190
set FRONTEND_PORT=5391

rem === Util: kill process by TCP port (Windows) ===
rem Requires: netstat (built-in) + taskkill
call :kill_port %BACKEND_PORT%
call :kill_port %FRONTEND_PORT%

echo Starting backend...
cd /d "%~dp0\backend"
start "backend" cmd /k "node src\server.js"

rem Aguarda backend subir um pouco
timeout /t 2 /nobreak >nul

echo Starting frontend...
cd /d "%~dp0\frontend"
start "frontend" cmd /k "npm run dev -- --host 0.0.0.0 --port %FRONTEND_PORT%"

echo.
echo Done.
echo Backend:  http://localhost:%BACKEND_PORT%
echo Frontend: http://localhost:%FRONTEND_PORT%

goto :eof

:kill_port
set PORT=%~1
rem Pega PID(s) usando netstat
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTEN') do (
  set PID=%%p
  echo Killing PID !PID! on port %PORT%...
  taskkill /PID !PID! /F >nul 2>&1
)
exit /b 0
