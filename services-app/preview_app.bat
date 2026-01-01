@echo off
set "TARGET=file:///c:/Users/user/.gemini/antigravity/scratch/services-app/simulator.html"

:: Try Chrome
start chrome --app="%TARGET%" --start-maximized
if %errorlevel% equ 0 exit

:: Try Edge
start msedge --app="%TARGET%" --start-maximized
if %errorlevel% equ 0 exit

:: Fallback
start "" "%TARGET%"
exit
