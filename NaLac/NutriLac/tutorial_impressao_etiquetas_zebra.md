# 🏷️ Tutorial e Manual Prático de Impressão de Etiquetas Térmicas (Zebra ZD230)
### Lactário Digital HSP / NutriLac • Medida Oficial: 100mm × 45mm

Este manual foi elaborado para orientar as **nutricionistas e técnicas do lactário** no passo a passo prático de preparação física da impressora, configuração do computador e rotina diária de impressão das etiquetas térmicas dos frascos e mamadeiras.

---

## 📌 Sumário
1. [Preparação Física da Impressora Zebra ZD230](#1-preparação-física-da-impressora-zebra-zd230)
2. [Calibração do Sensor de Espaçamento (GAP)](#2-calibração-do-sensor-de-espaçamento-gap)
3. [Configuração no Computador da Bancada](#3-configuração-no-computador-da-bancada)
   - [Opção A (Recomendada): Impressão Rápida em 1-Clique (ZPL Direto)](#opção-a-recomendada-impressão-rápida-em-1-clique-zpl-direto)
   - [Opção B: Modo Navegador Padrão (Sem instalar nada)](#opção-b-modo-navegador-padrão-sem-instalar-nada)
4. [Rotina Diária de Impressão no Sistema](#4-rotina-diária-de-impressão-no-sistema)
5. [Guia de Resolução de Problemas Frequentes (Troubleshooting)](#5-guia-de-resolução-de-problemas-frequentes)

---

## 1. Preparação Física da Impressora Zebra ZD230

1. **Posicionamento:** Certifique-se de que a impressora está ligada na tomada e conectada ao computador pelo cabo USB.
2. **Abrir a Tampa:** Puxe as duas travas amarelas laterais para a frente e levante a tampa superior da impressora.
3. **Colocar a Bobina:**
   - Encaixe o rolo de etiquetas térmicas de **100mm × 45mm** no suporte central amarelo.
   - O lado adesivo/sensível da etiqueta deve ficar virado para cima.
4. **Ajustar as Guias Amarelas:**
   - Passe a fita de etiquetas pelas duas guias plásticas amarelas na frente do rolo.
   - Ajuste a rodinha amarela para que as guias fiquem encostadas nas laterais da etiqueta, sem apertar demais (a etiqueta deve correr livre, sem folga lateral).
5. **Fechar a Tampa:** Feche a tampa pressionando para baixo até ouvir o clique de travamento dos dois lados.

---

## 2. Calibração do Sensor de Espaçamento (GAP)

> 💡 **Quando fazer?** Faça sempre que colocar um rolo novo ou caso perceba que a impressão começou a sair fora do centro da etiqueta.

1. Com a impressora ligada e com luz **verde contínua**:
2. Pressione e mantenha pressionado o **botão frontal redondo (Feed)**.
3. A luz verde vai piscar em sequências:
   - Pisca 1 vez $\rightarrow$ Continue segurando.
   - Pisca 2 vezes seguidas ($\ast$ $\ast$) $\rightarrow$ **Solte o botão imediatamente!**
4. A impressora avançará de 2 a 4 etiquetas para ler o espaçamento (GAP) entre elas e parará exatamente na linha de corte.
5. Pressione o botão uma vez: deve avançar exatamente 1 etiqueta por clique. Pronto! A impressora está calibrada.

---

## 3. Configuração no Computador da Bancada

O sistema conta com **suporte duplo inteligente**:

```
                  ┌─────────────────────────────────────┐
                  │ Interface do Usuário (Central de    │
                  │             Etiquetas)              │
                  └──────────────────┬──────────────────┘
                                     │
                 Verifica se Zebra Browser Print está ativo
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
           SIM (Disponível)                   NÃO (Indisponível)
                    │                                 │
                    ▼                                 ▼
      ┌───────────────────────────┐     ┌───────────────────────────┐
      │  OPÇÃO A: ZPL 1-CLIQUE    │     │  OPÇÃO B: MODO NAVEGADOR  │
      │   (Ultra-rápido / USB)    │     │ (Zero-install / Fallback) │
      └───────────────────────────┘     └───────────────────────────┘
```

---

### Opção A (Recomendada): Impressão Rápida em 1-Clique (ZPL Direto)
*Esta opção permite imprimir lotes de 20 a 100+ etiquetas com 1 único clique, sem abrir janelas de impressão na tela.*

1. **Baixar o Utilitário Gratuito da Zebra:**
   - Acesse: [Zebra Browser Print para Windows](https://www.zebra.com/us/en/support-downloads/software/printer-software/browser-print.html)
   - Baixe e execute o instalador padrão (`Next -> Next -> Finish`).
2. **Executar o Zebra Browser Print:**
   - Ao abrir, ele exibirá um ícone de impressora na barra de tarefas (perto do relógio do Windows).
   - O utilitário detectará automaticamente a sua **Zebra ZD230** conectada via USB.
3. **Autorizar no Navegador (Apenas na Primeira Vez):**
   - Ao abrir o sistema NutriLac no Google Chrome, caso o navegador solicite permissão para conectar com `localhost:9100`, clique em **Permitir / Aceitar**.
4. **Verificar no Sistema:**
   - Na aba **ETIQUETAS**, o banner superior exibirá a tag verde: `⚡ Zebra ZD230 Online (ZPL)`.

---

### Opção B: Modo Navegador Padrão (Sem instalar nada)
*Utilize esta opção caso esteja em um computador temporário onde o utilitário da Zebra ainda não foi instalado.*

1. O sistema exibirá a tag roxa: `🌐 Modo Navegador (HTML)`.
2. Ao clicar em **IMPRIMIR SELECIONADAS**, abrirá a janela padrão de impressão do Google Chrome/Edge.
3. **Configuração Única da Janela do Chrome:**
   - **Destino:** Selecionar a impressora *ZDesigner ZD230* (ou driver Zebra).
   - **Tamanho do Papel:** Selecionar `User Defined` ou `100mm x 45mm`.
   - **Margens:** Escolher **Nenhuma (None)**.
   - **Escala:** **Padrão (100%)**.
   - **Opções:** 
     - ❌ Desmarcar *"Cabeçalhos e rodapés"*.
     - ✅ Marcar *"Gráficos de segundo plano"*.
4. Clique em **Imprimir**.

---

## 4. Rotina Diária de Impressão no Sistema

### Passo 1: Acessar a Central de Etiquetas
No menu lateral esquerdo, clique na aba **ETIQUETAS** (🏷️).

### Passo 2: Filtrar pelo Turno de Produção
No filtro superior de **Turno**, escolha a produção do momento:
- ☀️ **MANHÃ/TARDE (12:00 às 18:00)** $\rightarrow$ Filtra os frascos do primeiro período.
- 🌙 **NOITE/MADRUGADA (20:00 às 10:00)** $\rightarrow$ Filtra os frascos do período noturno e manhã seguinte.
- 🔄 **TODOS OS HORÁRIOS** $\rightarrow$ Emite a grade completa de todas as mamadeiras do dia.

### Passo 3: Selecionar os Pacientes
- Para imprimir todos os pacientes listados no turno, clique em **Marcar Todos**.
- Ou marque individualmente a caixinha de seleção (SEL) dos leitos desejados na tabela.

### Passo 4: Fazer o Teste de Alinhamento (Opcional / Recomendado no Início do Plantão)
- Clique no botão **🧪 TESTE ZPL (100×45)** no topo direito da tela.
- A impressora emitirá 1 etiqueta de demonstração com os blocos pretos e a grade clínica calibrados.

### Passo 5: Disparar a Impressão em Lote
- Clique no botão roxo **🏷️ IMPRIMIR SELECIONADAS**.
- **No Modo ZPL:** A impressora começará a imprimir imediatamente de forma contínua e silenciosa.
- **No Modo Navegador:** A janela de impressão abrirá; basta confirmar no botão azul *"Imprimir"*.

---

## 5. Guia de Resolução de Problemas Frequentes

| Situação Encontrada | Causa Provável | O que fazer? |
| :--- | :--- | :--- |
| **Luz frontal piscando em Vermelho** | Tampa aberta ou fim do rolo de etiquetas. | Verifique se as etiquetas acabaram ou se a tampa foi fechada até travar os dois lados amarelos. |
| **A impressão saiu cortada ou pulando etiquetas** | Sensor de GAP descalibrado após troca de rolo. | Realize a calibração rápida: segure o botão Feed até piscar 2 vezes e solte. |
| **O sistema exibe "Modo Navegador" em vez de "ZPL"** | O Zebra Browser Print está fechado. | Abra o aplicativo *Zebra Browser Print* no menu Iniciar do Windows. O sistema mudará para verde automaticamente. |
| **O texto impresso está muito claro** | Cabeça de impressão fria ou poeira térmica. | Limpe a linha preta da cabeça de impressão com um cotonete levemente umedecido em álcool isopropílico. |
| **Data de validade e término saíram com horários errados** | O cálculo de término é automático (+2h). | O sistema soma automaticamente +2 horas a partir do horário de início do frasco, virando a data caso passe da meia-noite. |
