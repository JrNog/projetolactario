/**
 * ============================================================================
 * LACTÁRIO DIGITAL - HOSPITAL SÃO PAULO (UNIFESP-EPM)
 * Módulo de Evolução Nutricional e Linha do Tempo de Dietas do Paciente
 * ============================================================================
 */

const EvolucaoModule = {
  pacienteAtual: null,
  pontoSelecionadoIndex: null,

  /**
   * Gera histórico de evolução demonstrativo realista caso o paciente ainda não tenha
   */
  obterOuGerarHistorico(paciente) {
    if (!paciente) return [];
    if (paciente.historicoEvolucao && Array.isArray(paciente.historicoEvolucao) && paciente.historicoEvolucao.length > 0) {
      return paciente.historicoEvolucao;
    }

    // Gerar evolução cronológica baseada na prescrição atual
    const hoje = new Date();
    const data3 = new Date(hoje);
    const data2 = new Date(hoje);
    data2.setDate(hoje.getDate() - 1);
    const data1 = new Date(hoje);
    data1.setDate(hoje.getDate() - 2);

    const formatarData = (d) => {
      const dia = String(d.getDate()).padStart(2, "0");
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const ano = String(d.getFullYear()).slice(-2);
      return `${dia}/${mes}/${ano}`;
    };

    const volAtual = Number(paciente.volumeMl) || 60;
    const vezesAtual = Number(paciente.vezesDia) || 8;
    const dietaNome = paciente.dietaNome || "Dieta Padrão";

    // Histórico de exemplo com 3 ou 4 etapas de progressão
    const historico = [
      {
        data: formatarData(data1),
        hora: "08:00",
        dietaNome: dietaNome.includes("Concentrado") ? "Pré Nan" : dietaNome,
        volumeMl: Math.max(30, volAtual - 20),
        vezesDia: 8,
        suspenso: false,
        via: paciente.via || "ENTERAL",
        dispositivo: paciente.dispositivo || "Frasco Enteral",
        observacao: "Início do plano nutricional / transição alimentar",
        nutricionista: "Nutr. Responsável HSP"
      },
      {
        data: formatarData(data2),
        hora: "10:30",
        dietaNome: dietaNome,
        volumeMl: Math.max(40, volAtual - 10),
        vezesDia: Math.min(12, vezesAtual),
        suspenso: false,
        via: paciente.via || "ENTERAL",
        dispositivo: paciente.dispositivo || "Frasco Enteral",
        observacao: "Aumento de volume conforme tolerância gastrointestinal",
        nutricionista: "Nutr. Responsável HSP"
      },
      {
        data: formatarData(data2),
        hora: "19:00",
        dietaNome: "Dieta Suspensa",
        volumeMl: 0,
        vezesDia: 0,
        suspenso: true,
        motivoSuspensao: "Pausa para procedimento / avaliação médica",
        via: "-",
        dispositivo: "-",
        observacao: "Suspensão temporária para realização de exames",
        nutricionista: "Nutr. Plantonista HSP"
      },
      {
        data: formatarData(data3),
        hora: "07:30",
        dietaNome: dietaNome,
        volumeMl: volAtual,
        vezesDia: vezesAtual,
        suspenso: Boolean(paciente.suspenso),
        via: paciente.via || "ENTERAL",
        dispositivo: paciente.dispositivo || "Frasco Enteral",
        observacao: paciente.espessanteObs || "Prescrição atual vigente na relação hospitalar",
        nutricionista: "Nutr. Responsável HSP"
      }
    ];

    paciente.historicoEvolucao = historico;
    return historico;
  },

  /**
   * Abre o Modal de Evolução Nutricional
   */
  abrirModal(pacienteId) {
    const paciente = CensoModule.obterPorId(pacienteId);
    if (!paciente) {
      if (typeof App !== "undefined" && App.mostrarToast) {
        App.mostrarToast("Paciente não localizado.", "error");
      }
      return;
    }

    this.pacienteAtual = paciente;
    this.pontoSelecionadoIndex = null;

    // Atualizar dados do cabeçalho
    const elNome = document.getElementById("evolucao-paciente-nome");
    const elSub = document.getElementById("evolucao-paciente-subtitulo");
    const elBadge = document.getElementById("evolucao-paciente-status");

    if (elNome) elNome.innerText = paciente.nome;
    if (elSub) {
      elSub.innerText = `Leito: ${paciente.leito || "-"} • Nº de Atendimento (RH): ${paciente.rh || "-"} • Enfermaria: ${paciente.enfermariaNome || paciente.enfermaria || "-"}`;
    }
    if (elBadge) {
      if (paciente.suspenso) {
        elBadge.className = "px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300";
        elBadge.innerText = "⏹ Dieta Suspensa";
      } else {
        elBadge.className = "px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300";
        elBadge.innerText = "✓ Dieta Ativa";
      }
    }

    const historico = this.obterOuGerarHistorico(paciente);

    // Renderizar gráfico e lista detalhada
    this.renderizarGraficoTimeline(historico);
    this.renderizarListaDetalhada(historico);

    const modal = document.getElementById("modal-evolucao-paciente");
    if (modal) {
      modal.classList.remove("hidden");
    }
  },

  /**
   * Fecha o Modal de Evolução
   */
  fecharModal() {
    const modal = document.getElementById("modal-evolucao-paciente");
    if (modal) {
      modal.classList.add("hidden");
    }
    this.pacienteAtual = null;
    this.pontoSelecionadoIndex = null;
  },

  /**
   * Renderiza o Gráfico Interativo de Linha do Tempo em SVG Responsivo
   */
  renderizarGraficoTimeline(historico) {
    const container = document.getElementById("evolucao-grafico-container");
    if (!container) return;

    if (!historico || historico.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-500 font-medium">
          Nenhum registro de evolução anterior cadastrado para este paciente.
        </div>
      `;
      return;
    }

    const svgWidth = 720;
    const svgHeight = 270;
    const padLeft = 85;
    const padRight = 60;
    const padTop = 45;
    const padBottom = 55;

    const plotWidth = svgWidth - padLeft - padRight;
    const plotHeight = svgHeight - padTop - padBottom;

    // Calcular valores do eixo Y (Volume x Frequência)
    const volumesFormatados = historico.map(h => {
      if (h.suspenso || h.volumeMl === 0) return 0;
      return h.volumeMl * (h.vezesDia || 8);
    });
    const maxTotalMl = Math.max(...volumesFormatados, 600);

    // Mapeamento dos pontos
    const numPontos = historico.length;
    const stepX = numPontos > 1 ? plotWidth / (numPontos - 1) : plotWidth / 2;

    const pontos = historico.map((h, i) => {
      const x = numPontos === 1 ? padLeft + plotWidth / 2 : padLeft + i * stepX;
      let y;
      if (h.suspenso || h.volumeMl === 0) {
        y = padTop + plotHeight; // Linha de base zero
      } else {
        const totalMl = h.volumeMl * (h.vezesDia || 8);
        const prop = totalMl / maxTotalMl;
        y = padTop + plotHeight - (prop * (plotHeight - 20));
      }
      return { ...h, x, y, index: i };
    });

    // Construção das linhas do gráfico (degraus / step-line)
    let pathD = "";
    pontos.forEach((p, i) => {
      if (i === 0) {
        pathD += `M ${p.x} ${p.y}`;
      } else {
        const prev = pontos[i - 1];
        // Linha tipo degrau: horizontal até o X atual e depois vertical
        pathD += ` H ${p.x} V ${p.y}`;
      }
    });

    // Construção dos cards/badges visuais sobre cada ponto
    let nodesSvg = "";
    pontos.forEach((p) => {
      const isSuspensa = p.suspenso || p.volumeMl === 0;
      const isSelected = this.pontoSelecionadoIndex === p.index;

      const badgeColor = isSuspensa ? "#f43f5e" : "#8b5cf6";
      const badgeBg = isSuspensa ? "#ffe4e6" : "#f5f3ff";
      const badgeBorder = isSuspensa ? "#fb7185" : "#c4b5fd";
      const textColor = isSuspensa ? "#9f1239" : "#4c1d95";

      const badgeWidth = Math.min(130, Math.max(90, (p.dietaNome || "").length * 7.5 + 20));
      const badgeHeight = 28;
      const badgeX = p.x - badgeWidth / 2;
      const badgeY = isSuspensa ? p.y - badgeHeight - 12 : p.y - badgeHeight - 14;

      const strokeHighlight = isSelected ? "stroke='#38bdf8' stroke-width='3'" : "";

      nodesSvg += `
        <!-- Ponto Conector e Linhas de Projeção tracejadas -->
        <line x1="${p.x}" y1="${padTop + plotHeight}" x2="${p.x}" y2="${p.y}" stroke="#cbd5e1" stroke-dasharray="3,3" stroke-width="1.5" />
        
        <!-- Ponto Círculo -->
        <circle 
          cx="${p.x}" 
          cy="${p.y}" 
          r="${isSelected ? "8" : "6"}" 
          fill="${badgeColor}" 
          stroke="#ffffff" 
          stroke-width="2.5" 
          style="cursor: pointer;"
          onclick="EvolucaoModule.destacarItemTabela(${p.index})"
        />

        <!-- Card / Badge da Dieta na Linha do Tempo -->
        <g 
          class="cursor-pointer transition-transform hover:opacity-90 active:scale-95" 
          onclick="EvolucaoModule.destacarItemTabela(${p.index})"
          style="cursor: pointer;"
        >
          <rect 
            x="${badgeX}" 
            y="${badgeY}" 
            width="${badgeWidth}" 
            height="${badgeHeight}" 
            rx="6" 
            fill="${badgeBg}" 
            stroke="${isSelected ? "#38bdf8" : badgeBorder}" 
            stroke-width="${isSelected ? "2.5" : "1.5"}" 
            ${strokeHighlight}
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
          />
          <text 
            x="${p.x}" 
            y="${badgeY + 13}" 
            text-anchor="middle" 
            font-family="system-ui, sans-serif" 
            font-size="9.5" 
            font-weight="bold" 
            fill="${textColor}"
          >
            ${isSuspensa ? "DIETA SUSPENSA" : (p.dietaNome || "").toUpperCase()}
          </text>
          <text 
            x="${p.x}" 
            y="${badgeY + 23}" 
            text-anchor="middle" 
            font-family="monospace, monospace" 
            font-size="8.5" 
            font-weight="900" 
            fill="${isSuspensa ? "#be123c" : "#6b21a8"}"
          >
            ${isSuspensa ? "0 ml" : `${p.vezesDia || 8}x ${p.volumeMl}ml`}
          </text>
        </g>

        <!-- Rótulo do Eixo X (Data) -->
        <text 
          x="${p.x}" 
          y="${padTop + plotHeight + 20}" 
          text-anchor="middle" 
          font-family="monospace, monospace" 
          font-size="10.5" 
          font-weight="bold" 
          fill="#334155"
        >
          ${p.data}
        </text>
        <text 
          x="${p.x}" 
          y="${padTop + plotHeight + 33}" 
          text-anchor="middle" 
          font-family="sans-serif" 
          font-size="8.5" 
          fill="#64748b"
        >
          ${p.hora || ""}
        </text>
      `;
    });

    // Montagem completa do SVG
    const svgHtml = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-auto select-none overflow-visible">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#9333ea" />
            <stop offset="50%" stop-color="#c026d3" />
            <stop offset="100%" stop-color="#7c3aed" />
          </linearGradient>
          <marker id="arrowX" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#475569" />
          </marker>
          <marker id="arrowY" markerWidth="8" markerHeight="8" refX="3" refY="6" orient="auto">
            <path d="M0,8 L6,8 L3,0 z" fill="#475569" />
          </marker>
        </defs>

        <!-- Fundo de Grade Suave -->
        <rect x="${padLeft}" y="${padTop}" width="${plotWidth}" height="${plotHeight}" fill="#faf5ff" rx="8" />
        
        <!-- Linhas de Grade Horizontal -->
        <line x1="${padLeft}" y1="${padTop + plotHeight * 0.25}" x2="${padLeft + plotWidth}" y2="${padTop + plotHeight * 0.25}" stroke="#e9d5ff" stroke-dasharray="2,4" />
        <line x1="${padLeft}" y1="${padTop + plotHeight * 0.5}" x2="${padLeft + plotWidth}" y2="${padTop + plotHeight * 0.5}" stroke="#e9d5ff" stroke-dasharray="2,4" />
        <line x1="${padLeft}" y1="${padTop + plotHeight * 0.75}" x2="${padLeft + plotWidth}" y2="${padTop + plotHeight * 0.75}" stroke="#e9d5ff" stroke-dasharray="2,4" />

        <!-- Eixo Y (Volume) -->
        <line x1="${padLeft}" y1="${padTop + plotHeight}" x2="${padLeft}" y2="${padTop - 15}" stroke="#475569" stroke-width="2" marker-end="url(#arrowY)" />
        <text x="${padLeft - 10}" y="${padTop - 25}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#1e293b">VOLUME</text>

        <!-- Eixo X (Linha do Tempo) -->
        <line x1="${padLeft}" y1="${padTop + plotHeight}" x2="${padLeft + plotWidth + 30}" y2="${padTop + plotHeight}" stroke="#475569" stroke-width="2" marker-end="url(#arrowX)" />
        <text x="${padLeft + plotWidth + 40}" y="${padTop + plotHeight + 15}" text-anchor="start" font-family="system-ui, sans-serif" font-size="9.5" font-weight="900" fill="#1e293b">LINHA DO TEMPO</text>

        <!-- Rótulos do Eixo Y -->
        <text x="${padLeft - 12}" y="${padTop + plotHeight + 4}" text-anchor="end" font-family="monospace" font-size="9" font-weight="bold" fill="#64748b">0 ml (Suspensa)</text>
        <text x="${padLeft - 12}" y="${padTop + plotHeight * 0.5 + 4}" text-anchor="end" font-family="monospace" font-size="9" font-weight="bold" fill="#64748b">8x 60ml</text>
        <text x="${padLeft - 12}" y="${padTop + plotHeight * 0.2 + 4}" text-anchor="end" font-family="monospace" font-size="9" font-weight="bold" fill="#64748b">12x 70ml</text>

        <!-- Linha da Evolução (Degraus) -->
        <path d="${pathD}" fill="none" stroke="url(#lineGrad)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" />

        <!-- Nós e Badges de Cada Ponto -->
        ${nodesSvg}
      </svg>
    `;

    container.innerHTML = svgHtml;
  },

  /**
   * Renderiza a Lista / Tabela Detalhada de Evolução
   */
  renderizarListaDetalhada(historico) {
    const tbody = document.getElementById("evolucao-tabela-corpo");
    if (!tbody) return;

    if (!historico || historico.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-4 text-center text-slate-500 text-xs">Sem registros históricos.</td>
        </tr>
      `;
      return;
    }

    // Ordenar da data mais recente para a mais antiga para visualização em tabela
    const rows = [...historico].reverse().map((h, revIdx) => {
      const origIdx = historico.length - 1 - revIdx;
      const isSuspensa = h.suspenso || h.volumeMl === 0;
      const totalDia = isSuspensa ? "0 ml" : `${(h.volumeMl * (h.vezesDia || 8))} ml / dia`;

      const statusBadge = isSuspensa
        ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-300">⏹ SUSPENSA</span>`
        : `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-950 border border-purple-300 font-mono">${h.vezesDia || 8}x ${h.volumeMl}ml</span>`;

      return `
        <tr 
          id="evolucao-row-${origIdx}" 
          onclick="EvolucaoModule.selecionarLinhaTabela(${origIdx})"
          class="border-b border-purple-100 hover:bg-purple-50/70 transition-colors cursor-pointer text-xs"
        >
          <td class="px-3 py-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
            <div>${h.data}</div>
            <div class="text-[10px] font-normal text-slate-500">${h.hora || ""}</div>
          </td>
          <td class="px-3 py-2.5 font-bold text-purple-950">
            ${isSuspensa ? `<span class="text-rose-700 font-black">Dieta Suspensa</span>` : h.dietaNome}
          </td>
          <td class="px-3 py-2.5 text-center">
            ${statusBadge}
          </td>
          <td class="px-3 py-2.5 text-center font-mono font-bold text-slate-800">
            ${totalDia}
          </td>
          <td class="px-3 py-2.5 text-slate-700">
            <span class="text-[11px]">${h.via || "-"} / ${h.dispositivo || "-"}</span>
          </td>
          <td class="px-3 py-2.5 text-slate-600 text-[11px] italic max-w-xs truncate" title="${h.observacao || ""}">
            ${h.observacao || "-"}
          </td>
          <td class="px-3 py-2.5 text-slate-600 text-[10.5px]">
            ${h.nutricionista || "Nutr. HSP"}
          </td>
        </tr>
      `;
    }).join("");

    tbody.innerHTML = rows;
  },

  /**
   * Destaca o item da tabela quando clicado no gráfico
   */
  destacarItemTabela(origIdx) {
    this.pontoSelecionadoIndex = origIdx;
    
    // Re-renderizar o gráfico com o destaque no nó clicado
    if (this.pacienteAtual) {
      const hist = this.obterOuGerarHistorico(this.pacienteAtual);
      this.renderizarGraficoTimeline(hist);
    }

    // Destacar linha na tabela
    document.querySelectorAll("[id^='evolucao-row-']").forEach(el => {
      el.classList.remove("bg-purple-100", "ring-2", "ring-purple-600", "font-black");
    });

    const targetRow = document.getElementById(`evolucao-row-${origIdx}`);
    if (targetRow) {
      targetRow.classList.add("bg-purple-100", "ring-2", "ring-purple-600", "font-black");
      targetRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  },

  /**
   * Seleciona a linha na tabela e atualiza o nó no gráfico
   */
  selecionarLinhaTabela(origIdx) {
    this.destacarItemTabela(origIdx);
  },

  /**
   * Imprime o Relatório de Evolução Nutricional
   */
  imprimirRelatorio() {
    if (!this.pacienteAtual) return;

    const paciente = this.pacienteAtual;
    const historico = this.obterOuGerarHistorico(paciente);
    const incluirGrafico = document.getElementById("evolucao-incluir-grafico")?.checked ?? true;

    const printArea = document.getElementById("print-area-evolucao");
    if (!printArea) return;

    const hojeFormatado = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const nutriNome = (typeof App !== "undefined" && App.obterNomeNutricionista)
      ? App.obterNomeNutricionista()
      : "Nutricionista Responsável";
    const nutriCrn = (typeof App !== "undefined" && App.obterCrnNutricionista)
      ? App.obterCrnNutricionista()
      : "CRN-3";

    // Obter o SVG atual do gráfico se for incluir na impressão
    let svgGraficoHtml = "";
    if (incluirGrafico) {
      const containerGrafico = document.getElementById("evolucao-grafico-container");
      if (containerGrafico) {
        svgGraficoHtml = `
          <div style="margin: 15px 0; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; background: #ffffff;">
            <div style="font-size: 11px; font-weight: bold; color: #475569; margin-bottom: 8px; text-transform: uppercase;">
              📈 Gráfico de Linha do Tempo da Evolução Nutricional
            </div>
            ${containerGrafico.innerHTML}
          </div>
        `;
      }
    }

    const tabelaHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px;">
        <thead>
          <tr style="background: #240738; color: #ffffff;">
            <th style="border: 1px solid #4a154b; padding: 6px; text-align: left;">DATA / HORA</th>
            <th style="border: 1px solid #4a154b; padding: 6px; text-align: left;">FÓRMULA / DIETA</th>
            <th style="border: 1px solid #4a154b; padding: 6px; text-align: center;">ESCALA</th>
            <th style="border: 1px solid #4a154b; padding: 6px; text-align: center;">VOL. DIA</th>
            <th style="border: 1px solid #4a154b; padding: 6px; text-align: left;">VIA / DISPOSITIVO</th>
            <th style="border: 1px solid #4a154b; padding: 6px; text-align: left;">OBSERVAÇÃO</th>
            <th style="border: 1px solid #4a154b; padding: 6px; text-align: left;">RESPONSÁVEL</th>
          </tr>
        </thead>
        <tbody>
          ${historico.map((h, i) => {
            const isSuspensa = h.suspenso || h.volumeMl === 0;
            const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
            return `
              <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
                <td style="border: 1px solid #e2e8f0; padding: 5px; font-weight: bold;">${h.data} ${h.hora || ""}</td>
                <td style="border: 1px solid #e2e8f0; padding: 5px; font-weight: bold; color: ${isSuspensa ? "#be123c" : "#1e293b"};">
                  ${isSuspensa ? "DIETA SUSPENSA" : h.dietaNome}
                </td>
                <td style="border: 1px solid #e2e8f0; padding: 5px; text-align: center; font-weight: bold;">
                  ${isSuspensa ? "0x 0ml" : `${h.vezesDia || 8}x ${h.volumeMl}ml`}
                </td>
                <td style="border: 1px solid #e2e8f0; padding: 5px; text-align: center;">
                  ${isSuspensa ? "0 ml" : `${(h.volumeMl * (h.vezesDia || 8))} ml`}
                </td>
                <td style="border: 1px solid #e2e8f0; padding: 5px;">${h.via || "-"} / ${h.dispositivo || "-"}</td>
                <td style="border: 1px solid #e2e8f0; padding: 5px; font-style: italic;">${h.observacao || "-"}</td>
                <td style="border: 1px solid #e2e8f0; padding: 5px;">${h.nutricionista || "Nutr. HSP"}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;

    printArea.innerHTML = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; padding: 20px;">
        <!-- Cabeçalho Oficial HSP -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #240738; padding-bottom: 10px; margin-bottom: 15px;">
          <div>
            <div style="font-size: 14px; font-weight: 900; color: #240738; text-transform: uppercase;">HOSPITAL SÃO PAULO - UNIFESP / EPM</div>
            <div style="font-size: 11px; font-weight: bold; color: #475569;">SERVIÇO DE NUTRIÇÃO E DIETÉTICA • LACTÁRIO CENTRAL</div>
            <div style="font-size: 13px; font-weight: 900; color: #c026d3; margin-top: 4px;">RELATÓRIO DE EVOLUÇÃO NUTRICIONAL DO PACIENTE</div>
          </div>
          <div style="text-align: right; font-size: 9.5px; color: #64748b;">
            <div>Emissão: <strong>${hojeFormatado}</strong></div>
            <div>Sistema: <strong>Lactário Digital</strong></div>
          </div>
        </div>

        <!-- Identificação do Paciente -->
        <div style="background: #fdf4ff; border: 1px solid #f0abfc; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-size: 11px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px;">
            <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: 900; color: #240738;">${paciente.nome}</span></div>
            <div><strong>LEITO:</strong> <span style="font-weight: 900; color: #c026d3;">${paciente.leito}</span></div>
            <div><strong>Nº ATENDIMENTO (RH):</strong> <span style="font-weight: 900;">${paciente.rh}</span></div>
          </div>
          <div style="margin-top: 6px; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; font-size: 10.5px;">
            <div><strong>ENFERMARIA:</strong> ${paciente.enfermariaNome || paciente.enfermaria}</div>
            <div><strong>STATUS ATUAL:</strong> ${paciente.suspenso ? "Dieta Suspensa" : "Em Acompanhamento Ativo"}</div>
            <div><strong>PRESCRIÇÃO ATUAL:</strong> ${paciente.dietaNome} (${paciente.volumeMl}ml)</div>
          </div>
        </div>

        <!-- Gráfico Opcional -->
        ${svgGraficoHtml}

        <!-- Tabela Detalhada -->
        <div style="margin-top: 15px;">
          <div style="font-size: 11px; font-weight: bold; color: #240738; margin-bottom: 5px; text-transform: uppercase;">
            📋 Histórico Cronológico de Alterações de Dietas
          </div>
          ${tabelaHtml}
        </div>

        <!-- Rodapé de Assinatura -->
        <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid;">
          <div style="font-size: 9px; color: #64748b;">
            Documento oficial gerado para prontuário clínico e auditoria nutricional.
          </div>
          <div style="text-align: center; border-top: 1px solid #334155; width: 260px; padding-top: 6px; font-size: 10.5px;">
            <div style="font-weight: bold; color: #0f172a;">${nutriNome}</div>
            <div style="color: #475569; font-size: 9.5px;">${nutriCrn} • Nutricionista Responsável</div>
          </div>
        </div>
      </div>
    `;

    // Disparar Impressão
    const estiloOriginal = document.body.className;
    document.body.classList.add("printing-evolucao");
    window.print();
    setTimeout(() => {
      document.body.className = estiloOriginal;
    }, 1000);
  }
};

if (typeof window !== "undefined") {
  window.EvolucaoModule = EvolucaoModule;
}
