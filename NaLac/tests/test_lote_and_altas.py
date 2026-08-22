#!/usr/bin/env python3
"""
Test Suite: Ações em Lote, Esteira Guiada com Auditoria "De ➔ Para" e Registro de Altas (TB_LOG_ALTAS)
Lactário HSP / NutriPed / NutriLac (Hospital São Paulo - UNIFESP/EPM - SPDM)
"""

import os
import re
import json
import unittest

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class TestLoteAndAltasSuite(unittest.TestCase):

    def setUp(self):
        self.index_html_path = os.path.join(WORKSPACE_ROOT, "index.html")
        self.lote_esteira_js_path = os.path.join(WORKSPACE_ROOT, "js", "modules", "lote-esteira.js")
        self.planilhas_censo_js_path = os.path.join(WORKSPACE_ROOT, "js", "modules", "planilhas-censo.js")
        self.app_js_path = os.path.join(WORKSPACE_ROOT, "js", "app.js")
        self.api_js_path = os.path.join(WORKSPACE_ROOT, "js", "services", "api.js")
        self.backend_code_gs_path = os.path.join(WORKSPACE_ROOT, "backend", "Code.gs")
        self.app_css_path = os.path.join(WORKSPACE_ROOT, "css", "app.css")

    def test_01_files_exist(self):
        """Verifica se todos os arquivos do módulo de lote, esteira e backend existem."""
        self.assertTrue(os.path.exists(self.lote_esteira_js_path), "js/modules/lote-esteira.js deve existir")
        self.assertTrue(os.path.exists(self.index_html_path), "index.html deve existir")
        self.assertTrue(os.path.exists(self.backend_code_gs_path), "backend/Code.gs deve existir")

    def test_02_index_html_includes_script_and_components(self):
        """Verifica se index.html inclui o script lote-esteira.js, a barra flutuante e os 3 modais."""
        with open(self.index_html_path, "r", encoding="utf-8") as f:
            html = f.read()

        self.assertIn('src="js/modules/lote-esteira.js"', html, "index.html deve carregar lote-esteira.js")
        self.assertIn('id="censo-batch-action-bar"', html, "index.html deve conter #censo-batch-action-bar")
        self.assertIn('id="censo-batch-contador"', html, "index.html deve conter #censo-batch-contador")
        self.assertIn('id="modal-lote-exclusao"', html, "index.html deve conter #modal-lote-exclusao")
        self.assertIn('id="modal-alta-paciente"', html, "index.html deve conter #modal-alta-paciente")
        self.assertIn('id="modal-alta-observacao"', html, "index.html deve conter #modal-alta-observacao")
        self.assertIn('id="modal-resumo-de-para"', html, "index.html deve conter #modal-resumo-de-para")
        self.assertIn('id="tabela-resumo-de-para-corpo"', html, "index.html deve conter #tabela-resumo-de-para-corpo")

    def test_03_lote_esteira_methods_defined(self):
        """Verifica se lote-esteira.js define todos os métodos e estruturas necessários."""
        with open(self.lote_esteira_js_path, "r", encoding="utf-8") as f:
            js = f.read()

        metodos_obrigatorios = [
            "toggleSelecao",
            "selecionarTodos",
            "limparSelecao",
            "estaSelecionado",
            "getIdsSelecionados",
            "getPacientesSelecionados",
            "atualizarBarraAcoesFlutuante",
            "sincronizarCheckboxesVisual",
            "iniciarEsteiraEdicao",
            "abrirProximoPacienteEsteira",
            "salvarAvancarEsteira",
            "pularPacienteEsteira",
            "interromperEsteiraEdicao",
            "finalizarEsteiraEdicao",
            "exibirModalResumoDePara",
            "fecharModalResumoDePara",
            "abrirModalExclusaoLote",
            "fecharModalExclusaoLote",
            "confirmarExclusaoLote",
            "abrirModalAltaIndividual",
            "iniciarEsteiraAlta",
            "abrirProximoPacienteAlta",
            "renderizarModalAlta",
            "confirmarAltaAtual",
            "interromperEsteiraAlta",
            "finalizarEsteiraAlta",
            "salvarRegistroAltaLocal",
            "getAltasLocais"
        ]

        for m in metodos_obrigatorios:
            self.assertIn(m, js, f"lote-esteira.js deve conter o método {m}")

    def test_04_planilhas_censo_renders_checkboxes(self):
        """Verifica se planilhas-censo.js renderiza a coluna de seleção e checkboxes em todas as tabelas."""
        with open(self.planilhas_censo_js_path, "r", encoding="utf-8") as f:
            js = f.read()

        self.assertIn("censo-select-all-checkbox", js, "Deve renderizar checkbox mestre no thead")
        self.assertIn("censo-paciente-checkbox", js, "Deve renderizar checkbox em cada linha")
        self.assertIn("LoteEsteiraModule.toggleSelecao", js, "Deve chamar LoteEsteiraModule.toggleSelecao no onchange")
        self.assertIn("LoteEsteiraModule.selecionarTodos", js, "Deve chamar LoteEsteiraModule.selecionarTodos")

    def test_05_app_js_integrates_esteira_and_altas(self):
        """Verifica se app.js está integrado com a esteira e altas de LoteEsteiraModule."""
        with open(self.app_js_path, "r", encoding="utf-8") as f:
            js = f.read()

        self.assertIn("LoteEsteiraModule.abrirModalAltaIndividual", js, "abrirModalAlta deve delegar para LoteEsteiraModule")
        self.assertIn("LoteEsteiraModule.salvarAvancarEsteira", js, "executarGravacaoEdicaoConfirmada deve avançar esteira se ativa")
        self.assertIn("LoteEsteiraModule.sincronizarCheckboxesVisual", js, "renderizarCenso deve sincronizar checkboxes visuais")
        self.assertIn("LoteEsteiraModule.removerControlesEsteiraModal", js, "fecharModalPaciente deve limpar controles de esteira")

    def test_06_api_service_supports_altas_and_snapshots(self):
        """Verifica se ApiService possui saveAlta, getAltas, saveSnapshot e appendAuditLog."""
        with open(self.api_js_path, "r", encoding="utf-8") as f:
            js = f.read()

        self.assertIn("saveAlta(altaData)", js, "ApiService deve conter saveAlta")
        self.assertIn("getAltas()", js, "ApiService deve conter getAltas")
        self.assertIn("saveSnapshot(snapData)", js, "ApiService deve conter saveSnapshot")
        self.assertIn("appendAuditLog(logData)", js, "ApiService deve conter appendAuditLog")

    def test_07_backend_code_gs_supports_altas_sheet(self):
        """Verifica se backend/Code.gs cria TB_LOG_ALTAS e implementa endpoints saveAlta e getAltas."""
        with open(self.backend_code_gs_path, "r", encoding="utf-8") as f:
            gs = f.read()

        self.assertIn("TB_LOG_ALTAS", gs, "Code.gs deve suportar aba TB_LOG_ALTAS")
        self.assertTrue("saveAlta" in gs, "Code.gs deve tratar action saveAlta")
        self.assertTrue("getAltas" in gs, "Code.gs deve tratar action getAltas")

    def test_08_css_styles_for_batch_action_bar(self):
        """Verifica se css/app.css possui estilos e animações para a barra de ações em lote."""
        with open(self.app_css_path, "r", encoding="utf-8") as f:
            css = f.read()

        self.assertIn("#censo-batch-action-bar", css, "css/app.css deve conter estilos para #censo-batch-action-bar")
        self.assertIn(".censo-paciente-checkbox", css, "css/app.css deve conter estilos para .censo-paciente-checkbox")

    def test_09_censo_module_compatibility_methods(self):
        """Verifica se censo.js possui obterPorId, getPacientePorId, getLista e darAltaPaciente."""
        censo_js_path = os.path.join(WORKSPACE_ROOT, "js", "modules", "censo.js")
        with open(censo_js_path, "r", encoding="utf-8") as f:
            js = f.read()

        self.assertIn("obterPorId(pacienteId)", js, "censo.js deve conter obterPorId")
        self.assertIn("getPacientePorId(pacienteId)", js, "censo.js deve conter getPacientePorId")
        self.assertIn("getLista()", js, "censo.js deve conter getLista")
        self.assertIn("darAltaPaciente(pacienteId", js, "censo.js deve conter darAltaPaciente")

    def test_10_esteira_form_elements_and_flow(self):
        """Verifica se index.html e app.js possuem elementos de formulário e avanço correto na esteira."""
        with open(self.index_html_path, "r", encoding="utf-8") as f:
            html = f.read()

        self.assertIn('id="modal-paciente-footer-actions"', html, "index.html deve conter #modal-paciente-footer-actions")
        self.assertIn('id="btn-salvar-paciente"', html, "index.html deve conter #btn-salvar-paciente")

        with open(self.app_js_path, "r", encoding="utf-8") as f:
            js = f.read()

        self.assertIn("LoteEsteiraModule.esteiraEdicao.ativa", js, "app.js deve verificar se esteira está ativa no salvamento")

if __name__ == "__main__":
    unittest.main()
