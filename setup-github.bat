@echo off
echo ========================================
echo   AI Interview Platform - GitHub Setup
echo ========================================
echo.

echo Step 1: Checking Git installation...
git --version
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo ✓ Git is installed
echo.

echo Step 2: Initializing Git repository...
git init
echo ✓ Repository initialized
echo.

echo Step 3: Adding all files...
git add .
echo ✓ Files staged
echo.

echo Step 4: Creating initial commit...
git commit -m "Initial commit: AI Interview Platform with real-time analysis"
echo ✓ Initial commit created
echo.

echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Create a new repository on GitHub:
echo    https://github.com/new
echo.
echo 2. Copy your repository URL
echo.
echo 3. Run these commands (replace YOUR_USERNAME and YOUR_REPO):
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo ========================================
echo.
pause
