@echo off
setlocal enabledelayedexpansion
title Deploy Flight Miles Advisor to GitHub Pages
cd /d "%~dp0"

echo ======================================================================
echo    Miles vs Cash Advisor - 1-Click GitHub Pages Deployer
echo ======================================================================
echo.

:: 1. Check Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your PATH.
    echo Please install Git from https://git-scm.com/download/win and rerun this script.
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking Git repository initialization...
if not exist ".git" (
    echo       Initializing new Git repository on branch 'main'...
    git init -b main
) else (
    echo       Git repository already initialized.
    git branch -M main
)

echo.
echo [2/4] Staging and committing project files...
git add -A
git commit -m "Deploy Miles vs Cash Advisor with PWA offline support" 2>nul
if %errorlevel% equ 0 (
    echo       Files committed successfully.
) else (
    echo       Working directory is clean or already up-to-date.
)

echo.
echo [3/4] Checking remote GitHub repository...
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo No GitHub remote found!
    echo Please create a new empty repository on https://github.com/new
    echo (e.g. named 'flight-miles-calculator')
    echo.
    set /p REPO_URL="Paste your GitHub repository HTTPS URL here: "
    if "!REPO_URL!"=="" (
        echo [ERROR] No URL entered. Aborting deployment.
        pause
        exit /b 1
    )
    git remote add origin !REPO_URL!
    echo       Added remote origin: !REPO_URL!
) else (
    for /f "tokens=*" %%a in ('git remote get-url origin') do set CURRENT_REMOTE=%%a
    echo       Current remote origin: !CURRENT_REMOTE!
)

echo.
echo [4/4] Pushing code to GitHub (branch 'main')...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo    SUCCESS! Code uploaded to GitHub!
    echo ======================================================================
    echo.
    echo NEXT STEP TO ACTIVATE GITHUB PAGES (Takes 15 seconds):
    echo 1. Open your repository on GitHub.
    echo 2. Go to: Settings ^> Pages
    echo 3. Under 'Build and deployment' ^> Source, select: 'GitHub Actions'
    echo 4. Wait ~1 minute, then refresh! Your app is now live online!
    echo.
    echo TO INSTALL ON YOUR PHONE (PWA):
    echo - Open the live link in Safari (iPhone) or Chrome (Android)
    echo - Tap 'Share' or '...' ^> 'Add to Home Screen'
    echo - Now you have a native-style app with Pure Black AMOLED ^& Offline mode!
    echo ======================================================================
) else (
    echo.
    echo [ERROR] Failed to push to GitHub.
    echo Please verify your GitHub credentials or check if you have write access.
)

echo.
pause
