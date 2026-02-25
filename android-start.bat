@echo off
REM Quick start script for Android development
REM Run this to build and open the Android project

echo ========================================
echo Chatravasa Android Quick Start
echo ========================================
echo.

echo [1/3] Generating static site...
call npm run generate
if errorlevel 1 (
    echo ERROR: Failed to generate site
    pause
    exit /b 1
)

echo.
echo [2/3] Copying assets to Android...
if exist android\app\src\main\assets\public rmdir /S /Q android\app\src\main\assets\public
powershell -Command "Copy-Item -Path 'dist' -Destination 'android\app\src\main\assets\public' -Recurse -Force"
if errorlevel 1 (
    echo ERROR: Failed to copy assets
    pause
    exit /b 1
)

echo.
echo [3/3] Opening Android Studio...
call npx cap open android
if errorlevel 1 (
    echo ERROR: Failed to open Android Studio
    echo Make sure Android Studio is installed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Success! Android Studio should open now.
echo.
echo Next steps:
echo 1. Wait for Gradle sync to complete
echo 2. Click the green Run button
echo 3. Select your device or emulator
echo ========================================
echo.
pause
