@echo off
setlocal enabledelayedexpansion

rem === Config ===
set BACKEND_PORT=5191
set FRONTEND_PORT=5391

rem === Util: kill process by TCP port (Windows) ===
rem Requires: netstat (built-in) + taskkill
call :kill_port %BACKEND_PORT%
call :kill_port %FRONTEND_PORT%

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "FRONTEND_DIR=%ROOT%frontend"
set "BACKEND_LOG=%ROOT%backend.log"
set "FRONTEND_LOG=%ROOT%frontend.log"

echo Starting backend...
start "backend" /b cmd /c "cd /d ""%BACKEND_DIR%"" && set PORT=%BACKEND_PORT% && node src\server.js > ""%BACKEND_LOG%"" 2>&1"

echo Waiting for backend to start...
for /L %%i in (1,1,25) do (
  powershell -NoProfile -Command "$client = New-Object System.Net.Http.HttpClient; try { $response = $client.GetAsync('http://localhost:%BACKEND_PORT%/health').GetAwaiter().GetResult(); if ($response.IsSuccessStatusCode) { exit 0 } } catch {} exit 1" >nul 2>&1
  if not errorlevel 1 goto frontend
  timeout /t 1 /nobreak >nul
)

echo Backend did not start in time.
if exist "%BACKEND_LOG%" type "%BACKEND_LOG%"

:frontend
echo Starting frontend...
start "frontend" /b cmd /c "cd /d ""%FRONTEND_DIR%"" && npm run dev -- --host 0.0.0.0 --port %FRONTEND_PORT% > ""%FRONTEND_LOG%"" 2>&1"

echo.
echo Done.
echo Backend:  http://localhost:%BACKEND_PORT%
echo Frontend: http://localhost:%FRONTEND_PORT%

goto :eof

:frontend
echo Starting frontend...
start "frontend" /b cmd /c "cd /d ""%FRONTEND_DIR%"" && npm run dev -- --host 0.0.0.0 --port %FRONTEND_PORT% > ""%FRONTEND_LOG%"" 2>&1"

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
