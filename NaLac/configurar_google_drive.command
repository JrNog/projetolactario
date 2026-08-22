#!/bin/bash
# ==============================================================================
# Assistente de Conexão Automática do Lactário Digital HSP com Google Drive
# ==============================================================================
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

python3 backend/configurador_google_drive.py
