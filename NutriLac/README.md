# 🏥 Lactário Digital – Hospital São Paulo (UNIFESP-EPM)

> **Solução Hospitalar Integrada para Gestão de Censo, Diluições de Bancada, Impressão Térmica de Etiquetas Zebra e Estimativa de Compras.**

---

## 🎯 1. Visão Geral

O **Lactário Digital** substitui o controle manual em planilhas Excel pelo setor de nutrição e dietética do **Lactário do Hospital São Paulo (UNIFESP-EPM)**. 

O sistema opera com frontend reativo moderno (HTML5/Tailwind CSS/JavaScript) e retaguarda 100% gratuita integrada ao Google Drive (Google Sheets + Google Apps Script), além de funcionar perfeitamente em modo local/offline direto no navegador.

---

## 🌟 2. Principais Módulos e Recursos

| Módulo | Descrição e Regras de Negócio |
|---|---|
| 📋 **Censo de Pacientes** | Cadastro, busca instantânea e filtros por enfermaria (UTI Neo, UTI Ped, Pediatria Clínica, etc.). Inclui o botão de **Suspensão imediata ("S")**, que mantém o paciente no censo visual, mas o remove dos cálculos de bancada e das etiquetas. |
| 🧪 **Bancada de Preparo** | Cálculos analíticos de pesagem de pó ($\text{g}$) e medição de água ($\text{ml}$) divididos por categorias oficiais: **Autoclavadas Preparo 1**, **Autoclavadas Preparo 2**, **Não-Autoclavadas**, **Dietas Especiais** e **Abreviação de Jejum**. Gera a **Folha de Bancada A4** para a área de manipulação. |
| 🏷️ **Central de Etiquetas Zebra** | Impressão térmica no padrão oficial do HSP (formato **100mm × 50mm**), com cálculo automático de **Validade (+2 horas)** a partir do horário de preparo, dados de leito, via, volume e dispositivo. |
| 📦 **Previsão de Compras** | Relatório de saída diária de latas e projeção de contingência para o **Fim de Semana ($\lceil 1.5 \times \text{Saída em Latas} \rceil$)**. |
| ⚙️ **Conexão Google Drive** | Sincronização bidirecional via API REST JSON do Google Apps Script com proteção contra conflitos via `LockService`. |

---

## 🚀 3. Como Executar o Sistema

### Execução Local Imediata:
1. Abra o arquivo [`index.html`](file:///Users/juniornoguchi/Library/Mobile%20Documents/com~apple~CloudDocs/NaLac/index.html) diretamente em qualquer navegador moderno (Chrome, Edge, Safari, Firefox).
2. O sistema iniciará no **Modo Local / Demonstração** pré-carregado com os leitos e casos típicos do Hospital São Paulo.

---

## ☁️ 4. Como Integrar ao Google Sheets no Google Drive

1. Crie uma nova planilha no Google Drive com o nome **"Banco_Dados_Lactario_HSP"**.
2. Na planilha, acesse o menu **Extensões** > **Apps Script**.
3. Crie dois arquivos no editor do Apps Script:
   - Cole o conteúdo de [`backend/Code.gs`](file:///Users/juniornoguchi/Library/Mobile%20Documents/com~apple~CloudDocs/NaLac/backend/Code.gs) no arquivo `Code.gs`.
   - Crie o arquivo `SetupSheets.gs` e cole o conteúdo de [`backend/SetupSheets.gs`](file:///Users/juniornoguchi/Library/Mobile%20Documents/com~apple~CloudDocs/NaLac/backend/SetupSheets.gs).
4. No menu superior do Apps Script, selecione a função **`setupLactarioDatabase`** e clique em **Executar** para criar as abas formatadas na planilha (`DB_Censo`, `DB_Dietas`, `DB_Logs`).
5. Clique no botão azul **Implantar** > **Nova implantação**:
   - **Tipo:** *Aplicativo da Web*.
   - **Executar como:** *Eu*.
   - **Quem pode acessar:** *Qualquer pessoa*.
6. Copie a URL gerada (terminada em `/exec`) e cole na aba **⚙️ Configurações e Catálogo** do Lactário Digital.

---

## 🏷️ 5. Configuração da Impressora Térmica Zebra

1. Nas propriedades de impressão do navegador (ao clicar em imprimir etiqueta):
   - **Destino:** Selecione a impressora Zebra (ex: *Zebra ZD220 / GK420t*).
   - **Tamanho do Papel:** `100mm × 50mm` (ou *User Defined 100x50mm*).
   - **Margens:** *Nenhuma*.
   - **Cabeçalhos e rodapés:** *Desmarcar*.
2. As etiquetas possuem estilo `@media print` nativo para alimentação contínua sem quebras de página incorretas.

---

## 📁 6. Estrutura do Projeto

```
NaLac/
├── index.html                   # Interface Principal SPA (Todas as 5 Abas Operacionais)
├── css/
│   ├── app.css                  # Design System Clínico e Componentes Visuais
│   └── print-zebra.css          # Estilos @media print para Zebra 100x50mm e Folha A4
├── js/
│   ├── app.js                   # Controlador Mestre da Aplicação e Roteamento Reativo
│   ├── config.js                # Parâmetros Oficiais do HSP e Validade de +2h
│   ├── data/
│   │   ├── dietas-padrao.js     # Catálogo de Fórmulas e Proporções de Reconstituição
│   │   ├── leitos-hsp.js        # Mapeamento Oficial de Enfermarias e Leitos do HSP
│   │   └── mock-censo.js        # Dados Demonstrativos Iniciais
│   ├── modules/
│   │   ├── censo.js             # Gestão de Pacientes, Prescrições e Suspensão ("S")
│   │   ├── bancada.js           # Consolidação e Cálculo de Pó (g) e Água (ml)
│   │   ├── etiquetas.js         # Layout e Disparo de Impressão Térmica Zebra
│   │   └── compras.js           # Estimativa de Latas e Pedido de Fim de Semana (1.5x)
│   └── services/
│       └── api.js               # Conector Google Apps Script / LocalStorage Fallback
├── backend/
│   ├── Code.gs                  # Backend Web App REST API (doGet/doPost com LockService)
│   └── SetupSheets.gs           # Inicializador Automático de Abas no Google Sheets
├── lactario-digital.md          # Plano Mestre de Arquitetura do Projeto
└── README.md                    # Este Manual de Operação e Implantação
```

---

## 🏥 Instituição
- **Hospital São Paulo - Hospital Universitário da UNIFESP**
- **Escola Paulista de Medicina (EPM)**
- **Serviço de Nutrição e Dietética - Lactário Central**
