# Plano de Projeto: Lactário Digital – Hospital São Paulo (UNIFESP-EPM)

> **Tipo de Projeto:** WEB (SPA Hospitalar)  
> **Status:** Planejamento Aprovado / Pronto para Execução  
> **Data:** 16 de Agosto de 2026  
> **Cliente/Instituição:** Lactário - Setor de Nutrição e Dietética | Hospital São Paulo (UNIFESP-EPM)

---

## 📌 1. Visão Geral e Objetivos

O **Lactário Digital** é um sistema web desenvolvido para substituir as planilhas Excel manuais no Lactário do Hospital São Paulo (UNIFESP-EPM). O sistema automatiza o censo de pacientes internados, o cálculo exato de pesagem de pós e medição de água para reconstituição de fórmulas infantis e dietas enterais/orais, a geração de etiquetas térmicas em formato Zebra (100mm × 50mm) e a projeção de compras/consumo de fórmulas.

### 🎯 Critérios de Sucesso
1. **Censo Hospitalar Ágil:** Cadastro, busca e edição rápida de pacientes com mapeamento estrito de enfermarias e leitos do HSP.
2. **Cálculo de Bancada Preciso:** Somatório automático de pó (g) e água (ml) divididos por categorias de preparo (Autoclavadas P1/P2, Não-Autoclavadas, Dietas Especiais e Abreviação de Jejum).
3. **Controle de Suspensão:** Marcação imediata de status `"S"` (Suspenso) com exclusão automática da produção de bancada e censo de consumo.
4. **Impressão Zebra Conforme:** Emissão em lote ou unitária de etiquetas térmicas 100x50mm com prazo de validade automático de +2h e layout padronizado do HSP.
5. **Mapa de Bancada A4:** Folha de produção para fixação na área limpa do lactário.
6. **Backend 100% Gratuito:** Scripts prontos para Google Apps Script (`Code.gs`) integrados ao Google Sheets, com suporte nativo a modo local/offline para execução imediata no navegador.

---

## 🛠️ 2. Arquitetura Técnica e Stack

- **Frontend:** HTML5 Semântico, Vanilla JavaScript moderno / Vue 3 (CDN), Tailwind CSS (CDN) com design system limpo e de alto contraste (cores neutras, azuis clínicos e alertas claros).
- **Backend / Persistência:** Google Apps Script Web App (API REST JSON) + Google Sheets como banco de dados relacional.
- **Camada Offline/Local:** Armazenamento em `localStorage` para operação ininterrupta, com sincronização em background.
- **Motor de Impressão:** CSS `@media print` dedicado para bobina Zebra (100mm × 50mm) e folha de produção A4.

---

## 📁 3. Estrutura de Arquivos Planejada

```
NaLac/
├── index.html                   # SPA Principal com todos os módulos (Censo, Bancada, Etiquetas, Compras)
├── css/
│   ├── app.css                  # Estilos globais, temas e regras de UI
│   └── print-zebra.css          # CSS @media print otimizado para Zebra 100x50mm e Folha A4
├── js/
│   ├── app.js                   # Inicialização da aplicação, roteamento de abas e estado global
│   ├── config.js                # Parâmetros do sistema (HSP, validade 2h, dimensões de etiqueta)
│   ├── data/
│   │   ├── dietas-padrao.js     # Catálogo de fórmulas do HSP (Autoclavadas P1/P2, Não-Auto, etc.)
│   │   ├── leitos-hsp.js        # Mapeamento oficial de Enfermarias e Leitos do Hospital São Paulo
│   │   └── mock-censo.js        # Dados de exemplo do censo para demonstração e testes imediatos
│   ├── modules/
│   │   ├── censo.js             # Gestão do censo de pacientes e suspensão
│   │   ├── bancada.js           # Cálculos de diluição, pesagem de pó e medição de água
│   │   ├── etiquetas.js         # Geração de etiquetas Zebra e disparo de impressão
│   │   └── compras.js           # Projeção de saída em latas e pedido de fim de semana
│   └── services/
│       └── api.js               # Conector assíncrono com Google Apps Script / LocalStorage Fallback
├── backend/
│   ├── Code.gs                  # Código Google Apps Script (doGet/doPost, JSON API, LockService)
│   └── SetupSheets.gs           # Script de criação automática das abas e colunas no Google Sheets
├── lactario-digital.md          # Este arquivo de plano
└── README.md                    # Manual de instalação, configuração no Google Drive e uso
```

---

## 📋 4. Divisão Detalhada de Tarefas (Task Breakdown)

### Tarefa 1: Arquitetura Base, Design System e Layout SPA
- **Agente:** `frontend-specialist` | **Skill:** `@frontend-design`
- **Descrição:** Criar a casca da SPA com barra de navegação hospitalar, seleção de plantão (Manhã/Tarde), indicador de conexão com Google Sheets/Local, e sistema de abas reativo.
- **Entrada:** Requisitos visuais e de usabilidade do Lactário HSP.
- **Saída:** `index.html`, `css/app.css`, `js/app.js`, `js/config.js`.
- **Verificação:** Navegação funcional entre as 5 abas sem recarregamento de página.

### Tarefa 2: Catálogo de Dietas, Mapeamento de Leitos e Motor de Cálculos
- **Agente:** `backend-specialist` / `frontend-specialist` | **Skill:** `@clean-code`
- **Descrição:** Estruturar a base de dados de fórmulas (Nan 1, Pré Nan, Aptamil Soja, Neocate, Pregomin, etc.) e o motor de cálculo de reconstituição ($Volume \times g\_po\_100ml / 100$).
- **Entrada:** Fórmulas e regras de diluição da planilha do Lactário HSP.
- **Saída:** `js/data/dietas-padrao.js`, `js/data/leitos-hsp.js`, `js/modules/bancada.js`.
- **Verificação:** Testes de cálculo unitário e de somatório de bancada comparando com a planilha física.

### Tarefa 3: Módulo de Censo de Pacientes (Gestão de Prescrições e Suspensões)
- **Agente:** `frontend-specialist` | **Skill:** `@frontend-architecture`
- **Descrição:** Tabela interativa com busca instantânea, filtro por enfermaria, ordenação por leito, modal de adição/edição de paciente e toggle imediato de suspensão `"S"`.
- **Entrada:** Mock de dados hospitalares e estrutura de campos (RH, Leito, Dieta, Volume, Vezes, Via, Dispositivo).
- **Saída:** `js/modules/censo.js`, `js/data/mock-censo.js`.
- **Verificação:** Inclusão, edição, exclusão e suspensão de pacientes com persistência em `localStorage`.

### Tarefa 4: Módulo de Bancada de Produção e Mapa de Preparo A4
- **Agente:** `frontend-specialist` | **Skill:** `@clean-code`
- **Descrição:** Painel com cartões consolidados por categoria de dieta (Preparo 1, Preparo 2, Não Autoclavadas, Especiais, Jejum), exibindo Pó Total (g) e Água Total (ml), além de botão para imprimir a Folha de Bancada A4.
- **Entrada:** Dados ativos do Censo (excluindo pacientes suspensos).
- **Saída:** Interface de Bancada em `index.html` e estilização de impressão A4 em `css/print-zebra.css`.
- **Verificação:** Alteração no censo reflete instantaneamente nos totais de pesagem da bancada.

### Tarefa 5: Central de Impressão de Etiquetas Térmicas Zebra (100mm × 50mm)
- **Agente:** `frontend-specialist` | **Skill:** `@frontend-design`
- **Descrição:** Gerador de etiquetas térmicas em conformidade com o padrão HSP (Cabeçalho HSP/UNIFESP, RH, Leito, Nome, Dieta, Volume, Horário, Validade automática de +2h, Via, etc.).
- **Entrada:** Parâmetros definidos (100x50mm, validade 2h, sem necessidade de lote).
- **Saída:** `js/modules/etiquetas.js`, `css/print-zebra.css`.
- **Verificação:** Visualização em tela do preview da etiqueta e disparo do `@media print` no tamanho 100x50mm sem quebra indesejada de páginas.

### Tarefa 6: Módulo de Estimativa de Compras e Fim de Semana
- **Agente:** `frontend-specialist` | **Skill:** `@clean-code`
- **Descrição:** Painel analítico que calcula a quantidade consumida de latas por fórmula e calcula a projeção para o fim de semana ($\lceil 1.5 \times \text{Saída em Latas} \rceil$).
- **Entrada:** Consumo diário do censo ativo.
- **Saída:** `js/modules/compras.js`.
- **Verificação:** Testes de arredondamento e cálculo de latas com pesos de 400g e 800g.

### Tarefa 7: Backend Google Apps Script (`backend/Code.gs` e `backend/SetupSheets.gs`)
- **Agente:** `backend-specialist` | **Skill:** `@api-patterns`
- **Descrição:** Criação dos scripts Google Apps Script para leitura/escrita no Google Sheets, configuração de permissões CORS e criação automática da estrutura de abas na planilha.
- **Entrada:** Esquema de dados do Lactário.
- **Saída:** `backend/Code.gs`, `backend/SetupSheets.gs`, `js/services/api.js`.
- **Verificação:** Script testado com mocks de payload e instruções completas para o usuário publicar a Web App no Google Drive.

### Tarefa 8: Verificação Final, Documentação e Validação do AG Kit
- **Agente:** `test-engineer` / `project-planner` | **Skill:** `@verify-changes`
- **Descrição:** Execução de testes de consistência, validação de regras de acessibilidade e redação do `README.md` detalhado.
- **Entrada:** Todos os artefatos gerados.
- **Saída:** `README.md` e checklist de verificação preenchido.
- **Verificação:** Execução dos scripts de auditoria do toolkit.

---

## 🔒 5. Decisões Consolidadas

| Parâmetro | Decisão Aprovada |
|---|---|
| **Tamanho da Etiqueta Zebra** | **100mm × 50mm** (padrão inicial, facilmente alterável via CSS) |
| **Prazo de Validade** | **2 horas** a partir do horário de preparo/envio |
| **Identificação de Lote** | **Desativado / Opcional** (conforme solicitado) |
| **Backend e BD** | Google Apps Script + Google Sheets (com fallback de LocalStorage offline) |
| **Dependências de Build** | Nenhuma dependência externa obrigatória (roda direto no navegador) |

---

## 🏁 Phase X: Critérios de Conclusão

- [ ] Interface visual moderna, sem erros de console e responsiva.
- [ ] Regras de diluição e pesagem 100% fiéis à prática do Lactário HSP.
- [ ] Etiquetas Zebra 100x50mm renderizadas e impressas com precisão milimétrica.
- [ ] Módulo Google Apps Script pronto para copiar e colar no editor do Google Sheets.
- [ ] Documentação clara de uso e implantação no `README.md`.
