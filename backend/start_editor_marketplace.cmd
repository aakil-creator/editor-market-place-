@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start_editor_marketplace.ps1" %*
exit /b %ERRORLEVEL%
