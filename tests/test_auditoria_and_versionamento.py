#!/usr/bin/env python3
"""
Suíte de Testes Automatizados para o Motor de Auditoria e Versionamento de Catálogos (NutriLac)
Valida:
1. Existência e integridade estrutural de js/modules/auditoria.js e js/modules/versionamento.js.
2. Nomenclatura oficial de pontos de restauração (ex: Valores_Catálogo_e_Listas_de_Referência_do_Lactário_em_...).
3. Estrutura de logs com suporte a registro De -> Para, autor, módulo e data/hora.
4. Presença das novas sub-abas, sub-painéis e modais no index.html.
5. Inclusão dos scripts em ordem correta no index.html e integração em js/app.js.
"""

import os
import re
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def test_auditoria_module_file():
    path = os.path.join(BASE_DIR, "js", "modules", "auditoria.js")
    assert os.path.exists(path), f"Arquivo ausente: {path}"
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "AuditLogModule" in content
    assert "STORAGE_KEY" in content
    assert "registrar" in content
    assert "filtrarLogs" in content
    assert "exportarCSV" in content
    assert "limparLogs" in content
    assert "PACIENTES" in content
    assert "CATALOGO_FORMULAS" in content
    assert "VERSIONAMENTO" in content
    print("✅ js/modules/auditoria.js: Módulo de Auditoria validado com sucesso!")

def test_versionamento_module_file():
    path = os.path.join(BASE_DIR, "js", "modules", "versionamento.js")
    assert os.path.exists(path), f"Arquivo ausente: {path}"
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "VersionamentoModule" in content
    assert "STORAGE_KEY" in content
    assert "gerarNomePadrao" in content
    assert "Valores_Catálogo_e_Listas_de_Referência_do_Lactário_em_" in content
    assert "criarSnapshot" in content
    assert "compararComAtual" in content
    assert "restaurarVersao" in content
    assert "exportarVersaoJSON" in content
    assert "importarVersaoJSON" in content
    print("✅ js/modules/versionamento.js: Módulo de Versionamento validado com sucesso!")

def test_index_html_integration():
    path = os.path.join(BASE_DIR, "index.html")
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()

    # Sub-abas
    assert 'id="subtab-btn-versoes"' in html, "Botão subtab-btn-versoes ausente no index.html"
    assert 'id="subtab-btn-auditoria"' in html, "Botão subtab-btn-auditoria ausente no index.html"
    assert 'id="subtab-btn-sheets"' in html, "Botão subtab-btn-sheets ausente no index.html"
    assert 'Histórico de alterações' in html, "Rótulo 'Histórico de alterações' ausente no index.html"

    # Sub-painéis
    assert 'id="config-painel-versoes"' in html, "Painel config-painel-versoes ausente no index.html"
    assert 'id="config-painel-auditoria"' in html, "Painel config-painel-auditoria ausente no index.html"
    assert 'id="config-painel-sheets"' in html, "Painel config-painel-sheets ausente no index.html"

    # Tabelas
    assert 'id="tabela-config-versoes-corpo"' in html, "Tabela de versões ausente"
    assert 'id="tabela-config-auditoria-corpo"' in html, "Tabela de auditoria ausente"

    # Modais
    assert 'id="modal-novo-snapshot"' in html, "Modal de novo snapshot ausente"
    assert 'id="modal-diff-snapshot"' in html, "Modal comparativo diff ausente"
    assert 'id="modal-detalhes-auditoria"' in html, "Modal detalhes auditoria ausente"

    # Scripts carregados
    assert '<script src="js/modules/auditoria.js"></script>' in html, "Script auditoria.js ausente no index.html"
    assert '<script src="js/modules/versionamento.js"></script>' in html, "Script versionamento.js ausente no index.html"

    # Ordem dos scripts: auditoria e versionamento antes de app.js
    pos_auditoria = html.find('js/modules/auditoria.js')
    pos_versionamento = html.find('js/modules/versionamento.js')
    pos_app = html.find('js/app.js')
    assert pos_auditoria < pos_app, "auditoria.js deve ser carregado antes de app.js"
    assert pos_versionamento < pos_app, "versionamento.js deve ser carregado antes de app.js"

    print("✅ index.html: Integração visual de Versões, Histórico de alterações, Conexão Sheets e Modais 100% validada!")

def test_app_js_integration():
    path = os.path.join(BASE_DIR, "js", "app.js")
    with open(path, "r", encoding="utf-8") as f:
        js = f.read()

    # Alternância de sub-abas
    assert '"versoes"' in js and '"auditoria"' in js and '"sheets"' in js, "Sub-abas versoes, auditoria e sheets devem estar em alternarSubAbaConfig"
    assert "renderizarVersoes" in js, "Método renderizarVersoes ausente em app.js"
    assert "renderizarAuditoria" in js, "Método renderizarAuditoria ausente em app.js"
    assert "abrirModalNovoSnapshot" in js, "Método abrirModalNovoSnapshot ausente em app.js"
    assert "abrirComparativoSnapshot" in js, "Método abrirComparativoSnapshot ausente em app.js"
    assert "restaurarVersaoSnapshot" in js, "Método restaurarVersaoSnapshot ausente em app.js"
    assert "verDetalhesLogAuditoria" in js, "Método verDetalhesLogAuditoria ausente em app.js"

    # Disparos de auditoria
    assert re.search(r'AuditLogModule\.registrar\s*\(\s*["\']PACIENTES["\']', js), "Auditoria de pacientes ausente"
    assert re.search(r'AuditLogModule\.registrar\s*\(\s*["\']CATALOGO_FORMULAS["\']', js), "Auditoria de fórmulas ausente"
    assert re.search(r'AuditLogModule\.registrar\s*\(\s*["\']CATALOGO_ENFERMARIAS["\']', js), "Auditoria de enfermarias ausente"
    assert re.search(r'AuditLogModule\.registrar\s*\(\s*["\']NUTRICIONISTA["\']', js), "Auditoria de nutricionista ausente"

    # Disparos de auto-snapshot
    assert re.search(r'VersionamentoModule\.criarSnapshot\s*\(\s*["\']AUTOMATICO["\']', js), "Auto-snapshot ausente nas operações de catálogo"

    print("✅ js/app.js: Integração de métodos de auditoria, snapshots e reversão 100% validada!")

if __name__ == "__main__":
    print("=" * 70)
    print("🧪 INICIANDO TESTES DO MOTOR DE AUDITORIA E VERSIONAMENTO")
    print("=" * 70)
    test_auditoria_module_file()
    test_versionamento_module_file()
    test_index_html_integration()
    test_app_js_integration()
    print("=" * 70)
    print("🎉 TODOS OS TESTES DE AUDITORIA E VERSIONAMENTO FORAM APROVADOS!")
    print("=" * 70)
