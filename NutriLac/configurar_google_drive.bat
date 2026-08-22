@echo off
REM ==============================================================================
REM Assistente de Conexão Automática do Lactário Digital HSP com Google Drive
REM ==============================================================================
title Configurador Google Drive - Lactario Digital HSP
cd /d "%~dp0"

python backend\configurador_google_drive.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Ocorreu um problema ao executar o assistente com o Python.
    pause
)
