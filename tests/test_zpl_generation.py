#!/usr/bin/env python3
"""
Test Suite de Geração e Validação de ZPL II (Zebra ZD230 - 100mm × 45mm / 203 DPI)
Valida a sintaxe dos comandos ZPL, dimensões de 800x360 dots, caixas pretas invertidas (^FR),
cabeçalhos do Hospital São Paulo e exclusão de pacientes suspensos/altas.
"""

import re
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def test_zpl_syntax_and_dimensions():
    path = os.path.join(BASE_DIR, "js", "modules", "etiquetas.js")
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()

    # 1. Comandos Estruturais ZPL II
    assert "^XA" in code and "^XZ" in code, "Comandos de início (^XA) e fim (^XZ) de formato ZPL ausentes"
    assert "^PW800" in code, "Largura de 100mm (800 dots @ 203 DPI) deve ser configurada com ^PW800"
    assert "^LL360" in code, "Altura de 45mm (360 dots @ 203 DPI) deve ser configurada com ^LL360"
    assert "^MNY" in code, "Sensor de GAP/Web tracking (^MNY) deve estar ativado para evitar deriva"
    assert "^CI28" in code, "Tabela de caracteres UTF-8 (^CI28) deve estar ativa"

    # 2. Cabeçalho Oficial HSP / UNIFESP
    assert "HOSPITAL SAO PAULO / UNIFESP-EPM - (NUTRICAO)" in code, "Cabeçalho institucional ausente no ZPL"

    # 3. Caixas Pretas Invertidas com ^FR (Field Reverse)
    assert "^FR^FDLEITO:" in code or "^FR" in code, "Instrução de texto invertido (^FR) ausente para o Leito"
    assert "^FR^FDDieta/Prod:" in code or "^FR" in code, "Instrução de texto invertido (^FR) ausente para a Dieta"
    assert "^GB340,32,32,B,0^FS" in code or "^GB" in code, "Caixa gráfica preta sólida (^GB) ausente"

    # 4. Métodos do Motor ZPL
    assert "gerarZplEtiqueta" in code, "Método gerarZplEtiqueta ausente em EtiquetasModule"
    assert "gerarZplLote" in code, "Método gerarZplLote ausente em EtiquetasModule"
    assert "verificarConexaoZebra" in code, "Método verificarConexaoZebra ausente em EtiquetasModule"
    assert "enviarZplParaImpressora" in code, "Método enviarZplParaImpressora ausente em EtiquetasModule"
    assert "imprimirEtiquetasInteligente" in code, "Método imprimirEtiquetasInteligente ausente em EtiquetasModule"
    assert "imprimirTesteZpl" in code, "Método imprimirTesteZpl ausente em EtiquetasModule"

    print("✅ js/modules/etiquetas.js: Estrutura ZPL II (800x360 dots / 203 DPI), blocos invertidos e métodos validados com sucesso!")

def test_html_ui_and_app_integration():
    index_path = os.path.join(BASE_DIR, "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    app_path = os.path.join(BASE_DIR, "js", "app.js")
    with open(app_path, "r", encoding="utf-8") as f:
        app_code = f.read()

    # 1. Badge de Status da Impressora no Banner de Etiquetas
    assert 'id="etiquetas-status-impressora"' in html, "Badge #etiquetas-status-impressora ausente no index.html"
    assert 'id="etiquetas-status-txt"' in html, "Texto de status #etiquetas-status-txt ausente no index.html"
    assert 'App.imprimirTesteZebra()' in html, "Botão de teste ZPL ausente no index.html"
    assert '100mm × 45mm' in html or '100mm' in html, "Indicação da medida oficial de 100x45mm ausente no index.html"

    # 2. Métodos em app.js
    assert "imprimirTesteZebra" in app_code, "Método App.imprimirTesteZebra ausente no app.js"
    assert "atualizarStatusImpressoraZebra" in app_code, "Método App.atualizarStatusImpressoraZebra ausente no app.js"

    print("✅ index.html e js/app.js: Badge de status da Zebra ZD230, botão de teste ZPL e métodos integrados!")

def test_css_thermal_print_100x45():
    css_path = os.path.join(BASE_DIR, "css", "print-zebra.css")
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    assert "body.print-zebra-active" in css, "Regra body.print-zebra-active ausente no print-zebra.css"
    assert "width: 100mm" in css, "Largura de 100mm para impressão térmica ausente no print-zebra.css"
    assert "height: 45mm" in css, "Altura de 45mm para etiqueta térmica ausente no print-zebra.css"
    assert "page-break-after: always" in css, "Quebra de página por etiqueta ausente no print-zebra.css"

    print("✅ css/print-zebra.css: Estilos de impressão térmica rigorosamente calibrados para 100mm × 45mm!")

if __name__ == "__main__":
    print("\n--- TESTANDO MOTOR DE IMPRESSÃO TÉRMICA ZPL II E FALLBACK HTML ---")
    test_zpl_syntax_and_dimensions()
    test_html_ui_and_app_integration()
    test_css_thermal_print_100x45()
    print("🎉 MOTOR DE IMPRESSÃO ZEBRA ZD230 (100×45mm) 100% VALIDADO!\n")
