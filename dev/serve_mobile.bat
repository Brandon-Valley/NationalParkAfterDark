@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem ============================================================
rem serve_mobile.bat
rem
rem This script lives in:
rem   <repo>\dev\serve_mobile.bat
rem
rem It serves the repo root over your local network and adds a
rem Windows Defender Firewall inbound rule for TCP port 8000.
rem
rem It will ask for Administrator permission because Windows
rem requires admin rights to add firewall rules.
rem ============================================================

set "PORT=8000"
set "RULE_NAME=global_rad local dev server port 8000"
for %%I in ("%~dp0..") do set "ROOT_DIR=%%~fI"

rem ------------------------------------------------------------
rem Re-run this script as Administrator if needed.
rem ------------------------------------------------------------

net session >nul 2>&1
if not "%ERRORLEVEL%"=="0" (
    echo.
    echo This script needs Administrator permission one time so it can
    echo add a Windows Firewall rule for port %PORT%.
    echo.
    echo You should see a Windows UAC prompt. Click Yes.
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%ROOT_DIR%"

echo.
echo ============================================================
echo GlobalRadii Mobile Test Server
echo ============================================================
echo.
echo Running as Administrator: YES
echo Serving folder:
echo   %CD%
echo.

if not exist "index.html" (
    echo WARNING: I do not see index.html in this folder.
    echo Expected:
    echo   %CD%\index.html
    echo.
)

rem ------------------------------------------------------------
rem Find Python.
rem Prefer py -3 on Windows if available, otherwise python.
rem ------------------------------------------------------------

set "PYTHON_CMD="

where py >nul 2>nul
if "%ERRORLEVEL%"=="0" (
    set "PYTHON_CMD=py -3"
) else (
    where python >nul 2>nul
    if "%ERRORLEVEL%"=="0" (
        set "PYTHON_CMD=python"
    )
)

if not defined PYTHON_CMD (
    echo ERROR: Python was not found.
    echo.
    echo Install Python from:
    echo   https://www.python.org/downloads/windows/
    echo.
    echo IMPORTANT: During install, check:
    echo   Add python.exe to PATH
    echo.
    pause
    exit /b 1
)

rem ------------------------------------------------------------
rem Add or refresh the Windows Firewall rule.
rem This is the fix for the phone timeout in most cases.
rem ------------------------------------------------------------

echo Adding Windows Firewall rule:
echo   %RULE_NAME%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ruleName = '%RULE_NAME%';" ^
    "$port = %PORT%;" ^
    "Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue;" ^
    "New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $port -Profile Private,Public | Out-Null;" ^
    "Write-Host 'Firewall rule is ready for TCP port' $port"

if not "%ERRORLEVEL%"=="0" (
    echo.
    echo ERROR: Could not add the firewall rule.
    echo Try right-clicking this .bat file and choosing:
    echo   Run as administrator
    echo.
    pause
    exit /b 1
)

echo.

rem ------------------------------------------------------------
rem Warn if your active network profile is Public.
rem The firewall rule above allows Public too, but Private is safer.
rem ------------------------------------------------------------

echo Current Windows network profile:
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Get-NetConnectionProfile | Where-Object { $_.IPv4Connectivity -ne 'Disconnected' -or $_.IPv6Connectivity -ne 'Disconnected' } | Select-Object -Property InterfaceAlias,NetworkCategory,IPv4Connectivity | Format-Table -AutoSize"
echo.

rem ------------------------------------------------------------
rem Find the best local IPv4 address.
rem First try the adapter with a default gateway.
rem Fallback to any normal non-loopback, non-APIPA IPv4.
rem ------------------------------------------------------------

set "LOCAL_IP="

for /f "usebackq delims=" %%A in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$ip = Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -and $_.IPv4Address -and $_.NetAdapter.Status -eq 'Up' } | ForEach-Object { $_.IPv4Address.IPAddress } | Where-Object { $_ -notmatch '^(127\.|169\.254\.)' } | Select-Object -First 1; if (-not $ip) { $ip = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' } | Sort-Object InterfaceMetric | Select-Object -ExpandProperty IPAddress -First 1 }; if ($ip) { $ip }"` ) do (
    set "LOCAL_IP=%%A"
)

if not defined LOCAL_IP (
    echo ERROR: Could not automatically find your local IPv4 address.
    echo.
    echo Try running this manually:
    echo   ipconfig
    echo.
    echo Then look for your Wi-Fi or Ethernet IPv4 Address.
    echo.
    pause
    exit /b 1
)

set "PHONE_URL=http://%LOCAL_IP%:%PORT%/index.html"
set "ROOT_URL=http://%LOCAL_IP%:%PORT%/"

echo ============================================================
echo Open this exact address on your phone:
echo.
echo   %PHONE_URL%
echo.
echo Or:
echo.
echo   %ROOT_URL%
echo ============================================================
echo.
echo Your phone must be on the same Wi-Fi/network as this PC.
echo Keep this window open while testing.
echo Press Ctrl+C in this window to stop the server.
echo.

echo Testing whether this PC can see the page through the LAN IP...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { $r = Invoke-WebRequest -UseBasicParsing -Uri '%PHONE_URL%' -TimeoutSec 3; Write-Host 'PC LAN test: OK, HTTP status' $r.StatusCode } catch { Write-Host 'PC LAN test: FAILED -' $_.Exception.Message }"
echo.

echo If your phone still times out after this:
echo.
echo   1. Make sure the phone is on the same Wi-Fi, not cellular.
echo   2. Make sure the phone is not on a Guest Wi-Fi network.
echo   3. Some routers have AP Isolation, Client Isolation, or Guest Isolation.
echo      That blocks phone-to-PC connections even when internet works.
echo   4. Try temporarily turning off VPN on the PC and phone.
echo   5. Try another port by editing PORT=8000 at the top of this file.
echo.
echo ============================================================
echo Starting server...
echo ============================================================
echo.

%PYTHON_CMD% -m http.server %PORT% --bind 0.0.0.0

echo.
echo Server stopped.
pause
