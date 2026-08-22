#!/usr/bin/env python3
"""
Gerador de PDF de Alta Qualidade: Manual Prático de Impressão de Etiquetas Térmicas (Zebra ZD230 • 100mm × 45mm)
Lactário Digital HSP / NutriLac - Hospital São Paulo (UNIFESP-EPM)
"""

import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_PDF = os.path.join(BASE_DIR, "manual_para_impressao.pdf")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Cabeçalho decorativo (páginas > 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#581C87"))
            self.drawString(40, 805, "HOSPITAL SÃO PAULO / UNIFESP-EPM • LACTÁRIO DIGITAL")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(555, 805, "Manual de Impressão Térmica (Zebra ZD230)")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(40, 798, 555, 798)

        # Rodapé em todas as páginas
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(40, 45, 555, 45)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(40, 32, "Lactário HSP / NutriLac — Medida Oficial: 100mm × 45mm (203 DPI)")
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(555, 32, page_str)
        
        self.restoreState()

def gerar_manual_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=55,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()

    # Estilos customizados
    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#FFFFFF"),
        alignment=0
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#FBCFE8"),
        alignment=0
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#4A044E"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor("#6B21A8"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor("#1E293B"),
        leftIndent=12,
        spaceAfter=3
    )

    tip_style = ParagraphStyle(
        'TipCustom',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#065F46")
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # 1. Banner Principal de Capa
    header_data = [
        [
            Paragraph("🏷️ MANUAL PRÁTICO DE IMPRESSÃO DE ETIQUETAS TÉRMICAS", title_style),
        ],
        [
            Paragraph("LACTÁRIO DIGITAL HSP / NUTRILAC • HOSPITAL SÃO PAULO (UNIFESP-EPM)<br/><b>Hardware:</b> Zebra ZD230 (203 DPI) • <b>Dimensão Oficial da Etiqueta:</b> 100mm × 45mm", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[515])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#4A044E")),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # Box de Introdução Rápida
    intro_data = [[
        Paragraph(
            "<b>Finalidade deste Guia:</b> Orientar nutricionistas e técnicas do lactário no procedimento passo a passo de preparação física da impressora Zebra ZD230, calibração do sensor de espaçamento (GAP), configuração da estação de trabalho e rotina diária de impressão contínua por turnos.",
            tip_style
        )
    ]]
    intro_table = Table(intro_data, colWidths=[515])
    intro_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ECFDF5")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#A7F3D0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(intro_table)
    story.append(Spacer(1, 8))

    # =========================================================================
    # SEÇÃO 1: PREPARAÇÃO FÍSICA DA IMPRESSORA
    # =========================================================================
    story.append(Paragraph("1. Preparação Física da Impressora Zebra ZD230 na Bancada", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=6))
    
    story.append(Paragraph("<b>1.1 Conexões Básicas:</b> Conecte o cabo de força na tomada e o cabo USB no computador da bancada. Ligue a chave na parte traseira da impressora (a luz redonda frontal ficará verde sólida).", bullet_style))
    story.append(Paragraph("<b>1.2 Abertura da Tampa:</b> Puxe simultaneamente as duas travas plásticas amarelas laterais para a frente e levante a tampa superior da impressora.", bullet_style))
    story.append(Paragraph("<b>1.3 Inserção da Bobina de Etiquetas (100mm × 45mm):</b> Encaixe o rolo de etiquetas adesivas no suporte central amarelo. O lado adesivo/sensível deve ficar virado para <b>CIMA</b>.", bullet_style))
    story.append(Paragraph("<b>1.4 Ajuste das Guias Amarelas:</b> Passe a fita de etiquetas por baixo das duas guias plásticas amarelas na saída frontal. Gire suavemente a rodinha amarela até que as guias encostem nas laterais da etiqueta (a etiqueta deve deslizar livremente, sem folga lateral e sem amassar as bordas).", bullet_style))
    story.append(Paragraph("<b>1.5 Travamento da Tampa:</b> Baixe a tampa superior e pressione firmemente para baixo até ouvir o <b>clique de travamento</b> em ambos os lados.", bullet_style))

    story.append(Spacer(1, 8))

    # =========================================================================
    # SEÇÃO 2: CALIBRAÇÃO DO SENSOR DE GAP
    # =========================================================================
    story.append(Paragraph("2. Calibração Rápida do Sensor de Espaçamento (GAP)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=6))
    
    story.append(Paragraph("<i>Realize este procedimento sempre que trocar o rolo de etiquetas ou caso a impressão comece a sair fora do centro da etiqueta física.</i>", body_style))

    gap_steps = [
        ["Passo 1", "Com a impressora ligada e com a luz frontal em verde contínuo:"],
        ["Passo 2", "Pressione e <b>mantenha pressionado</b> o botão redondo frontal (Feed)."],
        ["Passo 3", "Observe a luz verde piscar em sequência:<br/>• Pisca 1 vez $\\rightarrow$ Continue segurando.<br/>• Pisca <b>2 vezes seguidas (* *)</b> $\\rightarrow$ <b>SOLTE O BOTÃO IMEDIATAMENTE!</b>"],
        ["Passo 4", "A impressora puxará 2 a 3 etiquetas para fazer a leitura óptica do espaçamento (GAP) e parará exatamente na linha de corte serrilhada."],
        ["Passo 5", "Aperte o botão uma vez: deve avançar exatamente 1 etiqueta por clique. Calibração concluída!"]
    ]
    gap_table = Table([[Paragraph(f"<b>{row[0]}</b>", body_style), Paragraph(row[1], body_style)] for row in gap_steps], colWidths=[65, 450])
    gap_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(gap_table)

    story.append(Spacer(1, 10))

    # =========================================================================
    # SEÇÃO 3: CONFIGURAÇÃO NO COMPUTADOR DA BANCADA
    # =========================================================================
    story.append(Paragraph("3. Configuração no Computador da Bancada (Suporte Duplo)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=6))
    
    story.append(Paragraph("O sistema NutriLac possui um motor duplo inteligente: <b>ZPL Direto</b> para máxima velocidade e <b>Modo Navegador</b> para contingência.", body_style))

    # Box Opção A
    op_a_data = [
        [Paragraph("<b>🌟 OPÇÃO A (Recomendada): Impressão Rápida em 1-Clique (ZPL II Direto)</b>", ParagraphStyle('H', fontName='Helvetica-Bold', fontSize=9.5, textColor=colors.HexColor("#1E3A8A")))],
        [Paragraph("<b>Vantagens:</b> 1 único clique, sem abrir janelas do navegador, envio de 100 etiquetas em 0.2 segundos, sem risco de travamento do Windows.<br/>"
                   "<b>1. Instalação Única:</b> Baixe o instalador gratuito oficial <font color='#2563EB'><u>Zebra Browser Print para Windows</u></font> no site da Zebra e instale com o assistente padrão.<br/>"
                   "<b>2. Manter Ativo:</b> O aplicativo rodará discretamente na bandeja do sistema (ao lado do relógio do Windows).<br/>"
                   "<b>3. Confirmação no Sistema:</b> Ao entrar na aba <b>ETIQUETAS</b> no NutriLac, o banner exibirá a etiqueta verde: <b>[ ⚡ Zebra ZD230 Online (ZPL) ]</b>.", body_style)]
    ]
    op_a_table = Table(op_a_data, colWidths=[515])
    op_a_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFF6FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#93C5FD")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(op_a_table)
    story.append(Spacer(1, 6))

    # Box Opção B
    op_b_data = [
        [Paragraph("<b>🌐 OPÇÃO B: Modo Navegador Padrão (Sem Instalar Nada / Fallback)</b>", ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=9.5, textColor=colors.HexColor("#701A75")))],
        [Paragraph("<b>Utilização:</b> Caso esteja em um notebook temporário sem o aplicativo da Zebra instalado.<br/>"
                   "<b>1. Status:</b> O sistema exibirá a tag roxa <b>[ 🌐 Modo Navegador (HTML) ]</b>.<br/>"
                   "<b>2. Janela do Chrome:</b> Ao clicar em IMPRIMIR, a janela de impressão abrirá normalmente.<br/>"
                   "<b>3. Configuração do Chrome (apenas 1ª vez):</b><br/>"
                   "&nbsp;&nbsp;• <b>Destino:</b> Selecionar a impressora <i>ZDesigner ZD230</i>.<br/>"
                   "&nbsp;&nbsp;• <b>Tamanho do Papel:</b> Selecionar <i>100mm × 45mm</i> (ou User Defined).<br/>"
                   "&nbsp;&nbsp;• <b>Margens:</b> Escolher <b>Nenhuma (None)</b> &nbsp;|&nbsp; <b>Escala:</b> <b>100%</b>.<br/>"
                   "&nbsp;&nbsp;• <b>Opções:</b> Desmarcar <i>Cabeçalhos e rodapés</i> e Marcar <i>Gráficos de segundo plano</i>.", body_style)]
    ]
    op_b_table = Table(op_b_data, colWidths=[515])
    op_b_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FDF4FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#F5D0FE")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(op_b_table)

    story.append(Spacer(1, 10))

    # =========================================================================
    # SEÇÃO 4: ROTINA DIÁRIA DE IMPRESSÃO
    # =========================================================================
    story.append(Paragraph("4. Rotina Diária de Impressão para as Nutricionistas", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=6))
    
    rotina_data = [
        [
            Paragraph("<b>Etapa 1: Acessar a Central</b>", body_style),
            Paragraph("No menu lateral esquerdo do sistema, clique na aba <b>🏷️ ETIQUETAS</b>.", body_style)
        ],
        [
            Paragraph("<b>Etapa 2: Selecionar o Turno</b>", body_style),
            Paragraph("No filtro superior de <b>Turno</b>, selecione o período da produção:<br/>"
                      "• <b>☀️ MANHÃ/TARDE (12:00 às 18:00):</b> Frascos do 1º período diurno.<br/>"
                      "• <b>🌙 NOITE/MADRUGADA (20:00 às 10:00):</b> Frascos do período noturno e manhã seguinte.<br/>"
                      "• <b>🔄 TODOS OS HORÁRIOS:</b> Todos os frascos do dia de uma só vez.", body_style)
        ],
        [
            Paragraph("<b>Etapa 3: Seleção de Pacientes</b>", body_style),
            Paragraph("Clique em <b>Marcar Todos</b> para selecionar toda a lista filtrada, ou marque as caixas de seleção (SEL) apenas dos leitos desejados.", body_style)
        ],
        [
            Paragraph("<b>Etapa 4: Teste de Calibração</b>", body_style),
            Paragraph("<i>(Opcional / Recomendado no início do plantão):</i> Clique no botão cinza <b>🧪 TESTE ZPL (100×45)</b> para emitir 1 etiqueta modelo e conferir o alinhamento da bobina.", body_style)
        ],
        [
            Paragraph("<b>Etapa 5: Disparar Impressão</b>", body_style),
            Paragraph("Clique no botão roxo <b>🏷️ IMPRIMIR SELECIONADAS</b>.<br/>"
                      "• <b>No Modo ZPL:</b> A impressora imprimirá instantaneamente em lote contínuo.<br/>"
                      "• <b>No Modo Navegador:</b> Confirme o diálogo clicando no botão azul <i>Imprimir</i>.", body_style)
        ],
        [
            Paragraph("<b>Impressão Individual</b>", body_style),
            Paragraph("Para emitir apenas a etiqueta de 1 paciente que teve a dieta ajustada, clique no ícone <b>🏷️</b> na linha daquele paciente na tabela de Pacientes ou Etiquetas.", body_style)
        ]
    ]
    rotina_table = Table(rotina_data, colWidths=[130, 385])
    rotina_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#F8FAFC")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(rotina_table)

    story.append(Spacer(1, 10))

    # =========================================================================
    # SEÇÃO 5: RESOLUÇÃO DE PROBLEMAS (TROUBLESHOOTING)
    # =========================================================================
    story.append(Paragraph("5. Guia Rápido de Resolução de Dúvidas e Problemas", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=6))
    
    faq_data = [
        [Paragraph("<b>Problema / Mensagem</b>", body_style), Paragraph("<b>Causa Provável</b>", body_style), Paragraph("<b>Como Resolver</b>", body_style)],
        [
            Paragraph("<font color='#B91C1C'><b>Luz frontal piscando em Vermelho</b></font>", body_style),
            Paragraph("Tampa aberta ou rolo de etiquetas vazio.", body_style),
            Paragraph("Verifique se as etiquetas acabaram ou feche a tampa até ouvir o travamento duplo.", body_style)
        ],
        [
            Paragraph("<font color='#B91C1C'><b>Impressão saindo cortada ou pulando etiquetas</b></font>", body_style),
            Paragraph("Sensor de GAP descalibrado após troca da bobina.", body_style),
            Paragraph("Recalibre o GAP: segure o botão frontal até a luz piscar 2 vezes e solte.", body_style)
        ],
        [
            Paragraph("<font color='#B91C1C'><b>Sistema exibe 'Modo Navegador' em vez de ZPL</b></font>", body_style),
            Paragraph("O aplicativo Zebra Browser Print está fechado.", body_style),
            Paragraph("Abra o Zebra Browser Print pelo menu Iniciar do Windows. O sistema mudará para verde automaticamente.", body_style)
        ],
        [
            Paragraph("<font color='#B91C1C'><b>Texto impresso muito claro ou falhado</b></font>", body_style),
            Paragraph("Resíduos de poeira térmica na cabeça de impressão.", body_style),
            Paragraph("Passe levemente um cotonete com álcool isopropílico na barra preta térmica interna.", body_style)
        ]
    ]
    faq_table = Table(faq_data, colWidths=[140, 135, 240])
    faq_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(faq_table)

    # Construir documento PDF com NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ PDF gerado com sucesso: {OUTPUT_PDF}")

if __name__ == "__main__":
    gerar_manual_pdf()
