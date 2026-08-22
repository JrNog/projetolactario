#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Suíte de Testes para o Assistente Automático de Conexão Google Drive (Opção C)
"""

import os
import sys
import unittest

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

import configurador_google_drive as configurador

class TestConfiguradorGoogleDrive(unittest.TestCase):

    def test_files_exist(self):
        self.assertTrue(os.path.exists(os.path.join(BASE_DIR, "configurar_google_drive.command")))
        self.assertTrue(os.path.exists(os.path.join(BASE_DIR, "configurar_google_drive.bat")))
        self.assertTrue(os.path.exists(os.path.join(BASE_DIR, "backend", "configurador_google_drive.py")))
        self.assertTrue(os.path.exists(os.path.join(BASE_DIR, "backend", "Code.gs")))
        self.assertTrue(os.path.exists(os.path.join(BASE_DIR, "NutriLac", "configurar_google_drive.command")))
        self.assertTrue(os.path.exists(os.path.join(BASE_DIR, "NutriLac", "configurar_google_drive.bat")))

    def test_url_validation_format(self):
        # URL inválida
        valido, msg = configurador.testar_url_api("ftp://invalid-url")
        self.assertFalse(valido)

        # URL sem /exec
        valido, msg = configurador.testar_url_api("https://script.google.com/macros/s/AKfycbx/edit")
        self.assertFalse(valido)
        self.assertIn("/exec", msg)

    def test_salvar_url_no_projeto(self):
        test_url = "https://script.google.com/macros/s/TEST_AUTO_URL_12345/exec"
        configurador.salvar_url_no_projeto(test_url)

        with open(os.path.join(BASE_DIR, "js", "config.js"), "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn(test_url, content)

        # Limpa após teste
        configurador.salvar_url_no_projeto("")

    def test_code_gs_content(self):
        with open(os.path.join(BASE_DIR, "backend", "Code.gs"), "r", encoding="utf-8") as f:
            code = f.read()

        self.assertIn("doGet", code)
        self.assertIn("doPost", code)
        self.assertIn("saveCenso", code)
        self.assertIn("saveDietas", code)
        self.assertIn("saveSnapshot", code)
        self.assertIn("appendAuditLog", code)
        self.assertIn("verificarEstruturaPlanilha", code)

if __name__ == "__main__":
    unittest.main()
