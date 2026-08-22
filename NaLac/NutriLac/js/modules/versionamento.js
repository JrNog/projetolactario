/**
 * Módulo de Versionamento e Pontos de Restauração dos Catálogos - Lactário HSP / NutriLac
 * Permite criar snapshots automáticos e manuais das 5 listas de referência (Fórmulas,
 * Enfermarias, Intervalos, Vias e Dispositivos), comparar alterações (Diff) e reverter
 * o sistema para qualquer versão pretérita com segurança total e 1 clique.
 */

const VersionamentoModule = {
  STORAGE_KEY: "lac_catalog_versions",
  MAX_VERSIONS: 100,

  /**
   * Captura o estado atual completo dos 5 catálogos
   */
  obterEstadoAtualDosCatalogos() {
    let formulas = [];
    let enfermarias = [];
    let intervalos = [];
    let vias = [];
    let dispositivos = [];

    try {
      formulas = typeof App !== "undefined" && App.obterDietasAtivas ? App.obterDietasAtivas() : (JSON.parse(localStorage.getItem("lac_custom_dietas_v2")) || (typeof DIETAS_PADRAO !== "undefined" ? DIETAS_PADRAO : []));
    } catch (e) {
      formulas = typeof DIETAS_PADRAO !== "undefined" ? DIETAS_PADRAO : [];
    }

    try {
      enfermarias = typeof App !== "undefined" && App.obterEnfermariasAtivas ? App.obterEnfermariasAtivas() : (JSON.parse(localStorage.getItem("lac_custom_enfermarias")) || (typeof ENFERMARIAS_PADRAO !== "undefined" ? ENFERMARIAS_PADRAO : []));
    } catch (e) {
      enfermarias = typeof ENFERMARIAS_PADRAO !== "undefined" ? ENFERMARIAS_PADRAO : [];
    }

    try {
      intervalos = typeof App !== "undefined" && App.obterIntervalosAtivos ? App.obterIntervalosAtivos() : (JSON.parse(localStorage.getItem("lac_custom_intervalos")) || (typeof INTERVALOS_PADRAO !== "undefined" ? INTERVALOS_PADRAO : []));
    } catch (e) {
      intervalos = typeof INTERVALOS_PADRAO !== "undefined" ? INTERVALOS_PADRAO : [];
    }

    try {
      vias = typeof App !== "undefined" && App.obterViasAtivas ? App.obterViasAtivas() : (JSON.parse(localStorage.getItem("lac_custom_vias")) || (typeof VIAS_PADRAO !== "undefined" ? VIAS_PADRAO : []));
    } catch (e) {
      vias = typeof VIAS_PADRAO !== "undefined" ? VIAS_PADRAO : [];
    }

    try {
      dispositivos = typeof App !== "undefined" && App.obterDispositivosAtivos ? App.obterDispositivosAtivos() : (JSON.parse(localStorage.getItem("lac_custom_dispositivos")) || (typeof DISPOSITIVOS_PADRAO !== "undefined" ? DISPOSITIVOS_PADRAO : []));
    } catch (e) {
      dispositivos = typeof DISPOSITIVOS_PADRAO !== "undefined" ? DISPOSITIVOS_PADRAO : [];
    }

    return {
      formulas: JSON.parse(JSON.stringify(formulas)),
      enfermarias: JSON.parse(JSON.stringify(enfermarias)),
      intervalos: JSON.parse(JSON.stringify(intervalos)),
      vias: JSON.parse(JSON.stringify(vias)),
      dispositivos: JSON.parse(JSON.stringify(dispositivos))
    };
  },

  /**
   * Carrega a lista de versões salvas
   */
  carregarVersoes() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Erro ao carregar versões de catálogo:", e);
      return [];
    }
  },

  /**
   * Salva a lista de versões no LocalStorage
   */
  salvarVersoes(versoes) {
    try {
      if (versoes.length > this.MAX_VERSIONS) {
        versoes = versoes.slice(0, this.MAX_VERSIONS);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(versoes));
    } catch (e) {
      console.error("Erro ao salvar versões de catálogo:", e);
    }
  },

  /**
   * Formata nome padronizado de snapshot
   * Ex: Valores_Catálogo_e_Listas_de_Referência_do_Lactário_em_20-08-2026_22h29min47s
   */
  gerarNomePadrao(data = new Date()) {
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, "0");
    const min = String(data.getMinutes()).padStart(2, "0");
    const seg = String(data.getSeconds()).padStart(2, "0");

    return `Valores_Catálogo_e_Listas_de_Referência_do_Lactário_em_${dia}-${mes}-${ano}_${hora}h${min}min${seg}s`;
  },

  /**
   * Cria um novo snapshot de versionamento
   * @param {string} tipo - "AUTOMATICO" | "MANUAL" | "RESTAURACAO" | "PADRAO_FABRICA"
   * @param {string} motivo - Descrição da razão do snapshot
   * @param {string} nomeCustomizado - Nome opcional customizado pelo usuário
   */
  criarSnapshot(tipo = "AUTOMATICO", motivo = "Ponto de restauração do sistema", nomeCustomizado = "") {
    const agora = new Date();
    const estado = this.obterEstadoAtualDosCatalogos();
    const versoes = this.carregarVersoes();

    let responsavel = "Nutricionista Responsável";
    try {
      const nutriConfig = JSON.parse(localStorage.getItem("lac_nutri_config") || "{}");
      if (nutriConfig.nome) {
        responsavel = `${nutriConfig.nome} (${nutriConfig.crn || "CRN"})`;
      }
    } catch (e) {}

    const nomeVersao = nomeCustomizado.trim() || this.gerarNomePadrao(agora);

    const snapshot = {
      id: "ver-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
      nome: nomeVersao,
      timestamp: agora.toISOString(),
      dataHoraFormatada: agora.toLocaleDateString("pt-BR") + " às " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      tipo: tipo,
      motivo: motivo || "Atualização de parâmetros clínicos",
      responsavel: responsavel,
      metricas: {
        totalFormulas: estado.formulas.length,
        totalEnfermarias: estado.enfermarias.length,
        totalIntervalos: estado.intervalos.length,
        totalVias: estado.vias.length,
        totalDispositivos: estado.dispositivos.length
      },
      dados: estado
    };

    // Adiciona no topo
    versoes.unshift(snapshot);
    this.salvarVersoes(versoes);

    // Registra no Log de Auditoria
    if (typeof AuditLogModule !== "undefined") {
      AuditLogModule.registrar(
        "VERSIONAMENTO",
        "CRIACAO",
        `Novo ponto de restauração gerado: ${nomeVersao}`,
        [],
        { tipoSnapshot: tipo, motivo: motivo, snapshotId: snapshot.id }
      );
    }

    return snapshot;
  },

  /**
   * Obtém uma versão pelo ID
   */
  obterPorId(snapshotId) {
    const versoes = this.carregarVersoes();
    return versoes.find(v => v.id === snapshotId) || null;
  },

  /**
   * Compara uma versão com o estado atual do sistema (Gera Diff)
   */
  compararComAtual(snapshotId) {
    const snapshot = this.obterPorId(snapshotId);
    if (!snapshot) return null;

    const atual = this.obterEstadoAtualDosCatalogos();
    const dadosVersao = snapshot.dados;

    const diffs = {
      snapshot: snapshot,
      formulas: this._compararListas(dadosVersao.formulas, atual.formulas, "nome", ["diluicaoPadrao", "g_po_100ml", "ml_agua_100ml", "colherMedidaG", "lataG", "categoria"]),
      enfermarias: this._compararListas(dadosVersao.enfermarias, atual.enfermarias, "nome", ["sigla", "localizacao", "leitos"]),
      intervalos: this._compararListas(dadosVersao.intervalos, atual.intervalos, "codigo", ["nome", "vezes", "horarios"]),
      vias: this._compararListas(dadosVersao.vias, atual.vias, "nome", ["descricao", "categoria"]),
      dispositivos: this._compararListas(dadosVersao.dispositivos, atual.dispositivos, "nome", ["categoria", "capacidadeMaxMl"])
    };

    let totalModificacoes = 
      diffs.formulas.modificados.length + diffs.formulas.adicionados.length + diffs.formulas.removidos.length +
      diffs.enfermarias.modificados.length + diffs.enfermarias.adicionados.length + diffs.enfermarias.removidos.length +
      diffs.intervalos.modificados.length + diffs.intervalos.adicionados.length + diffs.intervalos.removidos.length +
      diffs.vias.modificados.length + diffs.vias.adicionados.length + diffs.vias.removidos.length +
      diffs.dispositivos.modificados.length + diffs.dispositivos.adicionados.length + diffs.dispositivos.removidos.length;

    diffs.totalModificacoes = totalModificacoes;
    return diffs;
  },

  _compararListas(listaVersao = [], listaAtual = [], chave = "nome", camposComparar = []) {
    const mapaAtual = new Map();
    listaAtual.forEach(item => {
      const k = String(item[chave] || "").toLowerCase().trim();
      mapaAtual.set(k, item);
    });

    const mapaVersao = new Map();
    listaVersao.forEach(item => {
      const k = String(item[chave] || "").toLowerCase().trim();
      mapaVersao.set(k, item);
    });

    const modificados = [];
    const adicionados = []; // Itens que serão re-adicionados pela versão
    const removidos = [];   // Itens que estavam no atual mas não existem na versão

    // 1. Verifica itens da versão contra atual
    mapaVersao.forEach((itemVersao, k) => {
      if (!mapaAtual.has(k)) {
        adicionados.push(itemVersao);
      } else {
        const itemAtual = mapaAtual.get(k);
        const camposAlterados = [];

        camposComparar.forEach(c => {
          const valVersao = String(itemVersao[c] !== undefined ? itemVersao[c] : "");
          const valAtual = String(itemAtual[c] !== undefined ? itemAtual[c] : "");

          if (valVersao !== valAtual) {
            camposAlterados.push({
              campo: c,
              valorVersao: valVersao,
              valorAtual: valAtual
            });
          }
        });

        if (camposAlterados.length > 0) {
          modificados.push({
            item: itemVersao,
            nome: itemVersao[chave] || k,
            campos: camposAlterados
          });
        }
      }
    });

    // 2. Itens que serão removidos porque só existem no atual
    mapaAtual.forEach((itemAtual, k) => {
      if (!mapaVersao.has(k)) {
        removidos.push(itemAtual);
      }
    });

    return { modificados, adicionados, removidos };
  },

  /**
   * Restaura uma versão específica para o sistema ativo
   */
  restaurarVersao(snapshotId) {
    const snapshot = this.obterPorId(snapshotId);
    if (!snapshot) {
      alert("Versão de catálogo não encontrada!");
      return false;
    }

    // 1. Cria um snapshot de segurança antes de restaurar
    this.criarSnapshot(
      "AUTOMATICO", 
      `Backup automático de segurança antes de restaurar a versão "${snapshot.nome}"`
    );

    // 2. Aplica os dados da versão nos 5 catálogos
    try {
      localStorage.setItem("lac_custom_dietas_v2", JSON.stringify(snapshot.dados.formulas || []));
      localStorage.setItem("lac_custom_enfermarias", JSON.stringify(snapshot.dados.enfermarias || []));
      localStorage.setItem("lac_custom_intervalos", JSON.stringify(snapshot.dados.intervalos || []));
      localStorage.setItem("lac_custom_vias", JSON.stringify(snapshot.dados.vias || []));
      localStorage.setItem("lac_custom_dispositivos", JSON.stringify(snapshot.dados.dispositivos || []));
    } catch (e) {
      console.error("Erro ao aplicar versão no LocalStorage:", e);
      alert("Falha ao gravar os dados da versão!");
      return false;
    }

    // 3. Registra no Log de Auditoria
    if (typeof AuditLogModule !== "undefined") {
      AuditLogModule.registrar(
        "VERSIONAMENTO",
        "RESTAURACAO",
        `Catálogos restaurados para a versão: ${snapshot.nome}`,
        [
          { campo: "Versão Aplicada", de: "Estado Anterior", para: snapshot.nome },
          { campo: "Data da Versão", de: "-", para: snapshot.dataHoraFormatada }
        ],
        { snapshotId: snapshot.id, nomeVersao: snapshot.nome }
      );
    }

    // 4. Recarrega as views na aplicação
    if (typeof App !== "undefined") {
      if (App.renderizarConfiguracoes) App.renderizarConfiguracoes();
      if (App.renderizarCenso) App.renderizarCenso();
      if (App.renderizarBancada) App.renderizarBancada();
      if (App.renderizarSPDM) App.renderizarSPDM();
      if (App.renderizarCompras) App.renderizarCompras();
      if (App.renderizarDashboard) App.renderizarDashboard();
    }

    return true;
  },

  /**
   * Exporta uma versão específica em arquivo JSON
   */
  exportarVersaoJSON(snapshotId) {
    const snapshot = this.obterPorId(snapshotId);
    if (!snapshot) return;

    const jsonStr = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${snapshot.nome}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Importa uma versão de catálogo a partir de um arquivo JSON
   */
  importarVersaoJSON(conteudoJSON) {
    try {
      const snapshot = JSON.parse(conteudoJSON);
      if (!snapshot.dados || !snapshot.dados.formulas) {
        throw new Error("Formato de arquivo de versão inválido.");
      }

      const versoes = this.carregarVersoes();
      snapshot.id = "ver-import-" + Date.now();
      snapshot.tipo = "MANUAL";
      snapshot.motivo = "Versão importada de arquivo externo";

      versoes.unshift(snapshot);
      this.salvarVersoes(versoes);

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "VERSIONAMENTO",
          "CRIACAO",
          `Versão importada via arquivo JSON: ${snapshot.nome}`,
          [],
          { snapshotId: snapshot.id }
        );
      }

      return snapshot;
    } catch (e) {
      console.error("Erro na importação de versão JSON:", e);
      throw e;
    }
  },

  /**
   * Renderiza a tabela de versões na sub-aba de configurações
   */
  renderizarTabela() {
    const container = document.getElementById("tabela-config-versoes-corpo");
    const contadorEl = document.getElementById("config-contador-versoes");
    if (!container) return;

    const versoes = this.carregarVersoes();
    if (contadorEl) {
      contadorEl.innerText = `${versoes.length} versão(ões)`;
    }

    if (!versoes.length) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="py-12 text-center text-slate-400">
            <div class="text-3xl mb-2">📑</div>
            <div class="font-bold text-xs text-slate-600">Nenhum ponto de restauração registrado</div>
            <p class="text-[11px] text-slate-400 mt-1">Ao editar qualquer fórmula ou catálogo, um snapshot será gerado automaticamente.</p>
            <div class="mt-3">
              <button 
                onclick="App.abrirModalNovoSnapshot()" 
                class="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>📸</span>
                <span>Criar Primeiro Ponto de Restauração Agora</span>
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = versoes.map((v, idx) => {
      let badgeTipo = "bg-purple-100 text-purple-900 border-purple-300";
      let labelTipo = "Automático";
      if (v.tipo === "MANUAL") {
        badgeTipo = "bg-blue-100 text-blue-900 border-blue-300";
        labelTipo = "Manual (Nutricionista)";
      } else if (v.tipo === "PADRAO_FABRICA") {
        badgeTipo = "bg-emerald-100 text-emerald-900 border-emerald-300";
        labelTipo = "Padrão de Fábrica";
      } else if (v.tipo === "RESTAURACAO") {
        badgeTipo = "bg-amber-100 text-amber-900 border-amber-300";
        labelTipo = "Pós-Restauração";
      }

      return `
        <tr class="hover:bg-purple-50/40 transition-colors ${idx === 0 ? 'bg-purple-50/20' : ''}">
          <!-- 1. Nome da Versão -->
          <td class="py-3 px-3">
            <div class="font-mono font-bold text-xs text-purple-950 flex items-center gap-1.5">
              <span>📑</span>
              <span class="truncate max-w-[340px]" title="${escapeHtml(v.nome)}">${escapeHtml(v.nome)}</span>
              ${idx === 0 ? '<span class="px-1.5 py-0.5 bg-purple-600 text-white text-[9.5px] font-black rounded-full uppercase tracking-wider">Última</span>' : ''}
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(v.motivo || "-")}</div>
          </td>

          <!-- 2. Tipo de Snapshot -->
          <td class="py-3 px-2 text-center">
            <span class="inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${badgeTipo}">
              ${labelTipo}
            </span>
          </td>

          <!-- 3. Data e Hora -->
          <td class="py-3 px-3 whitespace-nowrap">
            <div class="font-bold text-xs text-slate-900 font-mono">${v.dataHoraFormatada}</div>
            <div class="text-[10px] text-slate-400">${escapeHtml(v.responsavel || "-")}</div>
          </td>

          <!-- 4. Resumo de Conteúdo -->
          <td class="py-3 px-3 whitespace-nowrap">
            <div class="flex flex-wrap items-center gap-1 text-[10.5px] font-mono text-purple-900 font-bold">
              <span class="bg-purple-100/70 px-1.5 py-0.5 rounded border border-purple-200">${v.metricas?.totalFormulas || 0} Fórmulas</span>
              <span class="bg-blue-100/70 px-1.5 py-0.5 rounded border border-blue-200">${v.metricas?.totalEnfermarias || 0} Enfermarias</span>
            </div>
          </td>

          <!-- 5. Ações -->
          <td class="py-3 px-3 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-1.5">
              <button 
                onclick="App.abrirComparativoSnapshot('${v.id}')"
                class="px-2.5 py-1 text-xs font-bold text-purple-950 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                title="Comparar o que muda com relação ao estado atual"
              >
                <span>🔍</span>
                <span>Comparar</span>
              </button>

              <button 
                onclick="App.restaurarVersaoSnapshot('${v.id}')"
                class="px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 border border-purple-400 rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                title="Restaurar todos os catálogos para esta versão"
              >
                <span>⏪</span>
                <span>Restaurar</span>
              </button>

              <button 
                onclick="App.exportarVersaoSnapshot('${v.id}')"
                class="px-2 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="Baixar arquivo JSON desta versão"
              >
                <span>💾</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }
};

// Exporta globalmente
window.VersionamentoModule = VersionamentoModule;
