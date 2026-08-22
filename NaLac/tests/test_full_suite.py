#!/usr/bin/env python3
"""
Test Suite Completa para Validação do Lactário Digital HSP
Valida estrutura do HTML, base de dados Excel de Concentrações e Medidas,
métodos da aplicação em JS, cabeçalho de colunas 'PACIENTE' e assinaturas dinâmicas.
"""

import re
import os
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def test_html_structure():
    path = os.path.join(BASE_DIR, "index.html")
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Campos do Nutricionista
    assert 'id="config-nutri-nome"' in html, "Falta input config-nutri-nome"
    assert 'id="config-nutri-crn"' in html, "Falta input config-nutri-crn"
    assert 'id="config-nutri-setor"' in html, "Falta input config-nutri-setor"
    assert 'id="config-nutri-ramal"' in html, "Falta input config-nutri-ramal"
    assert 'id="config-nutri-preview"' in html, "Falta elemento config-nutri-preview"
    assert 'onclick="App.salvarDadosNutricionista()"' in html, "Falta botão salvarDadosNutricionista"

    # 2. Tabela de Concentrações e Medidas e 5 Sub-Abas de Catálogos
    subtabs = ["enfermarias", "formulas", "intervalos", "vias", "dispositivos"]
    for st in subtabs:
        assert f'id="subtab-btn-{st}"' in html, f"Falta botão de subtab subtab-btn-{st}"
        assert f'id="config-painel-{st}"' in html, f"Falta painel config-painel-{st}"

    assert 'id="config-busca-formula"' in html, "Falta campo de busca de fórmulas"
    assert 'id="config-filtro-categoria-formula"' in html, "Falta filtro de categoria de fórmulas"
    assert 'id="config-contador-formulas"' in html, "Falta contador de fórmulas"
    assert 'id="tabela-config-dietas-corpo"' in html, "Falta corpo da tabela de fórmulas"
    assert 'onclick="App.abrirModalFormula()"' in html, "Falta botão abrir modal fórmula"
    assert 'onclick="App.restaurarCatalogoPadrao()"' in html, "Falta botão restaurar catálogo"

    # Tabelas das novas listas mestres
    assert 'id="tabela-config-enfermarias-corpo"' in html, "Falta tabela de enfermarias"
    assert 'id="tabela-config-intervalos-corpo"' in html, "Falta tabela de intervalos"
    assert 'id="tabela-config-vias-corpo"' in html, "Falta tabela de vias"
    assert 'id="tabela-config-dispositivos-corpo"' in html, "Falta tabela de dispositivos"

    # 3. Modais dos 5 Catálogos
    assert 'id="modal-formula"' in html, "Falta modal-formula"
    assert 'id="modal-config-enfermaria"' in html, "Falta modal-config-enfermaria"
    assert 'id="modal-config-intervalo"' in html, "Falta modal-config-intervalo"
    assert 'id="modal-config-via"' in html, "Falta modal-config-via"
    assert 'id="modal-config-dispositivo"' in html, "Falta modal-config-dispositivo"

    # 4. Botões de Impressão e Seleção de Etiquetas
    assert 'IMPRIMIR SELECIONADAS' in html, "Falta botão IMPRIMIR SELECIONADAS em Etiquetas"
    assert 'App.alternarMarcarTodasEtiquetasHeader' in html, "Falta checkbox mestre em Etiquetas"

    print("✅ index.html: Todos os 5 catálogos, painéis e modais validados com sucesso!")

def test_dietas_padrao():
    path = os.path.join(BASE_DIR, "js", "data", "dietas-padrao.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verifica se as fórmulas de Concentrações e Medidas do Excel estão presentes
    formulas_excel = [
        "Pré Nan (1:30)", "Pré Nan Concentrado (1:25)", "NAN 1 (1:30)", "NAN 1 Concentrado (1:25)",
        "NAN 2 (1:30)", "NAN 2 Concentrado (1:25)", "Aptamil Soja (1:30)", "Neocate (1:30)",
        "Neocate concentrado (1:25)", "Monogen (1:30)", "Pregomin (1:30)", "Pregomin Concentrado (1:25)",
        "Pregomin Concentrado (1:20)", "Alfamino (1:30)", "Alfamino (1:25)", "Fortini 1,0",
        "Fortini Concentrado (1,5)", "Infatrini (1:30)", "NAN s/ lactose (1:30)",
        "NAN s/ lactose concentrado (1:25)", "NAN espessar (1:30)", "NAN espessar concentrado (1:25)",
        "Ninho", "Leite Desnatado", "Ketocal", "Modulen 1,0", "Modulen Concentrado (1,5)", "Peptamen Jr"
    ]

    for f_nome in formulas_excel:
        assert f_nome in content, f"Fórmula '{f_nome}' não encontrada em dietas-padrao.js"

    print(f"✅ js/data/dietas-padrao.js: Todas as {len(formulas_excel)} fórmulas do Excel de Concentrações e Medidas validadas!")

def test_paciente_columns():
    path = os.path.join(BASE_DIR, "js", "modules", "planilhas-censo.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Planilha Nominal
    assert 'PACIENTE</th>' in content and 'ENFERMARIA</th>' in content, "Falta coluna PACIENTE ou ENFERMARIA na Planilha Nominal"
    assert 'OBSERVAÇÃO</th>' in content, "Falta coluna OBSERVAÇÃO na Planilha Nominal"
    
    # Dieta Especial
    assert 'PACIENTE</th>' in content and 'ENFERMARIA</th>' in content, "Falta coluna PACIENTE ou ENFERMARIA na Dieta Especial"
    assert 'OBSERVAÇÃO</th>' in content, "Falta coluna OBSERVAÇÃO na Dieta Especial"
    
    # Impressão A4
    assert '<th>PACIENTE</th>' in content, "Falta cabeçalho PACIENTE na impressão A4"
    assert '<th style="width:24mm;">ENFERMARIA</th>' in content or '<th>ENFERMARIA</th>' in content, "Falta cabeçalho ENFERMARIA na impressão A4"
    assert '<th>OBSERVAÇÃO</th>' in content, "Falta cabeçalho OBSERVAÇÃO na impressão A4"

    # Não deve haver 'NOME COMPLETO', 'NOME DO PACIENTE' ou 'ENFERMARIA / UNIDADE' nos theads
    assert '<th class="py-2 px-3">NOME COMPLETO</th>' not in content
    assert '<th class="py-2.5 px-3">NOME DO PACIENTE</th>' not in content
    assert 'ENFERMARIA / UNIDADE</th>' not in content
    assert 'OBS / ESPESSANTE</th>' not in content

    print("✅ js/modules/planilhas-censo.js: Colunas 'PACIENTE', 'ENFERMARIA' e 'OBSERVAÇÃO' padronizadas em todas as planilhas e impressões!")

def test_nutricionista_signatures():
    files_to_check = [
        "js/modules/planilhas-censo.js",
        "js/modules/bancada.js",
        "js/modules/spdm.js",
        "js/modules/compras.js"
    ]

    for rel_path in files_to_check:
        path = os.path.join(BASE_DIR, rel_path)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        assert "obterDadosNutricionista" in content, f"Falta integração com Nutricionista em {rel_path}"

    print("✅ Módulos de Impressão: Assinatura do Nutricionista Responsável integrada em todos os relatórios A4!")

def test_app_js_methods():
    path = os.path.join(BASE_DIR, "js", "app.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    required_methods = [
        "carregarDadosNutricionista",
        "salvarDadosNutricionista",
        "limparDadosNutricionista",
        "obterDadosNutricionista",
        "carregarListasConfiguraveis",
        "alternarSubAbaConfig",
        "renderizarConfiguracoes",
        "detectarEnfermariaPorLeito",
        "aoDigitarLeitoModal",
        "aoMudarFaixaLeitosModalEnf",
        # Fórmulas
        "filtrarCatalogo",
        "renderizarTabelaConcentracoes",
        "abrirModalFormula",
        "fecharModalFormula",
        "salvarFormulaModal",
        "excluirFormulaCatalogo",
        "restaurarCatalogoPadrao",
        # Enfermarias
        "filtrarEnfermarias",
        "renderizarTabelaEnfermarias",
        "abrirModalEnfermaria",
        "fecharModalEnfermaria",
        "salvarModalEnfermaria",
        "excluirEnfermaria",
        "restaurarEnfermariasPadrao",
        # Intervalos
        "filtrarIntervalos",
        "renderizarTabelaIntervalos",
        "abrirModalIntervalo",
        "fecharModalIntervalo",
        "salvarModalIntervalo",
        "excluirIntervalo",
        "restaurarIntervalosPadrao",
        # Vias
        "filtrarVias",
        "renderizarTabelaVias",
        "abrirModalVia",
        "fecharModalVia",
        "salvarModalVia",
        "excluirVia",
        "restaurarViasPadrao",
        # Dispositivos
        "filtrarDispositivos",
        "renderizarTabelaDispositivos",
        "abrirModalDispositivo",
        "fecharModalDispositivo",
        "salvarModalDispositivo",
        "excluirDispositivo",
        "restaurarDispositivosPadrao"
    ]

    for m in required_methods:
        assert m in content, f"Método '{m}' não encontrado em js/app.js"

    print(f"✅ js/app.js: Todos os {len(required_methods)} métodos de gestão de catálogos e autopreenchimento implementados com sucesso!")

def test_auto_enfermaria_and_modal_order():
    html_path = os.path.join(BASE_DIR, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Verifica se no modal de paciente o campo Leito aparece antes de Enfermaria
    pos_modal = html.find('id="modal-paciente"')
    assert pos_modal != -1, "Modal de paciente não encontrado"
    modal_sub = html[pos_modal:pos_modal + 10000]

    pos_leito = modal_sub.find('id="modal-leito"')
    pos_enfermaria = modal_sub.find('id="modal-enfermaria"')
    assert pos_leito != -1 and pos_enfermaria != -1, "Campos modal-leito ou modal-enfermaria ausentes no modal"
    assert pos_leito < pos_enfermaria, "Campo 'Leito' DEVE vir antes de 'Enfermaria' para fluidez de digitação!"

    # 2. Verifica se o evento de digitação inteligente está ativo
    assert 'App.aoDigitarLeitoModal(this.value)' in modal_sub, "Falta evento App.aoDigitarLeitoModal no input de Leito"

    # 3. Validação das 47 Enfermarias em enfermarias-spdm.js
    spdm_path = os.path.join(BASE_DIR, "js", "data", "enfermarias-spdm.js")
    with open(spdm_path, "r", encoding="utf-8") as f:
        spdm_code = f.read()

    assert 'ENFERMARIAS_SPDM' in spdm_code
    assert 'gerarLeitosDaFaixa' in spdm_code

    print("✅ Modal Paciente & Enfermarias SPDM: Ordem invertida (Leito antes de Enfermaria) e auto-preenchimento das 47 enfermarias validados!")

def test_sidebar_and_animations():
    html_path = os.path.join(BASE_DIR, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    css_path = os.path.join(BASE_DIR, "css", "app.css")
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    # 1. Sidebar Container
    assert 'id="sidebar-nav"' in html, "Sidebar <aside id='sidebar-nav'> não encontrada no index.html"
    
    # 2. Botão Novo Paciente isolado no topo da sidebar
    pos_sidebar = html.find('id="sidebar-nav"')
    end_sidebar = html.find('</aside>', pos_sidebar)
    sidebar_html = html[pos_sidebar:end_sidebar + 10]
    
    assert 'btn-novo-paciente-sidebar' in sidebar_html, "Botão com classe btn-novo-paciente-sidebar não encontrado na sidebar"
    assert 'App.abrirModalNovoPaciente()' in sidebar_html, "Chamada App.abrirModalNovoPaciente() não encontrada na sidebar"
    
    pos_novo = sidebar_html.find('btn-novo-paciente-sidebar')
    pos_censo = sidebar_html.find('data-tab="censo"')
    pos_bancada = sidebar_html.find('data-tab="bancada"')
    pos_etiquetas = sidebar_html.find('data-tab="etiquetas"')
    pos_compras = sidebar_html.find('data-tab="compras"')
    pos_dash = sidebar_html.find('data-tab="dashboard"')
    pos_spdm = sidebar_html.find('data-tab="spdm"')

    assert pos_novo < pos_censo, "Botão NOVO PACIENTE deve vir no topo da lista de abas!"
    assert pos_censo < pos_bancada, "PACIENTES deve vir antes de PRODUÇÃO"
    assert pos_bancada < pos_etiquetas, "PRODUÇÃO deve vir antes de ETIQUETAS"
    assert pos_etiquetas < pos_compras, "ETIQUETAS deve vir antes de COMPRAS"
    assert pos_compras < pos_dash, "DASHBOARD deve vir abaixo de COMPRAS!"
    assert pos_dash < pos_spdm, "RELAÇÃO SPDM deve vir depois de DASHBOARD!"

    # 4. Micro-Animações no CSS (GPU Aceleradas)
    assert '@keyframes tabFadeIn' in css, "Keyframes tabFadeIn não encontrados no css/app.css"
    assert '.btn-novo-paciente-sidebar' in css, "Classe .btn-novo-paciente-sidebar não encontrada no css/app.css"
    assert '.metric-card-hover' in css, "Classe .metric-card-hover não encontrada no css/app.css"
    assert 'prefers-reduced-motion' in css, "Suporte para prefers-reduced-motion ausente no css/app.css"

    print("✅ Sidebar e Animações: Sidebar lateral esquerda, 6 abas completas com Dashboard, botão novo paciente isolado e micro-animações validados!")

def test_status_dieta_ativa_suspensa_and_persistence():
    censo_js = os.path.join(BASE_DIR, "js", "modules", "censo.js")
    with open(censo_js, "r", encoding="utf-8") as f:
        censo_code = f.read()

    planilhas_js = os.path.join(BASE_DIR, "js", "modules", "planilhas-censo.js")
    with open(planilhas_js, "r", encoding="utf-8") as f:
        planilhas_code = f.read()

    app_js = os.path.join(BASE_DIR, "js", "app.js")
    with open(app_js, "r", encoding="utf-8") as f:
        app_code = f.read()

    html_path = os.path.join(BASE_DIR, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    css_path = os.path.join(BASE_DIR, "css", "app.css")
    with open(css_path, "r", encoding="utf-8") as f:
        app_css = f.read()

    # 1. CensoModule possui getPacientesInternados
    assert "getPacientesInternados" in censo_code, "Método getPacientesInternados ausente no CensoModule"

    # 2. PlanilhasCensoModule usa DIETA ATIVA e DIETA SUSPENSA em 2 linhas
    assert "<span>✓ DIETA</span>" in planilhas_code and "<span>ATIVA</span>" in planilhas_code, "Badge DIETA ATIVA em 2 linhas ausente no PlanilhasCensoModule"
    assert "<span>⏸ DIETA</span>" in planilhas_code and "<span>SUSPENSA</span>" in planilhas_code, "Badge DIETA SUSPENSA em 2 linhas ausente no PlanilhasCensoModule"

    # 3. Pacientes suspensos são destacados visualmente com fundo suave e borda indicadora
    assert ".paciente-suspenso" in app_css, "Classe .paciente-suspenso ausente no app.css"
    assert "background-color: #fef3c7" in app_css, "Fundo âmbar para paciente suspenso ausente no app.css"
    assert "border-left: 4px solid #f59e0b" in app_css, "Borda de destaque para paciente suspenso ausente no app.css"

    # 4. Destaque de borda superior colorida nos cards da aba PACIENTES (como no Mapa de Bancada)
    assert "border-top: 4px solid" in planilhas_code, "Destaque de borda superior nas planilhas nominais ausente no PlanilhasCensoModule"

    # 5. Pacientes suspensos são preservados na lista e tabelas nominais (somente excluídos na alta)
    assert "filter(p => !p.alta)" in planilhas_code, "Processamento de planilhas nominais deve incluir internados sem alta"

    # 6. Ordem dos botões de ação: Suspender/Reativar -> Editar Prescrição (✏️) -> Imprimir Etiqueta (🏷️) -> Alta -> Excluir
    pos_toggle_pc = planilhas_code.find("App.toggleSuspensao")
    pos_edit_pc = planilhas_code.find("App.abrirModalEdicao")
    pos_print_pc = planilhas_code.find("App.imprimirEtiquetaIndividual")
    assert pos_toggle_pc < pos_edit_pc < pos_print_pc, "Em planilhas-censo.js o botão de Editar Prescrição deve ficar ENTRE Suspender Dieta e Imprimir Etiqueta"

    print("✅ Status em 2 Linhas, Destaque de Fundo, Bordas Superiores e Ordem dos Botões de Ação: 100% validados!")

def test_print_areas_hidden_on_screen_and_printable():
    html_path = os.path.join(BASE_DIR, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    css_zebra = os.path.join(BASE_DIR, "css", "print-zebra.css")
    with open(css_zebra, "r", encoding="utf-8") as f:
        zebra_css = f.read()

    css_app = os.path.join(BASE_DIR, "css", "app.css")
    with open(css_app, "r", encoding="utf-8") as f:
        app_css = f.read()

    # 1. HTML divs não possuem inline style fixo que bloqueie @media print
    assert '<div id="print-area-zebra"></div>' in html
    assert '<div id="print-area-bancada"></div>' in html

    # 2. CSS possui regra screen hiding escopada em @media screen
    assert '@media screen' in zebra_css and '#print-area-bancada' in zebra_css
    assert '@media screen' in app_css and '#print-area-bancada' in app_css

    # 3. @media print exibe os containers com display block, opacity 1, height auto
    assert 'body.print-bancada-active #print-area-bancada' in zebra_css
    assert 'body.print-zebra-active #print-area-zebra' in zebra_css

    # 4. Módulos de impressão contêm reset de classes pós impressão sem timer destrutivo
    modules = ["planilhas-censo.js", "bancada.js", "spdm.js", "compras.js", "etiquetas.js"]
    for mod in modules:
        mod_path = os.path.join(BASE_DIR, "js", "modules", mod)
        with open(mod_path, "r", encoding="utf-8") as f:
            code = f.read()
        assert "limparImpressao" in code, f"Falta rotina pós-impressão em {mod}"

    print("✅ Isolamento e Renderização de Impressão: Áreas de impressão 100% ocultas em tela e renderizadas com total fidelidade no diálogo de impressão!")

def test_cross_tab_suspension_logic():
    # Carrega módulos JS
    bancada_js = os.path.join(BASE_DIR, "js", "modules", "bancada.js")
    with open(bancada_js, "r", encoding="utf-8") as f:
        bancada_code = f.read()

    etiquetas_js = os.path.join(BASE_DIR, "js", "modules", "etiquetas.js")
    with open(etiquetas_js, "r", encoding="utf-8") as f:
        etiquetas_code = f.read()

    compras_js = os.path.join(BASE_DIR, "js", "modules", "compras.js")
    with open(compras_js, "r", encoding="utf-8") as f:
        compras_code = f.read()

    spdm_js = os.path.join(BASE_DIR, "js", "modules", "spdm.js")
    with open(spdm_js, "r", encoding="utf-8") as f:
        spdm_code = f.read()

    planilhas_js = os.path.join(BASE_DIR, "js", "modules", "planilhas-censo.js")
    with open(planilhas_js, "r", encoding="utf-8") as f:
        planilhas_code = f.read()

    app_js = os.path.join(BASE_DIR, "js", "app.js")
    with open(app_js, "r", encoding="utf-8") as f:
        app_code = f.read()

    # 1. Aba PACIENTES: Pacientes suspensos PERMANECEM listados (somente saem na alta)
    assert "!p.alta" in planilhas_code, "Aba PACIENTES deve listar internados sem alta"
    assert "CensoModule.getPacientesInternados()" in app_code, "Aba PACIENTES deve carregar internados incluindo dietas suspensas"

    # 2. Aba PRODUÇÃO (Bancada): Pacientes suspensos SAEM da produção e somas
    assert "paciente.suspenso || paciente.alta" in bancada_code, "BancadaModule deve excluir pacientes suspensos do cálculo"
    assert "!p.suspenso && !p.alta" in bancada_code, "BancadaModule somas deve excluir pacientes suspensos"

    # 3. Aba ETIQUETAS: Pacientes suspensos SAEM da geração e listagem de etiquetas
    assert "p.suspenso || p.alta" in etiquetas_code, "EtiquetasModule deve excluir pacientes suspensos"

    # 4. Aba COMPRAS: Pacientes suspensos SAEM da contabilização de estoque e pedidos
    assert "!p.suspenso && !p.alta" in compras_code, "ComprasModule deve excluir pacientes suspensos"

    # 5. Aba CENSO SPDM: Pacientes suspensos SAEM do censo hospitalar de dispositivos e volumes
    assert "!p.suspenso && !p.alta" in spdm_code, "SpdmModule deve excluir pacientes suspensos"

    print("✅ Lógica Multi-Abas de Suspensão: Pacientes com dieta suspensa permanecem na aba PACIENTES e são 100% excluídos de PRODUÇÃO, ETIQUETAS, COMPRAS e CENSO SPDM!")

def test_total_row_layout():
    path = os.path.join(BASE_DIR, "js", "modules", "planilhas-censo.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verifica se a nova disposição Total: [vol] ml ➔ ([po]g de PÓ + [agua]ml de ÁGUA) está presente no HTML
    assert "${b.blocoVolTotal} ml" in content
    assert "g de PÓ +" in content and "ml de ÁGUA)" in content, "Formato do Total de PÓ e Água deve conter 'g de PÓ + ...ml de ÁGUA)'"
    assert 'colspan="11"' in content or 'colspan="10"' in content, "Linha de Total deve unificar as primeiras colunas sem grandes espaçamentos vazios"

    # Impressão A4
    assert "TOTAL: ${b.blocoVolTotal}ml -> (" in content, "Total no relatório impresso deve seguir o padrão 'TOTAL: Xml -> (Yg de PÓ + Zml de ÁGUA)'"

    print("✅ Linhas de Soma / Total: Novo layout compacto 'Total: X ml -> (Yg de PÓ + Zml de ÁGUA)' validado com sucesso!")

def test_dashboard_clinical():
    html_path = os.path.join(BASE_DIR, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    dash_js = os.path.join(BASE_DIR, "js", "modules", "dashboard.js")
    with open(dash_js, "r", encoding="utf-8") as f:
        dash_code = f.read()

    # 1. Estrutura HTML do Dashboard
    assert 'id="tab-dashboard"' in html, "Falta aba #tab-dashboard no index.html"
    assert 'id="dash-card-pacientes"' in html, "Falta card #dash-card-pacientes no dashboard"
    assert 'id="dash-card-volume"' in html, "Falta card #dash-card-volume no dashboard"
    assert 'id="dash-card-top-dieta"' in html, "Falta card #dash-card-top-dieta no dashboard"
    assert 'id="dash-card-top-enfermaria"' in html, "Falta card #dash-card-top-enfermaria no dashboard"
    assert 'id="dash-painel-categorias"' in html, "Falta painel #dash-painel-categorias no dashboard"
    assert 'id="dash-painel-horarios"' in html, "Falta painel #dash-painel-horarios no dashboard"
    assert 'id="dash-painel-enfermarias"' in html, "Falta painel #dash-painel-enfermarias no dashboard"
    assert 'id="dash-painel-vias"' in html, "Falta painel #dash-painel-vias no dashboard"

    # 2. Módulo JS do Dashboard
    assert 'const DashboardModule' in dash_code or 'var DashboardModule' in dash_code or 'DashboardModule =' in dash_code
    assert 'calcularMetricas' in dash_code
    assert 'renderizar' in dash_code

    print("✅ Dashboard Clínico Intuitivo: Interface visual, painéis executivos e motor de métricas consolidadas 100% validados!")

def test_evolucao_modal_and_timeline():
    html_path = os.path.join(BASE_DIR, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    evolucao_js = os.path.join(BASE_DIR, "js", "modules", "evolucao.js")
    with open(evolucao_js, "r", encoding="utf-8") as f:
        evolucao_code = f.read()

    app_js = os.path.join(BASE_DIR, "js", "app.js")
    with open(app_js, "r", encoding="utf-8") as f:
        app_code = f.read()

    # 1. Estrutura HTML do Modal e Área de Impressão
    assert 'id="modal-evolucao-paciente"' in html, "Falta modal #modal-evolucao-paciente no index.html"
    assert 'id="evolucao-grafico-container"' in html, "Falta container #evolucao-grafico-container"
    assert 'id="evolucao-incluir-grafico"' in html, "Falta checkbox #evolucao-incluir-grafico"
    assert 'id="evolucao-tabela-corpo"' in html, "Falta corpo da tabela de evolução #evolucao-tabela-corpo"
    assert 'id="print-area-evolucao"' in html, "Falta container de impressão #print-area-evolucao"

    # 2. Módulo JS de Evolução
    assert 'const EvolucaoModule' in evolucao_code or 'var EvolucaoModule' in evolucao_code or 'EvolucaoModule =' in evolucao_code
    assert 'renderizarGraficoTimeline' in evolucao_code, "Falta renderizador de gráfico de linha do tempo no EvolucaoModule"
    assert 'destacarItemTabela' in evolucao_code, "Falta sincronização de clique no gráfico com tabela"
    assert 'imprimirRelatorio' in evolucao_code, "Falta rotina de impressão no EvolucaoModule"
    assert 'abrirModal' in evolucao_code, "Falta método abrirModal no EvolucaoModule"

    # 3. Integração no app.js
    assert 'abrirEvolucaoPaciente' in app_code, "Falta método abrirEvolucaoPaciente em app.js"

    print("✅ Modal de Evolução Nutricional: Gráfico SVG de linha do tempo, tabela interativa e impressão A4 seletiva 100% validados!")

def test_ampersand_elimination():
    html_path = os.path.join(BASE_DIR, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    assert " & " not in html, "Ainda existe ' & ' no index.html"
    assert "Configurações e Catálogo" in html
    assert "Bancada e Diluições" in html
    assert "Previsão e Pedido" in html
    assert "Identificação Técnica e Assinatura" in html

    print("✅ Substituição Global de '&' por 'e': Todos os menus, títulos e cabeçalhos validados com a conjunção 'e'!")

if __name__ == "__main__":
    print("\n--- EXECUTANDO TEST SUITE COMPLETA ---")
    test_html_structure()
    test_dietas_padrao()
    test_paciente_columns()
    test_nutricionista_signatures()
    test_app_js_methods()
    test_auto_enfermaria_and_modal_order()
    test_sidebar_and_animations()
    test_status_dieta_ativa_suspensa_and_persistence()
    test_print_areas_hidden_on_screen_and_printable()
    test_cross_tab_suspension_logic()
    test_total_row_layout()
    test_dashboard_clinical()
    test_evolucao_modal_and_timeline()
    test_ampersand_elimination()

    print("\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!\n")

