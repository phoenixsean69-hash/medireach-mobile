@echo off
setlocal
cd /d "%~dp0"

title MediReach Android APK Build

echo.
echo ==============================================
echo  MediReach Android APK Build
echo ==============================================
echo.

echo [1/4] Checking TypeScript...
call npx tsc --noEmit

if errorlevel 1 (
  echo.
  echo BUILD STOPPED.
  echo TypeScript must pass before EAS Build.
  echo.
  pause
  exit /b 1
)

echo.
echo [2/4] Checking Expo/EAS account...
call npx eas-cli@latest whoami

if errorlevel 1 (
  echo.
  echo You are not logged into EAS.
  echo Run:
  echo   npx eas-cli@latest login
  echo Then run this BAT again.
  echo.
  pause
  exit /b 1
)

echo.
echo [3/4] Showing resolved EAS configuration...
call npx eas-cli@latest config --platform android --profile preview

if errorlevel 1 (
  echo.
  echo EAS configuration check failed.
  echo Send the COMPLETE output.
  echo.
  pause
  exit /b 1
)

echo.
echo [4/4] Starting Android APK cloud build...
echo.
echo Profile: preview
echo Artifact: APK
echo.

call npx eas-cli@latest build --platform android --profile preview

if errorlevel 1 (
  echo.
  echo APK BUILD FAILED.
  echo Send the COMPLETE EAS output.
  echo.
  pause
  exit /b 1
)

echo.
echo ==============================================
echo  EAS APK BUILD COMMAND COMPLETED
echo ==============================================
echo.
echo If the cloud build succeeded, EAS printed the
echo build page / download location above.
echo.
pause
