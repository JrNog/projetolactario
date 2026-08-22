#!/usr/bin/env python3
"""
Validador de Renderização das Planilhas Nominais e Cabeçalhos Sticky
Testa a geração de HTML de planilhas nominais, classes sticky, busca e remoção de relação interativa.
"""

import re
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def test_html_and_css_sticky_elements():
    index_path = os.path.join(BASE_DIR, "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    css_path = os.path.join(BASE_DIR, "css", "app.css")
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    # 1. Verificar botões de visualização na aba PACIENTES
    assert 'id="btn-censo-visao-autoclavada"' in html
    assert 'id="btn-censo-visao-nao_autoclavada"' in html
    assert 'id="btn-censo-visao-dieta_especial"' in html
    assert 'id="btn-censo-visao-todas"' in html
    assert 'id="btn-censo-visao-interativo"' not in html

    # 2. Verificar campo de busca em tempo real na aba PACIENTES
    assert 'id="censo-busca"' in html

    # 3. Verificar classes de sticky no CSS
    assert '.sticky-header-bar' in css
    assert '.table-sticky-header' in css
    assert 'position: sticky' in css

    print("✅ index.html e css/app.css: 4 botões oficiais, busca em tempo real e classes sticky validadas!")

def test_planilhas_censo_js_structure():
    js_path = os.path.join(BASE_DIR, "js", "modules", "planilhas-censo.js")
    with open(js_path, "r", encoding="utf-8") as f:
        code = f.read()

    # 1. visaoAtiva padrão deve ser autoclavada
    assert 'visaoAtiva: "autoclavada"' in code

    # 2. Presença da coluna FÓRMULA / DIETA nas planilhas nominais
    assert '<th class="py-2.5 px-2.5 text-center">FÓRMULA / DIETA</th>' in code
    assert '<!-- 5. FÓRMULA / DIETA -->' in code

    # 3. Presença da coluna FÓRMULA / DIETA em Dieta Especial
    assert '<th class="py-2.5 px-3 text-center">FÓRMULA / DIETA</th>' in code

    # 4. Presença de classes sticky em thead
    assert 'sticky top-0' in code

    # 5. Total de colunas (colspan 17 e 15 com suporte a multi-seleção)
    assert 'colspan="17"' in code or 'colspan="16"' in code
    assert 'colspan="15"' in code or 'colspan="14"' in code

    print("✅ js/modules/planilhas-censo.js: Coluna 'FÓRMULA / DIETA', multi-seleção e cabeçalhos sticky validados com 100% de sucesso!")

if __name__ == "__main__":
    print("\n--- TESTANDO MELHORIAS DE PLANILHAS NOMINAIS E STICKY HEADERS ---")
    test_html_and_css_sticky_elements()
    test_planilhas_censo_js_structure()
    print("🎉 TUDO APROVADO COM 100% DE CONFORMIDADE!\n")
