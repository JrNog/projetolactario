import unittest
import re

class TestAltaFix(unittest.TestCase):
    def setUp(self):
        with open("js/modules/lote-esteira.js", "r", encoding="utf-8") as f:
            self.lote_code = f.read()
        with open("js/modules/auditoria.js", "r", encoding="utf-8") as f:
            self.auditoria_code = f.read()
        with open("js/services/api.js", "r", encoding="utf-8") as f:
            self.api_code = f.read()
        with open("index.html", "r", encoding="utf-8") as f:
            self.html_code = f.read()

    def test_auditoria_methods(self):
        """Verifica se AuditLogModule possui getResponsavelAtual e formatarDataHora"""
        self.assertIn("formatarDataHora(data = new Date())", self.auditoria_code)
        self.assertIn("getResponsavelAtual()", self.auditoria_code)

    def test_confirmar_alta_try_catch_finally(self):
        """Verifica se confirmarAltaAtual possui try-catch-finally protegendo o botão"""
        self.assertIn("try {", self.lote_code)
        self.assertIn("} catch (err) {", self.lote_code)
        self.assertIn("} finally {", self.lote_code)
        self.assertIn("btnConfirmar.disabled = false", self.lote_code)

    def test_modal_alta_no_desativacao_text(self):
        """Verifica se o texto Desativação do Censo Clínico foi removido"""
        self.assertNotIn("Desativação do Censo Clínico", self.html_code)

    def test_batch_buttons_no_esteira_word(self):
        """Verifica se os botões de ação em lote não contêm a palavra (Esteira)"""
        self.assertIn("Editar Selecionados", self.html_code)
        self.assertIn("Dar Alta aos Selecionados", self.html_code)
        self.assertNotIn("Editar Selecionados (Esteira)", self.html_code)
        self.assertNotIn("Dar Alta (Esteira)", self.html_code)

    def test_api_timeout(self):
        """Verifica se ApiService possui fetchWithTimeout"""
        self.assertIn("fetchWithTimeout", self.api_code)
        self.assertIn("AbortController", self.api_code)

if __name__ == "__main__":
    unittest.main()
