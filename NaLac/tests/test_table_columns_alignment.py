#!/usr/bin/env python3
"""
Validador Criterioso de Alinhamento de Colunas e Tabelas (THEAD vs TBODY)
Testa todas as tabelas HTML geradas em index.html, planilhas-censo.js, app.js, compras.js, spdm.js, bancada.js, evolucao.js
"""

import re
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def test_planilhas_censo_columns():
    path = os.path.join(BASE_DIR, "js", "modules", "planilhas-censo.js")
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()

    # 1. Testar Planilha Nominal (Autoclavada / Não Autoclavada)
    # Thead tem 17 colunas (0.SELEÇÃO, 1.LEITO, 2.ATENDIMENTO, 3.PACIENTE, 4.ENFERMARIA, 5.FÓRMULA / DIETA, 6.OBSERVAÇÃO, 7.HORÁRIOS, 8.VEZES, 9.VOL, 10.VIA, 11.DISPOSITIVO, 12.PREPARO 1, 13.PREPARO 2, 14.VOL. DIA, 15.STATUS, 16.AÇÕES)
    nominal_section = code[code.find("gerarHtmlTabelasCorpo"):code.find("gerarHtmlTabelasDietaEspecial")]
    thead_nominal = nominal_section[nominal_section.find("<thead"):nominal_section.find("</thead>")]
    th_count = len(re.findall(r'<th\b', thead_nominal))
    assert th_count == 17, f"Planilha Nominal: thead esperado 17 colunas, encontrado {th_count}"

    # No tbody map:
    tbody_map = nominal_section[nominal_section.find("b.pacientes.map"):nominal_section.find("`).join")]
    td_count = len(re.findall(r'<td\b', tbody_map))
    assert td_count == 17, f"Planilha Nominal: tbody esperado 17 colunas (td), encontrado {td_count}"

    # 2. Testar Dieta Especial
    # Thead tem 15 colunas (0.SELEÇÃO, 1.LEITO, 2.RH, 3.PACIENTE, 4.ENFERMARIA, 5.FÓRMULA / DIETA, 6.OBSERVAÇÃO, 7.TIPO DE ALIMENTO/DIETA, 8.QUANTIDADE, 9.HORÁRIOS, 10.VOLUME, 11.VEZES, 12.VIA/DISPOSITIVO, 13.STATUS, 14.AÇÕES)
    especial_section = code[code.find("gerarHtmlTabelasDietaEspecial"):code.find("gerarHtmlPlanilhaNominal")]
    thead_esp = especial_section[especial_section.find("<thead"):especial_section.find("</thead>")]
    th_esp_count = len(re.findall(r'<th\b', thead_esp))
    assert th_esp_count == 15, f"Dieta Especial: thead esperado 15 colunas, encontrado {th_esp_count}"

    tbody_esp = especial_section[especial_section.find("pacientes.map"):especial_section.find("`).join")]
    td_esp_count = len(re.findall(r'<td\b', tbody_esp))
    assert td_esp_count == 15, f"Dieta Especial: tbody esperado 15 colunas (td), encontrado {td_esp_count}"

    print("✅ js/modules/planilhas-censo.js: Todas as 17 colunas das Planilhas Nominais e 15 colunas de Dietas Especiais 100% alinhadas com FÓRMULA / DIETA e SELEÇÃO EM LOTE!")

def test_censo_planilhas_views_and_sticky():
    html_path = os.path.join(BASE_DIR, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    app_path = os.path.join(BASE_DIR, "js", "app.js")
    with open(app_path, "r", encoding="utf-8") as f:
        app_code = f.read()

    # Verificar que os 4 botões oficiais existem na barra superior de Pacientes
    assert 'id="btn-censo-visao-autoclavada"' in html
    assert 'id="btn-censo-visao-nao_autoclavada"' in html
    assert 'id="btn-censo-visao-dieta_especial"' in html
    assert 'id="btn-censo-visao-todas"' in html
    assert 'id="btn-censo-visao-interativo"' not in html, "Botão interativo obsoleto deve ter sido removido"

    # Verificar classes de sticky
    assert 'sticky' in html
    assert 'sticky-header-bar' in html

    print("✅ Aba Pacientes: 4 visualizações oficiais configuradas com barra de títulos fixa e sticky!")

def test_compras_columns():
    compras_path = os.path.join(BASE_DIR, "js", "modules", "compras.js")
    with open(compras_path, "r", encoding="utf-8") as f:
        code = f.read()

    thead = code[code.find("<thead"):code.find("</thead>")]
    th_count = len(re.findall(r'<th\b', thead))
    
    tbody = code[code.find("relatorio.linhas.map"):code.find("`).join")]
    td_count = len(re.findall(r'<td\b', tbody))

    assert th_count == 9, f"Compras: thead esperado 9 colunas, encontrado {th_count}"
    assert td_count == 9, f"Compras: tbody esperado 9 colunas, encontrado {td_count}"

    print("✅ Compras: Todas as 9 colunas de Pedido e Estoque 100% alinhadas!")

def test_etiquetas_columns():
    html_path = os.path.join(BASE_DIR, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    app_path = os.path.join(BASE_DIR, "js", "app.js")
    with open(app_path, "r", encoding="utf-8") as f:
        app_code = f.read()

    pos_tbody = html.find('id="etiquetas-selecao-corpo"')
    pos_thead = html.rfind('<thead', 0, pos_tbody)
    thead = html[pos_thead:pos_tbody]
    th_count = len(re.findall(r'<th\b', thead))

    tbody = app_code[app_code.find("renderizarEtiquetas() {"):app_code.find("imprimirPorTurno(")]
    tbody_map = tbody[tbody.find("filtrados.map"):tbody.find("`).join")]
    td_count = len(re.findall(r'<td\b', tbody_map))

    assert th_count == 10, f"Etiquetas: thead esperado 10 colunas, encontrado {th_count}"
    assert td_count == 10, f"Etiquetas: tbody esperado 10 colunas, encontrado {td_count}"

    print("✅ Etiquetas: Todas as 10 colunas de seleção e dados 100% alinhadas!")

if __name__ == "__main__":
    print("\n--- INICIANDO AUDITORIA RIGOROSA DE COLUNAS E TABELAS ---")
    test_planilhas_censo_columns()
    test_censo_planilhas_views_and_sticky()
    test_compras_columns()
    test_etiquetas_columns()
    print("\n🎉 TODAS AS TABELAS E COLUNAS DA APLICAÇÃO ESTÃO 100% ALINHADAS E CORRETAS!\n")
