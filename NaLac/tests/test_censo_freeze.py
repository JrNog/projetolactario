#!/usr/bin/env python3
"""
Validador Específico de Congelamento de Cabeçalhos na Aba PACIENTES
Verifica:
1. Existência da zona shrink-0 com o banner (#censo-banner-header) e a barra de controles (#censo-view-buttons, #censo-busca).
2. Isolamento do container rolável (#censo-planilha-view-container) com flex-1 min-h-0 overflow-y-auto.
3. Desacoplamento da renderização de banner vs tabelas em PlanilhasCensoModule e App.renderizarCenso.
"""

import os
import re

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def test_pacientes_tab_freeze_structure():
    index_path = os.path.join(BASE_DIR, "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Extrair a seção #tab-censo
    pos_censo = html.find('id="tab-censo"')
    assert pos_censo != -1, "Aba PACIENTES (#tab-censo) não encontrada no index.html"
    
    pos_bancada = html.find('id="tab-bancada"')
    censo_section = html[pos_censo:pos_bancada]

    # 2. Verificar a zona fixa superior
    assert 'shrink-0 space-y-2 mb-2 z-30' in censo_section, "Zona fixa shrink-0 ausente na aba PACIENTES"
    assert 'id="censo-banner-header"' in censo_section, "Banner oficial (#censo-banner-header) deve estar na zona fixa shrink-0"
    assert 'id="btn-censo-visao-autoclavada"' in censo_section, "Botões de navegação devem estar na zona fixa"
    assert 'id="censo-busca"' in censo_section, "Busca deve estar na zona fixa"

    # 3. Verificar o container rolável isolado
    assert 'id="censo-planilha-view-container"' in censo_section, "Container rolável (#censo-planilha-view-container) ausente"
    assert 'class="flex-1 min-h-0 overflow-y-auto custom-scrollbar' in censo_section, "Classes de rolagem independente ausentes"

    # 4. Garantir que o container rolável está DEPOIS da zona shrink-0
    pos_shrink = censo_section.find('shrink-0')
    pos_scroll = censo_section.find('id="censo-planilha-view-container"')
    assert pos_scroll > pos_shrink, "O container rolável deve vir após a zona fixa shrink-0"

    print("✅ index.html: Estrutura da aba PACIENTES com zona fixa (Banner + Botões) e container rolável 100% verificada!")

def test_js_decoupling():
    js_path = os.path.join(BASE_DIR, "js", "modules", "planilhas-censo.js")
    with open(js_path, "r", encoding="utf-8") as f:
        js_code = f.read()

    app_path = os.path.join(BASE_DIR, "js", "app.js")
    with open(app_path, "r", encoding="utf-8") as f:
        app_code = f.read()

    # 1. PlanilhasCensoModule deve fornecer métodos desacoplados
    assert 'gerarHtmlBanner' in js_code, "Método gerarHtmlBanner ausente no PlanilhasCensoModule"
    assert 'gerarHtmlTabelasCorpo' in js_code, "Método gerarHtmlTabelasCorpo ausente no PlanilhasCensoModule"
    assert 'gerarHtmlTabelasDietaEspecial' in js_code, "Método gerarHtmlTabelasDietaEspecial ausente no PlanilhasCensoModule"

    # 2. App.renderizarCenso deve popular bannerContainer e planilhaContainer separadamente
    assert 'const bannerContainer = document.getElementById("censo-banner-header");' in app_code
    assert 'bannerContainer.innerHTML = PlanilhasCensoModule.gerarHtmlBanner(' in app_code
    assert 'planilhaContainer.innerHTML = PlanilhasCensoModule.gerarHtmlTabelasCorpo(' in app_code

    print("✅ JavaScript: Desacoplamento do Banner (Zona Fixa) e Tabelas (Zona Rolável) 100% verificado!")

if __name__ == "__main__":
    print("\n--- TESTANDO CONGELAMENTO DA BARRA DE TÍTULOS E BANNER DA ABA PACIENTES ---")
    test_pacientes_tab_freeze_structure()
    test_js_decoupling()
    print("🎉 CONGELAMENTO DA ABA PACIENTES VALIDADO COM TOTAL SUCESSO!\n")
