/**
 * Módulo de Auditoria e Log de Histórico de Alterações - Lactário HSP / NutriLac
 * Rastreabilidade completa de todas as ações de usuários, modificações de pacientes,
 * catálogos clínicos, parâmetros de preparo e configurações do nutricionista.
 */

const AuditLogModule = {
  STORAGE_KEY: "lac_audit_logs",
  MAX_ENTRIES: 1000,

  /**
   * Módulos do Sistema
   */
  MODULOS: {
    PACIENTES: { label: "Pacientes", icon: "👤", corBadge: "bg-purple-100 text-purple-900 border-purple-300" },
    CATALOGO_FORMULAS: { label: "Fórmulas e Medidas", icon: "🧪", corBadge: "bg-pink-100 text-pink-900 border-pink-300" },
    CATALOGO_ENFERMARIAS: { label: "Enfermarias", icon: "🏥", corBadge: "bg-blue-100 text-blue-900 border-blue-300" },
    CATALOGO_INTERVALOS: { label: "Intervalos", icon: "⏰", corBadge: "bg-amber-100 text-amber-900 border-amber-300" },
    CATALOGO_VIAS: { label: "Vias", icon: "💉", corBadge: "bg-emerald-100 text-emerald-900 border-emerald-300" },
    CATALOGO_DISPOSITIVOS: { label: "Dispositivos", icon: "🍼", corBadge: "bg-cyan-100 text-cyan-900 border-cyan-300" },
    NUTRICIONISTA: { label: "Nutricionista", icon: "👩‍⚕️", corBadge: "bg-indigo-100 text-indigo-900 border-indigo-300" },
    VERSIONAMENTO: { label: "Versões de Catálogo", icon: "📑", corBadge: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300" },
    SISTEMA: { label: "Sistema", icon: "⚙️", corBadge: "bg-slate-100 text-slate-900 border-slate-300" }
  },

  /**
   * Tipos de Ações
   */
  ACOES: {
    CRIACAO: { label: "Criação", icon: "➕", corBadge: "bg-emerald-100 text-emerald-900 border-emerald-300" },
    EDICAO: { label: "Edição", icon: "✏️", corBadge: "bg-blue-100 text-blue-900 border-blue-300" },
    SUSPENSAO: { label: "Suspensão", icon: "⏸️", corBadge: "bg-amber-100 text-amber-900 border-amber-300" },
    REATIVACAO: { label: "Reativação", icon: "▶️", corBadge: "bg-teal-100 text-teal-900 border-teal-300" },
    ALTA: { label: "Alta / Desligamento", icon: "🏥", corBadge: "bg-purple-100 text-purple-900 border-purple-300" },
    EXCLUSAO: { label: "Exclusão", icon: "🗑️", corBadge: "bg-rose-100 text-rose-900 border-rose-300" },
    RESTAURACAO: { label: "Restauração", icon: "🔄", corBadge: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300" }
  },

  /**
   * Carrega todos os registros de logs do LocalStorage
   */
  carregarLogs() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Erro ao carregar logs de auditoria:", e);
      return [];
    }
  },

  /**
   * Formata data e hora para exibição em logs e registros
   */
  formatarDataHora(data = new Date()) {
    const d = (data instanceof Date) ? data : new Date(data);
    if (isNaN(d.getTime())) return new Date().toLocaleString("pt-BR");
    return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  },

  /**
   * Obtém o nome e identificação do Nutricionista Responsável ativo
   */
  getResponsavelAtual() {
    try {
      const nutriConfig = JSON.parse(localStorage.getItem("lac_nutri_config") || "{}");
      return nutriConfig.nome ? `${nutriConfig.nome} (${nutriConfig.crn || "CRN"})` : "Nutricionista Responsável";
    } catch (e) {
      return "Nutricionista Responsável";
    }
  },

  /**
   * Salva a lista de registros de log
   */
  salvarLogs(logs) {
    try {
      // Limita ao número máximo configurado para preservar desempenho
      if (logs.length > this.MAX_ENTRIES) {
        logs = logs.slice(0, this.MAX_ENTRIES);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error("Erro ao salvar logs de auditoria:", e);
    }
  },

  /**
   * Registra uma nova entrada no log de auditoria
   * @param {string} modulo - Chave de MODULOS
   * @param {string} acao - Chave de ACOES
   * @param {string} titulo - Descrição do evento
   * @param {Array<{campo: string, de: string, para: string}>} alteracoes - Lista de alterações
   * @param {Object} metadata - Informações extras (entidadeId, responsavel, motivo, etc.)
   */
  registrar(modulo, acao, titulo, alteracoes = [], metadata = {}) {
    const logs = this.carregarLogs();
    const agora = new Date();
    
    // Identifica o nutricionista ativo no momento
    let responsavel = metadata.responsavel;
    if (!responsavel) {
      try {
        const nutriConfig = JSON.parse(localStorage.getItem("lac_nutri_config") || "{}");
        responsavel = nutriConfig.nome ? `${nutriConfig.nome} (${nutriConfig.crn || "CRN"})` : "Nutricionista Responsável";
      } catch (e) {
        responsavel = "Nutricionista Responsável";
      }
    }

    const novoLog = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
      timestamp: agora.toISOString(),
      dataHoraFormatada: agora.toLocaleDateString("pt-BR") + " às " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      modulo: modulo || "SISTEMA",
      acao: acao || "EDICAO",
      titulo: titulo || "Operação no sistema",
      responsavel: responsavel,
      alteracoes: Array.isArray(alteracoes) ? alteracoes : [],
      metadata: metadata || {}
    };

    // Insere no início (mais recente primeiro)
    logs.unshift(novoLog);
    this.salvarLogs(logs);

    return novoLog;
  },

  /**
   * Filtra os logs por múltiplos critérios
   */
  filtrarLogs(filtros = {}) {
    let logs = this.carregarLogs();
    const { termoBusca, modulo, acao } = filtros;

    if (termoBusca) {
      const termo = termoBusca.toLowerCase().trim();
      logs = logs.filter(l => {
        const titulo = (l.titulo || "").toLowerCase();
        const resp = (l.responsavel || "").toLowerCase();
        const modLabel = (this.MODULOS[l.modulo]?.label || "").toLowerCase();
        const acaoLabel = (this.ACOES[l.acao]?.label || "").toLowerCase();
        const alteracoesStr = (l.alteracoes || []).map(a => `${a.campo} ${a.de} ${a.para}`).join(" ").toLowerCase();
        
        return titulo.includes(termo) || 
               resp.includes(termo) || 
               modLabel.includes(termo) || 
               acaoLabel.includes(termo) || 
               alteracoesStr.includes(termo);
      });
    }

    if (modulo && modulo !== "TODOS") {
      logs = logs.filter(l => l.modulo === modulo);
    }

    if (acao && acao !== "TODAS") {
      logs = logs.filter(l => l.acao === acao);
    }

    return logs;
  },

  /**
   * Busca um registro de log pelo ID
   */
  obterPorId(logId) {
    const logs = this.carregarLogs();
    return logs.find(l => l.id === logId) || null;
  },

  /**
   * Limpa todo o histórico de logs
   */
  limparLogs() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.registrar(
      "SISTEMA", 
      "EXCLUSAO", 
      "Histórico de logs de auditoria foi limpo pelo usuário", 
      [], 
      { motivo: "Limpeza manual de histórico" }
    );
  },

  /**
   * Exporta todo o histórico de auditoria em CSV
   */
  exportarCSV(filtros = {}) {
    const logs = this.filtrarLogs(filtros);
    if (!logs.length) {
      alert("Não há registros de auditoria para exportar com os filtros atuais.");
      return;
    }

    const agora = new Date().toISOString().slice(0, 10);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "=== LOG DE AUDITORIA E HISTÓRICO DE ALTERAÇÕES - HOSPITAL SÃO PAULO ===\n";
    csvContent += "ID,Data e Hora,Módulo,Ação,Título / Evento,Responsável,Total de Modificações,Detalhamento (De -> Para)\n";

    logs.forEach(l => {
      const modLabel = this.MODULOS[l.modulo]?.label || l.modulo;
      const acaoLabel = this.ACOES[l.acao]?.label || l.acao;
      const diffStr = (l.alteracoes || []).map(a => `[${a.campo}: "${a.de || '-'}" -> "${a.para || '-'}"]`).join(" | ");
      
      const linha = [
        `"${l.id}"`,
        `"${l.dataHoraFormatada}"`,
        `"${modLabel}"`,
        `"${acaoLabel}"`,
        `"${(l.titulo || '').replace(/"/g, '""')}"`,
        `"${(l.responsavel || '').replace(/"/g, '""')}"`,
        (l.alteracoes || []).length,
        `"${diffStr.replace(/"/g, '""')}"`
      ];

      csvContent += linha.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `log_auditoria_lactario_${agora}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Renderiza a tabela do painel de auditoria
   */
  renderizarTabela(filtros = {}) {
    const container = document.getElementById("tabela-config-auditoria-corpo");
    const contadorEl = document.getElementById("config-contador-auditoria");
    if (!container) return;

    const logs = this.filtrarLogs(filtros);
    if (contadorEl) {
      contadorEl.innerText = `${logs.length} registro(s)`;
    }

    if (!logs.length) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="py-12 text-center text-slate-400">
            <div class="text-3xl mb-2">📜</div>
            <div class="font-bold text-xs text-slate-600">Nenhum registro de auditoria encontrado</div>
            <p class="text-[11px] text-slate-400 mt-1">As modificações realizadas em pacientes e catálogos aparecerão aqui automaticamente.</p>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = logs.map(l => {
      const mod = this.MODULOS[l.modulo] || { label: l.modulo, icon: "📁", corBadge: "bg-slate-100 text-slate-800 border-slate-200" };
      const acao = this.ACOES[l.acao] || { label: l.acao, icon: "📝", corBadge: "bg-slate-100 text-slate-800 border-slate-200" };
      const temDiff = l.alteracoes && l.alteracoes.length > 0;

      return `
        <tr class="hover:bg-purple-50/40 transition-colors">
          <!-- 1. Data e Hora -->
          <td class="py-3 px-3 whitespace-nowrap">
            <div class="font-bold text-xs text-slate-900 font-mono">${l.dataHoraFormatada}</div>
            <div class="text-[10px] text-slate-400">${escapeHtml(l.responsavel || "-")}</div>
          </td>

          <!-- 2. Módulo -->
          <td class="py-3 px-2 text-center">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${mod.corBadge}">
              <span>${mod.icon}</span>
              <span>${mod.label}</span>
            </span>
          </td>

          <!-- 3. Ação -->
          <td class="py-3 px-2 text-center">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${acao.corBadge}">
              <span>${acao.icon}</span>
              <span>${acao.label}</span>
            </span>
          </td>

          <!-- 4. Descrição do Evento -->
          <td class="py-3 px-3">
            <div class="font-bold text-xs text-slate-950">${escapeHtml(l.titulo || "-")}</div>
            ${temDiff ? `
              <div class="text-[11px] text-purple-900/80 font-medium mt-0.5 flex flex-wrap gap-1 items-center">
                <span class="bg-purple-100/70 text-purple-950 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">${l.alteracoes.length} campo(s) modificado(s)</span>
                <span class="text-slate-500">•</span>
                <span class="text-slate-600 truncate max-w-[280px]">${escapeHtml(l.alteracoes.map(a => a.campo).join(", "))}</span>
              </div>
            ` : (l.metadata && l.metadata.motivo ? `
              <div class="text-[11px] text-slate-500 mt-0.5 italic">Motivo: ${escapeHtml(l.metadata.motivo)}</div>
            ` : '')}
          </td>

          <!-- 5. Resumo das Alterações (De -> Para) -->
          <td class="py-3 px-3">
            ${temDiff ? `
              <div class="space-y-1 max-w-[320px]">
                ${l.alteracoes.slice(0, 2).map(a => `
                  <div class="text-[11px] leading-tight flex items-center gap-1.5">
                    <span class="font-bold text-slate-700">${escapeHtml(a.campo)}:</span>
                    <span class="line-through text-rose-600 font-mono text-[10.5px]">${escapeHtml(a.de || '(vazio)')}</span>
                    <span class="text-slate-400">➔</span>
                    <span class="font-bold text-emerald-700 font-mono text-[10.5px]">${escapeHtml(a.para || '(vazio)')}</span>
                  </div>
                `).join("")}
                ${l.alteracoes.length > 2 ? `
                  <div class="text-[10px] font-bold text-purple-700">+ ${l.alteracoes.length - 2} outra(s) alteração(ões)...</div>
                ` : ''}
              </div>
            ` : `
              <span class="text-slate-400 text-xs">-</span>
            `}
          </td>

          <!-- 6. Ações -->
          <td class="py-3 px-3 text-center whitespace-nowrap">
            ${temDiff ? `
              <button 
                onclick="App.verDetalhesLogAuditoria('${l.id}')"
                class="px-2.5 py-1 text-xs font-bold text-purple-950 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                title="Ver todas as alterações detalhadas"
              >
                <span>🔍</span>
                <span>Detalhes</span>
              </button>
            ` : `
              <span class="text-slate-300 text-xs">—</span>
            `}
          </td>
        </tr>
      `;
    }).join("");
  }
};

// Exporta globalmente
window.AuditLogModule = AuditLogModule;
