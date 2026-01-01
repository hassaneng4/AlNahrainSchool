@echo off
set "TARGET=file:///c:/Users/user/.gemini/antigravity/scratch/meat-pos-final/index.html"

:: Try Chrome first (App Mode - No Address Bar)
start chrome --app="%TARGET%" --start-maximized
if %errorlevel% equ 0 exit

:: Try Edge (App Mode)
start msedge --app="%TARGET%" --start-maximized
if %errorlevel% equ 0 exit

:: Fallback
start "" "%TARGET%"
exit
