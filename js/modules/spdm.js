/**
 * Módulo de Censo Consolidado para SPDM
 * Lactário - Hospital São Paulo (UNIFESP-EPM) / SPDM
 * 
 * Centraliza e computa as 4 seções oficiais:
 * 1. CENSO DISPOS (Contagem de Dispositivos por Enfermaria)
 * 2. CENSO VOLUME AUT (Volumes de Dietas Autoclavadas)
 * 3. CENSO VOLUME N AUT (Volumes de Dietas Não Autoclavadas / Bancada Estéril)
 * 4. ABREVIAÇÃO JE (Abreviação de Jejum - Chá com Maltodextrina)
 */

const SpdmModule = {
  secaoAtiva: "todas",
  termoBusca: "",

  /**
   * Remove acentuação e padroniza string para matching robusto
   */
  removerAcentos(str) {
    if (!str) return "";
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase();
  },

  /**
   * Determina se o paciente pertence à enfermaria
   */
  pacientePertenceEnfermaria(paciente, enf) {
    if (!paciente || !enf) return false;
    const pLeito = SpdmModule.removerAcentos(paciente.leito);
    const pEnfNome = SpdmModule.removerAcentos(paciente.enfermariaNome);
    const pEnfId = SpdmModule.removerAcentos(paciente.enfermaria);

    const enfNome = SpdmModule.removerAcentos(enf.nome);
    const enfId = SpdmModule.removerAcentos(enf.id);
    const ini = SpdmModule.removerAcentos(enf.leitoInicial);
    const fim = SpdmModule.removerAcentos(enf.leitoFinal);

    // 1. Match direto por nome ou ID da enfermaria (normalizado sem acentos)
    if (pEnfNome && (pEnfNome === enfNome || enfNome.includes(pEnfNome) || pEnfNome.includes(enfNome))) return true;
    if (pEnfId && (pEnfId === enfId || pEnfId.includes(enfId) || enfId.includes(pEnfId))) return true;

    // 2. Match por faixa de leitos
    if (pLeito && ini && fim) {
      if (pLeito >= ini && pLeito <= fim) return true;
    }

    // 3. Match por prefixo do leito (ex: A08 para UTI Neonatal, A09 para Pediatria)
    if (pLeito && ini) {
      const prefix = ini.substring(0, 3);
      if (prefix && pLeito.startsWith(prefix)) return true;
    }

    return false;
  },

  /**
   * Processa todos os pacientes ativos e gera as matrizes consolidadas para as 4 seções da SPDM
   */
  calcularCensoSPDM(pacientesAtivos) {
    const enfermarias = (typeof ENFERMARIAS_SPDM !== "undefined")
      ? ENFERMARIAS_SPDM
      : (window.ENFERMARIAS_SPDM || []);

    if (!Array.isArray(pacientesAtivos)) {
      pacientesAtivos = (typeof CensoModule !== "undefined" && typeof CensoModule.getPacientesAtivos === "function")
        ? CensoModule.getPacientesAtivos()
        : [];
    }

    const ativos = pacientesAtivos.filter(p => !p.suspenso && !p.alta);

    // Matriz de Dispositivos por Enfermaria
    const dadosDispositivos = [];
    // Matriz de Volume Autoclavadas por Enfermaria
    const dadosVolumeAut = [];
    // Matriz de Volume Não Autoclavadas por Enfermaria
    const dadosVolumeNAut = [];
    // Lista de Pacientes em Abreviação de Jejum
    const dadosJejum = [];

    // Inicializa totais gerais
    const totalDisp = {
      agua: 0,
      mamadeira: 0,
      frascoEnteral: 0,
      frascoVO: 0,
      chucaSemBico: 0,
      copo: 0,
      seringa: 0,
      equipoRoxo: 0,
      totalGeral: 0
    };

    const totalAut = {
      preNan: 0,
      preNanConc: 0,
      nan1: 0,
      nan1Conc: 0,
      nan2: 0,
      nan2Conc: 0,
      aptamilSoja: 0,
      ninho: 0,
      totalVol: 0
    };

    const totalNAut = {
      neocate: 0,
      neocateConc: 0,
      leiteDesnatado: 0,
      monogen: 0,
      pregomin130: 0,
      pregomin125: 0,
      pregomin120: 0,
      leiteSL: 0,
      nanSL: 0,
      nanSLConc: 0,
      nanEspessar: 0,
      nanEspessarConc: 0,
      peptamenJr: 0,
      fortini: 0,
      fortiniConc: 0,
      infatrini: 0,
      modulen1: 0,
      modulen2: 0,
      totalVol: 0
    };

    enfermarias.forEach(enf => {
      // Pacientes desta enfermaria
      const pacsEnf = ativos.filter(p => SpdmModule.pacientePertenceEnfermaria(p, enf));

      // 1. DISPOSITIVOS
      const rowDisp = {
        enfermaria: enf.nome,
        andar: enf.andar,
        agua: 0,
        mamadeira: 0,
        frascoEnteral: 0,
        frascoVO: 0,
        chucaSemBico: 0,
        copo: 0,
        seringa: 0,
        equipoRoxo: 0,
        totalLinha: 0
      };

      // 2. VOLUME AUTOCLAVADAS
      const rowAut = {
        enfermaria: enf.nome,
        preNan: 0,
        preNanConc: 0,
        nan1: 0,
        nan1Conc: 0,
        nan2: 0,
        nan2Conc: 0,
        aptamilSoja: 0,
        ninho: 0,
        totalLinha: 0
      };

      // 3. VOLUME NÃO AUTOCLAVADAS
      const rowNAut = {
        enfermaria: enf.nome,
        neocate: 0,
        neocateConc: 0,
        leiteDesnatado: 0,
        monogen: 0,
        pregomin130: 0,
        pregomin125: 0,
        pregomin120: 0,
        leiteSL: 0,
        nanSL: 0,
        nanSLConc: 0,
        nanEspessar: 0,
        nanEspessarConc: 0,
        peptamenJr: 0,
        fortini: 0,
        fortiniConc: 0,
        infatrini: 0,
        modulen1: 0,
        modulen2: 0,
        totalLinha: 0
      };

      pacsEnf.forEach(p => {
        const volUnit = Number(p.volumeMl) || 0;
        const vezes = Number(p.vezesDia) || 0;
        const volDia = volUnit * vezes;
        const disp = String(p.dispositivo || "").toLowerCase();
        const dietaId = String(p.dietaId || "").toLowerCase();
        const dietaNome = String(p.dietaNome || "").toLowerCase();

        // 1. Contagem de Dispositivos
        if (disp.includes("mamadeira")) {
          rowDisp.mamadeira += vezes;
        } else if (disp.includes("chuca")) {
          rowDisp.chucaSemBico += vezes;
        } else if (disp.includes("enteral") || disp.includes("frasco enteral")) {
          rowDisp.frascoEnteral += vezes;
          rowDisp.equipoRoxo += vezes; // 1 equipo roxo por frasco enteral
        } else if (disp.includes("frasco v.o") || disp.includes("frasco oral")) {
          rowDisp.frascoVO += vezes;
        } else if (disp.includes("seringa")) {
          rowDisp.seringa += vezes;
        } else if (disp.includes("copo")) {
          rowDisp.copo += vezes;
        } else {
          rowDisp.mamadeira += vezes;
        }

        // 2. Classificação de Volumes Autoclavados
        if (dietaId.includes("pre_nan_conc") || dietaNome.includes("pre nan conc") || dietaNome.includes("prenan conc")) {
          rowAut.preNanConc += volDia;
        } else if (dietaId.includes("pre_nan") || dietaNome.includes("pre nan") || dietaNome.includes("prenan")) {
          rowAut.preNan += volDia;
        } else if (dietaId.includes("nan_1_conc") || dietaNome.includes("nan 1 conc")) {
          rowAut.nan1Conc += volDia;
        } else if (dietaId.includes("nan_1") || dietaNome.includes("nan 1")) {
          rowAut.nan1 += volDia;
        } else if (dietaId.includes("nan_2_conc") || dietaNome.includes("nan 2 conc")) {
          rowAut.nan2Conc += volDia;
        } else if (dietaId.includes("nan_2") || dietaNome.includes("nan 2")) {
          rowAut.nan2 += volDia;
        } else if (dietaId.includes("soja") || dietaNome.includes("soja") || dietaNome.includes("aptamil soja")) {
          rowAut.aptamilSoja += volDia;
        } else if (dietaId.includes("ninho") || dietaNome.includes("ninho") || dietaNome.includes("ld_")) {
          rowAut.ninho += volDia;
        }

        // 3. Classificação de Volumes Não Autoclavados
        if (dietaId.includes("neocate_conc") || dietaNome.includes("neocate conc")) {
          rowNAut.neocateConc += volDia;
        } else if (dietaId.includes("neocate") || dietaNome.includes("neocate")) {
          rowNAut.neocate += volDia;
        } else if (dietaId.includes("desnatado") || dietaNome.includes("desnatado")) {
          rowNAut.leiteDesnatado += volDia;
        } else if (dietaId.includes("monogen") || dietaNome.includes("monogen")) {
          rowNAut.monogen += volDia;
        } else if (dietaNome.includes("1:20") || dietaId.includes("1_20")) {
          rowNAut.pregomin120 += volDia;
        } else if (dietaNome.includes("1:25") || dietaId.includes("1_25")) {
          rowNAut.pregomin125 += volDia;
        } else if (dietaId.includes("pregomin") || dietaNome.includes("pregomin")) {
          rowNAut.pregomin130 += volDia;
        } else if (dietaId.includes("sem_lactose") || dietaNome.includes("sem lactose")) {
          if (dietaNome.includes("nan")) rowNAut.nanSL += volDia;
          else rowNAut.leiteSL += volDia;
        } else if (dietaId.includes("espessar") || dietaNome.includes("espessar")) {
          rowNAut.nanEspessar += volDia;
        } else if (dietaId.includes("peptamen") || dietaNome.includes("peptamen")) {
          rowNAut.peptamenJr += volDia;
        } else if (dietaId.includes("fortini_conc") || dietaNome.includes("fortini conc") || dietaNome.includes("1.5")) {
          rowNAut.fortiniConc += volDia;
        } else if (dietaId.includes("fortini") || dietaNome.includes("fortini")) {
          rowNAut.fortini += volDia;
        } else if (dietaId.includes("infatrini") || dietaNome.includes("infatrini")) {
          rowNAut.infatrini += volDia;
        } else if (dietaNome.includes("modulen 2") || dietaId.includes("modulen_2")) {
          rowNAut.modulen2 += volDia;
        } else if (dietaId.includes("modulen") || dietaNome.includes("modulen")) {
          rowNAut.modulen1 += volDia;
        }
      });

      // Totais da Linha de Dispositivos
      rowDisp.totalLinha = rowDisp.agua + rowDisp.mamadeira + rowDisp.frascoEnteral + rowDisp.frascoVO + rowDisp.chucaSemBico + rowDisp.copo + rowDisp.seringa;
      dadosDispositivos.push(rowDisp);

      // Soma ao Total Geral de Dispositivos
      totalDisp.agua += rowDisp.agua;
      totalDisp.mamadeira += rowDisp.mamadeira;
      totalDisp.frascoEnteral += rowDisp.frascoEnteral;
      totalDisp.frascoVO += rowDisp.frascoVO;
      totalDisp.chucaSemBico += rowDisp.chucaSemBico;
      totalDisp.copo += rowDisp.copo;
      totalDisp.seringa += rowDisp.seringa;
      totalDisp.equipoRoxo += rowDisp.equipoRoxo;
      totalDisp.totalGeral += rowDisp.totalLinha;

      // Totais da Linha de Autoclavadas
      rowAut.totalLinha = rowAut.preNan + rowAut.preNanConc + rowAut.nan1 + rowAut.nan1Conc + rowAut.nan2 + rowAut.nan2Conc + rowAut.aptamilSoja + rowAut.ninho;
      dadosVolumeAut.push(rowAut);

      // Soma ao Total Geral Autoclavadas
      totalAut.preNan += rowAut.preNan;
      totalAut.preNanConc += rowAut.preNanConc;
      totalAut.nan1 += rowAut.nan1;
      totalAut.nan1Conc += rowAut.nan1Conc;
      totalAut.nan2 += rowAut.nan2;
      totalAut.nan2Conc += rowAut.nan2Conc;
      totalAut.aptamilSoja += rowAut.aptamilSoja;
      totalAut.ninho += rowAut.ninho;
      totalAut.totalVol += rowAut.totalLinha;

      // Totais da Linha de Não Autoclavadas
      rowNAut.totalLinha = rowNAut.neocate + rowNAut.neocateConc + rowNAut.leiteDesnatado + rowNAut.monogen + 
                           rowNAut.pregomin130 + rowNAut.pregomin125 + rowNAut.pregomin120 + rowNAut.leiteSL + 
                           rowNAut.nanSL + rowNAut.nanSLConc + rowNAut.nanEspessar + rowNAut.nanEspessarConc + 
                           rowNAut.peptamenJr + rowNAut.fortini + rowNAut.fortiniConc + rowNAut.infatrini + 
                           rowNAut.modulen1 + rowNAut.modulen2;
      dadosVolumeNAut.push(rowNAut);

      // Soma ao Total Geral Não Autoclavadas
      totalNAut.neocate += rowNAut.neocate;
      totalNAut.neocateConc += rowNAut.neocateConc;
      totalNAut.leiteDesnatado += rowNAut.leiteDesnatado;
      totalNAut.monogen += rowNAut.monogen;
      totalNAut.pregomin130 += rowNAut.pregomin130;
      totalNAut.pregomin125 += rowNAut.pregomin125;
      totalNAut.pregomin120 += rowNAut.pregomin120;
      totalNAut.leiteSL += rowNAut.leiteSL;
      totalNAut.nanSL += rowNAut.nanSL;
      totalNAut.nanSLConc += rowNAut.nanSLConc;
      totalNAut.nanEspessar += rowNAut.nanEspessar;
      totalNAut.nanEspessarConc += rowNAut.nanEspessarConc;
      totalNAut.peptamenJr += rowNAut.peptamenJr;
      totalNAut.fortini += rowNAut.fortini;
      totalNAut.fortiniConc += rowNAut.fortiniConc;
      totalNAut.infatrini += rowNAut.infatrini;
      totalNAut.modulen1 += rowNAut.modulen1;
      totalNAut.modulen2 += rowNAut.modulen2;
      totalNAut.totalVol += rowNAut.totalLinha;
    });

    // 4. Pacientes em Abreviação de Jejum
    ativos.forEach(p => {
      const dId = String(p.dietaId || "").toLowerCase();
      const dNome = String(p.dietaNome || "").toLowerCase();
      if (dId.includes("jejum") || dNome.includes("jejum") || dNome.includes("maltodextrina")) {
        dadosJejum.push({
          data: new Date().toLocaleDateString("pt-BR"),
          leito: p.leito || "-",
          nome: p.nome || "Paciente",
          obs: p.observacoes || "-",
          dieta: "CHÁ + 25G MALTO",
          volume: p.volumeMl || 200,
          vezes: p.vezesDia || 2,
          horarios: Array.isArray(p.horarios) ? p.horarios.join(", ") : "24h, 03h"
        });
      }
    });

    return {
      dispositivos: dadosDispositivos,
      totalDispositivos: totalDisp,
      volumeAut: dadosVolumeAut,
      totalVolumeAut: totalAut,
      volumeNAut: dadosVolumeNAut,
      totalVolumeNAut: totalNAut,
      jejum: dadosJejum,
      totalPacientesAtivos: ativos.length
    };
  },

  /**
   * Renderiza a interface da aba SPDM no DOM
   */
  renderizarAba(pacientesAtivos) {
    const container = document.getElementById("tab-spdm");
    if (!container) return;

    const calculo = SpdmModule.calcularCensoSPDM(pacientesAtivos);
    const termo = String(SpdmModule.termoBusca || "").trim().toLowerCase();

    // Filtra enfermarias se busca informada
    const dispFiltrado = calculo.dispositivos.filter(d => !termo || d.enfermaria.toLowerCase().includes(termo));
    const autFiltrado = calculo.volumeAut.filter(d => !termo || d.enfermaria.toLowerCase().includes(termo));
    const nAutFiltrado = calculo.volumeNAut.filter(d => !termo || d.enfermaria.toLowerCase().includes(termo));

    container.innerHTML = `
      <div class="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        
        <!-- Zona Superior Fixa/Congelada do SPDM (Banner + Seletor de Seções + Busca) -->
        <div class="shrink-0 space-y-2 mb-2 z-30">
          <!-- Barra de Cabeçalho e Ações SPDM -->
          <div class="bg-gradient-to-r from-purple-950 via-slate-950 to-purple-950 text-white rounded-xl p-3.5 shadow-sm border border-purple-900/40 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div class="text-[10px] uppercase font-black tracking-wider text-pink-300">HOSPITAL SÃO PAULO • CENTRAL DE NUTRIÇÃO E DIETÉTICA</div>
              <h2 class="text-sm sm:text-base font-black tracking-wide text-white mt-0.5">RELAÇÃO CONSOLIDADA PARA SPDM</h2>
              <p class="text-xs text-purple-200 mt-0.5">
                Consolidação automática dos 4 relatórios: Dispositivos, Volumes Autoclavados, Não Autoclavados e Abreviação de Jejum.
              </p>
            </div>

            <!-- Botões de Ação -->
            <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
              <button 
                onclick="SpdmModule.exportarCSV()"
                class="px-3 py-1.5 rounded-lg text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs font-bold"
              >
                <span>📄</span>
                <span>Exportar CSV</span>
              </button>

              <button 
                onclick="SpdmModule.imprimirRelatorioSPDM()"
                class="px-3.5 py-1.5 rounded-lg text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 border border-purple-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs font-bold text-xs"
              >
                <span>🖨️</span>
                <span>IMPRIMIR</span>
              </button>
            </div>
          </div>

          <!-- Seletor de Seções e Barra de Busca -->
          <div class="bg-white/95 backdrop-blur-md border border-purple-200/80 rounded-xl p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <!-- Filtro de Seção -->
            <div class="flex flex-wrap gap-1.5">
              <button 
                onclick="SpdmModule.setSecao('todas')"
                class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${SpdmModule.secaoAtiva === 'todas' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black shadow-xs border border-purple-500' : 'bg-purple-50/70 text-purple-950 hover:bg-purple-100 border border-purple-200/80'}"
              >
                Todos os Relatórios
              </button>
              <button 
                onclick="SpdmModule.setSecao('disp')"
                class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${SpdmModule.secaoAtiva === 'disp' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black shadow-xs border border-purple-500' : 'bg-purple-50/70 text-purple-950 hover:bg-purple-100 border border-purple-200/80'}"
              >
                1. Dispositivos (${calculo.totalDispositivos.totalGeral})
              </button>
              <button 
                onclick="SpdmModule.setSecao('aut')"
                class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${SpdmModule.secaoAtiva === 'aut' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black shadow-xs border border-purple-500' : 'bg-purple-50/70 text-purple-950 hover:bg-purple-100 border border-purple-200/80'}"
              >
                2. Volumes Autoclavadas (${(calculo.totalVolumeAut.totalVol/1000).toFixed(2)}L)
              </button>
              <button 
                onclick="SpdmModule.setSecao('naut')"
                class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${SpdmModule.secaoAtiva === 'naut' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black shadow-xs border border-purple-500' : 'bg-purple-50/70 text-purple-950 hover:bg-purple-100 border border-purple-200/80'}"
              >
                3. Volumes Não Autoclavadas (${(calculo.totalVolumeNAut.totalVol/1000).toFixed(2)}L)
              </button>
              <button 
                onclick="SpdmModule.setSecao('jejum')"
                class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${SpdmModule.secaoAtiva === 'jejum' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black shadow-xs border border-purple-500' : 'bg-purple-50/70 text-purple-950 hover:bg-purple-100 border border-purple-200/80'}"
              >
                4. Abreviação Jejum (${calculo.jejum.length})
              </button>
            </div>

            <!-- Busca Rápida por Enfermaria -->
            <div class="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="🔍 Filtrar enfermaria..." 
                value="${escapeHtml(SpdmModule.termoBusca)}"
                oninput="SpdmModule.setTermoBusca(this.value)"
                class="w-full bg-slate-50 text-slate-900 text-xs px-3 py-1.5 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white placeholder:text-slate-400 font-semibold"
              />
            </div>
          </div>
        </div>

        <!-- Área de Conteúdo Rolável das Tabelas SPDM com Sticky Theads -->
        <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar w-full pb-4 pr-1 space-y-4">
          
          <!-- 1. TABELA DE DISPOSITIVOS (RELAÇÃO DISPOS) -->
          ${(SpdmModule.secaoAtiva === 'todas' || SpdmModule.secaoAtiva === 'disp') ? `
            <div class="bg-white border border-purple-200/80 rounded-xl overflow-hidden shadow-2xs" style="border-top: 4px solid #6b21a8;">
              <div class="bg-purple-50/70 px-4 py-2.5 border-b border-purple-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-base">🍼</span>
                  <h3 class="text-xs sm:text-sm font-bold text-purple-950 uppercase tracking-wider">
                    1. Relação de Dispositivos (Mamadeiras, Frascos, Copos, Seringas)
                  </h3>
                </div>
                <span class="text-xs font-bold text-purple-900 bg-purple-100/70 px-2.5 py-0.5 rounded border border-purple-300 font-mono">Total: ${calculo.totalDispositivos.totalGeral} unidades</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="sticky top-0 z-20 bg-purple-50/95 backdrop-blur-xs shadow-2xs">
                    <tr class="bg-purple-50/80 text-purple-950 font-bold border-b border-purple-200 text-xs uppercase">
                      <th class="py-2.5 px-3">Enfermaria / Setor</th>
                      <th class="py-2.5 px-2 text-center">Água</th>
                      <th class="py-2.5 px-2 text-center text-purple-900">Mamadeira</th>
                      <th class="py-2.5 px-2 text-center text-pink-900">Frasco Enteral</th>
                      <th class="py-2.5 px-2 text-center">Frasco V.O</th>
                      <th class="py-2.5 px-2 text-center">Chuca</th>
                      <th class="py-2.5 px-2 text-center">Copo</th>
                      <th class="py-2.5 px-2 text-center">Seringa</th>
                      <th class="py-2.5 px-2 text-center text-fuchsia-900">Equipo Roxo</th>
                      <th class="py-2.5 px-3 text-right text-purple-950 font-black">Total Disp.</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-purple-100 font-mono text-slate-700 bg-white">
                    ${dispFiltrado.map(row => `
                      <tr class="hover:bg-purple-50/40 transition-colors ${row.totalLinha > 0 ? '' : 'text-slate-400 opacity-60'}">
                        <td class="py-2 px-3 font-sans font-medium text-slate-800">${escapeHtml(row.enfermaria)}</td>
                        <td class="py-2 px-2 text-center">${row.agua || '-'}</td>
                        <td class="py-2 px-2 text-center font-bold ${row.mamadeira > 0 ? 'text-purple-900' : ''}">${row.mamadeira || '-'}</td>
                        <td class="py-2 px-2 text-center font-bold ${row.frascoEnteral > 0 ? 'text-pink-900' : ''}">${row.frascoEnteral || '-'}</td>
                        <td class="py-2 px-2 text-center">${row.frascoVO || '-'}</td>
                        <td class="py-2 px-2 text-center">${row.chucaSemBico || '-'}</td>
                        <td class="py-2 px-2 text-center">${row.copo || '-'}</td>
                        <td class="py-2 px-2 text-center">${row.seringa || '-'}</td>
                        <td class="py-2 px-2 text-center font-bold ${row.equipoRoxo > 0 ? 'text-fuchsia-900' : ''}">${row.equipoRoxo || '-'}</td>
                        <td class="py-2 px-3 text-right font-black text-slate-900">${row.totalLinha || '-'}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                  <tfoot>
                    <tr class="bg-purple-50/80 border-t-2 border-purple-200 font-bold font-mono text-purple-950 text-xs">
                      <td class="py-2.5 px-3 font-sans uppercase">SOMA TOTAL:</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalDispositivos.agua}</td>
                      <td class="py-2.5 px-2 text-center text-purple-900">${calculo.totalDispositivos.mamadeira}</td>
                      <td class="py-2.5 px-2 text-center text-pink-900">${calculo.totalDispositivos.frascoEnteral}</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalDispositivos.frascoVO}</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalDispositivos.chucaSemBico}</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalDispositivos.copo}</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalDispositivos.seringa}</td>
                      <td class="py-2.5 px-2 text-center text-fuchsia-900">${calculo.totalDispositivos.equipoRoxo}</td>
                      <td class="py-2.5 px-3 text-right font-black text-purple-950 text-sm">${calculo.totalDispositivos.totalGeral}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- 2. TABELA DE VOLUMES AUTOCLAVADOS (RELAÇÃO VOLUME AUT) -->
          ${(SpdmModule.secaoAtiva === 'todas' || SpdmModule.secaoAtiva === 'aut') ? `
            <div class="bg-white border border-purple-200/80 rounded-xl overflow-hidden shadow-2xs" style="border-top: 4px solid #86198f;">
              <div class="bg-purple-50/70 px-4 py-2.5 border-b border-purple-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-base">🔵</span>
                  <h3 class="text-xs sm:text-sm font-bold text-purple-950 uppercase tracking-wider">
                    2. Relação de Volume - Dietas Autoclavadas (ml)
                  </h3>
                </div>
                <span class="text-xs font-bold text-purple-900 bg-purple-100/70 px-2.5 py-0.5 rounded border border-purple-300 font-mono">Volume Total: ${(calculo.totalVolumeAut.totalVol/1000).toFixed(2)} L</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="sticky top-0 z-20 bg-purple-50/95 backdrop-blur-xs shadow-2xs">
                    <tr class="bg-purple-50/80 text-purple-950 font-bold border-b border-purple-200 text-xs uppercase">
                      <th class="py-2.5 px-3">Enfermaria / Setor</th>
                      <th class="py-2.5 px-2 text-center">Pré Nan</th>
                      <th class="py-2.5 px-2 text-center">Pré Nan Conc</th>
                      <th class="py-2.5 px-2 text-center">Nan 1</th>
                      <th class="py-2.5 px-2 text-center">Nan 1 Conc</th>
                      <th class="py-2.5 px-2 text-center">Nan 2</th>
                      <th class="py-2.5 px-2 text-center">Nan 2 Conc</th>
                      <th class="py-2.5 px-2 text-center">Aptamil Soja</th>
                      <th class="py-2.5 px-2 text-center">Ninho</th>
                      <th class="py-2.5 px-3 text-right text-purple-950 font-black">Total (ml)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-purple-100 font-mono text-slate-700 bg-white">
                    ${autFiltrado.map(row => `
                      <tr class="hover:bg-purple-50/40 transition-colors ${row.totalLinha > 0 ? '' : 'text-slate-400 opacity-60'}">
                        <td class="py-2 px-3 font-sans font-medium text-slate-800">${escapeHtml(row.enfermaria)}</td>
                        <td class="py-2 px-2 text-center font-bold ${row.preNan > 0 ? 'text-purple-900' : ''}">${row.preNan || '-'}</td>
                        <td class="py-2 px-2 text-center">${row.preNanConc || '-'}</td>
                        <td class="py-2 px-2 text-center font-bold ${row.nan1 > 0 ? 'text-purple-900' : ''}">${row.nan1 || '-'}</td>
                        <td class="py-2 px-2 text-center">${row.nan1Conc || '-'}</td>
                        <td class="py-2 px-2 text-center">${row.nan2 || '-'}</td>
                        <td class="py-2 px-2 text-center">${row.nan2Conc || '-'}</td>
                        <td class="py-2 px-2 text-center">${row.aptamilSoja || '-'}</td>
                        <td class="py-2 px-2 text-center">${row.ninho || '-'}</td>
                        <td class="py-2 px-3 text-right font-black text-slate-900">${row.totalLinha || '-'}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                  <tfoot>
                    <tr class="bg-purple-50/80 border-t-2 border-purple-200 font-bold font-mono text-purple-950 text-xs">
                      <td class="py-2.5 px-3 font-sans uppercase">SOMA TOTAL (ml):</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalVolumeAut.preNan}</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalVolumeAut.preNanConc}</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalVolumeAut.nan1}</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalVolumeAut.nan1Conc}</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalVolumeAut.nan2}</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalVolumeAut.nan2Conc}</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalVolumeAut.aptamilSoja}</td>
                      <td class="py-2.5 px-2 text-center">${calculo.totalVolumeAut.ninho}</td>
                      <td class="py-2.5 px-3 text-right font-black text-purple-950 text-sm">${calculo.totalVolumeAut.totalVol} ml</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- 3. TABELA DE VOLUMES NÃO AUTOCLAVADOS (RELAÇÃO VOLUME N AUT) -->
          ${(SpdmModule.secaoAtiva === 'todas' || SpdmModule.secaoAtiva === 'naut') ? `
            <div class="bg-white border border-purple-200/80 rounded-xl overflow-hidden shadow-2xs" style="border-top: 4px solid #db2777;">
              <div class="bg-purple-50/70 px-4 py-2.5 border-b border-purple-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-base">🟣</span>
                  <h3 class="text-xs sm:text-sm font-bold text-purple-950 uppercase tracking-wider">
                    3. Relação de Volume - Dietas Não Autoclavadas / Bancada Estéril (ml)
                  </h3>
                </div>
                <span class="text-xs font-bold text-pink-900 bg-pink-100/70 px-2.5 py-0.5 rounded border border-pink-300 font-mono">Volume Total: ${(calculo.totalVolumeNAut.totalVol/1000).toFixed(2)} L</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="sticky top-0 z-20 bg-purple-50/95 backdrop-blur-xs shadow-2xs">
                    <tr class="bg-purple-50/80 text-purple-950 font-bold border-b border-purple-200 text-[11px] sm:text-xs uppercase">
                      <th class="py-2.5 px-2.5">Enfermaria</th>
                      <th class="py-2.5 px-1.5 text-center">Neocate</th>
                      <th class="py-2.5 px-1.5 text-center">Neocate Conc</th>
                      <th class="py-2.5 px-1.5 text-center">Leite Desn</th>
                      <th class="py-2.5 px-1.5 text-center">Monogen</th>
                      <th class="py-2.5 px-1.5 text-center">Pregomin 1:30</th>
                      <th class="py-2.5 px-1.5 text-center">Pregomin 1:25</th>
                      <th class="py-2.5 px-1.5 text-center">Pregomin 1:20</th>
                      <th class="py-2.5 px-1.5 text-center">Leite SL</th>
                      <th class="py-2.5 px-1.5 text-center">Nan SL</th>
                      <th class="py-2.5 px-1.5 text-center">Nan Espessar</th>
                      <th class="py-2.5 px-1.5 text-center">Peptamen Jr</th>
                      <th class="py-2.5 px-1.5 text-center">Fortini</th>
                      <th class="py-2.5 px-1.5 text-center">Infatrini</th>
                      <th class="py-2.5 px-1.5 text-center">Modulen</th>
                      <th class="py-2.5 px-2.5 text-right text-purple-950 font-black">Total</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-purple-100 font-mono text-slate-700 bg-white">
                    ${nAutFiltrado.map(row => `
                      <tr class="hover:bg-purple-50/40 transition-colors ${row.totalLinha > 0 ? '' : 'text-slate-400 opacity-60'}">
                        <td class="py-2 px-2.5 font-sans font-medium text-slate-800 whitespace-nowrap">${escapeHtml(row.enfermaria)}</td>
                        <td class="py-2 px-1.5 text-center font-bold ${row.neocate > 0 ? 'text-purple-900' : ''}">${row.neocate || '-'}</td>
                        <td class="py-2 px-1.5 text-center">${row.neocateConc || '-'}</td>
                        <td class="py-2 px-1.5 text-center">${row.leiteDesnatado || '-'}</td>
                        <td class="py-2 px-1.5 text-center">${row.monogen || '-'}</td>
                        <td class="py-2 px-1.5 text-center font-bold ${row.pregomin130 > 0 ? 'text-purple-900' : ''}">${row.pregomin130 || '-'}</td>
                        <td class="py-2 px-1.5 text-center">${row.pregomin125 || '-'}</td>
                        <td class="py-2 px-1.5 text-center">${row.pregomin120 || '-'}</td>
                        <td class="py-2 px-1.5 text-center">${row.leiteSL || '-'}</td>
                        <td class="py-2 px-1.5 text-center">${row.nanSL || '-'}</td>
                        <td class="py-2 px-1.5 text-center">${row.nanEspessar || '-'}</td>
                        <td class="py-2 px-1.5 text-center">${row.peptamenJr || '-'}</td>
                        <td class="py-2 px-1.5 text-center font-bold ${row.fortini > 0 ? 'text-pink-900' : ''}">${row.fortini || '-'}</td>
                        <td class="py-2 px-1.5 text-center">${row.infatrini || '-'}</td>
                        <td class="py-2 px-1.5 text-center">${row.modulen1 || '-'}</td>
                        <td class="py-2 px-2.5 text-right font-black text-slate-900">${row.totalLinha || '-'}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                  <tfoot>
                    <tr class="bg-purple-50/80 border-t-2 border-purple-200 font-bold font-mono text-purple-950 text-xs">
                      <td class="py-2.5 px-2.5 font-sans uppercase">SOMA TOTAL (ml):</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.neocate}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.neocateConc}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.leiteDesnatado}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.monogen}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.pregomin130}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.pregomin125}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.pregomin120}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.leiteSL}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.nanSL}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.nanEspessar}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.peptamenJr}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.fortini}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.infatrini}</td>
                      <td class="py-2.5 px-1.5 text-center">${calculo.totalVolumeNAut.modulen1}</td>
                      <td class="py-2.5 px-2.5 text-right font-black text-purple-950 text-sm">${calculo.totalVolumeNAut.totalVol} ml</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- 4. TABELA DE ABREVIAÇÃO DE JEJUM (ABREVIAÇÃO JE) -->
          ${(SpdmModule.secaoAtiva === 'todas' || SpdmModule.secaoAtiva === 'jejum') ? `
            <div class="bg-white border border-purple-200/80 rounded-xl overflow-hidden shadow-2xs" style="border-top: 4px solid #a21caf;">
              <div class="bg-purple-50/70 px-4 py-2.5 border-b border-purple-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-base">💧</span>
                  <h3 class="text-xs sm:text-sm font-bold text-purple-950 uppercase tracking-wider">
                    4. Abreviação de Jejum - Chá sem Açúcar + 25g Maltodextrina
                  </h3>
                </div>
                <span class="text-xs font-bold text-fuchsia-900 bg-fuchsia-100/70 px-2.5 py-0.5 rounded border border-fuchsia-300 font-mono">Total: ${calculo.jejum.length} pacientes</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="sticky top-0 z-20 bg-purple-50/95 backdrop-blur-xs shadow-2xs">
                    <tr class="bg-purple-50/80 text-purple-950 font-bold border-b border-purple-200 text-xs uppercase">
                      <th class="py-2.5 px-3">Leito</th>
                      <th class="py-2.5 px-2 text-center">RH</th>
                      <th class="py-2.5 px-3">Paciente</th>
                      <th class="py-2.5 px-3">Enfermaria</th>
                      <th class="py-2.5 px-2 text-center">Volume</th>
                      <th class="py-2.5 px-3 text-center">Horário</th>
                      <th class="py-2.5 px-3">Composição</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-purple-100 font-mono text-slate-700 bg-white">
                    ${calculo.jejum.length > 0 ? calculo.jejum.map(j => `
                      <tr class="hover:bg-purple-50/40 transition-colors">
                        <td class="py-2 px-3 font-sans font-bold text-purple-950">${escapeHtml(j.leito)}</td>
                        <td class="py-2 px-2 text-center font-bold text-slate-800">${escapeHtml(j.rh)}</td>
                        <td class="py-2 px-3 font-sans font-bold text-slate-900">${escapeHtml(j.nome)}</td>
                        <td class="py-2 px-3 font-sans text-slate-700">${escapeHtml(j.enfermaria)}</td>
                        <td class="py-2 px-2 text-center font-bold text-purple-950">${j.volume} ml</td>
                        <td class="py-2 px-3 text-center font-bold text-purple-900">${j.horario}</td>
                        <td class="py-2 px-3 font-sans text-xs text-purple-950 font-medium">${escapeHtml(j.composicao)}</td>
                      </tr>
                    `).join("") : `
                      <tr>
                        <td colspan="7" class="py-6 text-center text-slate-400 font-sans text-xs">
                          Nenhum paciente em protocolo de Abreviação de Jejum no momento.
                        </td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;
  },

  setSecao(secao) {
    SpdmModule.secaoAtiva = secao;
    const pacs = (typeof CensoModule !== "undefined" && typeof CensoModule.getPacientesAtivos === "function") 
      ? CensoModule.getPacientesAtivos() 
      : [];
    SpdmModule.renderizarAba(pacs);
  },

  setTermoBusca(termo) {
    SpdmModule.termoBusca = termo;
    const pacs = (typeof CensoModule !== "undefined" && typeof CensoModule.getPacientesAtivos === "function") 
      ? CensoModule.getPacientesAtivos() 
      : [];
    SpdmModule.renderizarAba(pacs);
  },

  /**
   * Exporta os dados consolidados em formato CSV para download
   */
  exportarCSV() {
    const pacs = (typeof CensoModule !== "undefined" && typeof CensoModule.getPacientesAtivos === "function") 
      ? CensoModule.getPacientesAtivos() 
      : [];
    const calculo = SpdmModule.calcularCensoSPDM(pacs);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "=== RELAÇÃO DE DISPOSITIVOS - HOSPITAL SÃO PAULO / SPDM ===\n";
    csvContent += "Enfermaria,Agua,Mamadeira,Frasco Enteral,Frasco VO,Chuca,Copo,Seringa,Equipo Roxo,Total\n";

    calculo.dispositivos.forEach(d => {
      csvContent += `"${d.enfermaria}",${d.agua},${d.mamadeira},${d.frascoEnteral},${d.frascoVO},${d.chucaSemBico},${d.copo},${d.seringa},${d.equipoRoxo},${d.totalLinha}\n`;
    });
    csvContent += `TOTAL,${calculo.totalDispositivos.agua},${calculo.totalDispositivos.mamadeira},${calculo.totalDispositivos.frascoEnteral},${calculo.totalDispositivos.frascoVO},${calculo.totalDispositivos.chucaSemBico},${calculo.totalDispositivos.copo},${calculo.totalDispositivos.seringa},${calculo.totalDispositivos.equipoRoxo},${calculo.totalDispositivos.totalGeral}\n\n`;

    csvContent += "=== RELAÇÃO DE VOLUME AUTOCLAVADAS (ML) ===\n";
    csvContent += "Enfermaria,Pre Nan,Pre Nan Conc,Nan 1,Nan 1 Conc,Nan 2,Nan 2 Conc,Aptamil Soja,Ninho,Total\n";
    calculo.volumeAut.forEach(a => {
      csvContent += `"${a.enfermaria}",${a.preNan},${a.preNanConc},${a.nan1},${a.nan1Conc},${a.nan2},${a.nan2Conc},${a.aptamilSoja},${a.ninho},${a.totalLinha}\n`;
    });
    csvContent += `TOTAL,${calculo.totalVolumeAut.preNan},${calculo.totalVolumeAut.preNanConc},${calculo.totalVolumeAut.nan1},${calculo.totalVolumeAut.nan1Conc},${calculo.totalVolumeAut.nan2},${calculo.totalVolumeAut.nan2Conc},${calculo.totalVolumeAut.aptamilSoja},${calculo.totalVolumeAut.ninho},${calculo.totalVolumeAut.totalVol}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relacao_spdm_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Impressão do Relatório SPDM em Folha A4
   */
  imprimirRelatorioSPDM() {
    const pacs = (typeof CensoModule !== "undefined" && typeof CensoModule.getPacientesAtivos === "function") 
      ? CensoModule.getPacientesAtivos() 
      : [];
    const calculo = SpdmModule.calcularCensoSPDM(pacs);
    const agora = new Date();
    const dataHoraStr = agora.toLocaleDateString("pt-BR") + " às " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const container = document.getElementById("print-area-bancada");
    if (!container) return;

    const secao = SpdmModule.secaoAtiva || "todas";

    let html = `
      <div style="padding: 6mm; font-family: Arial, sans-serif; color: #000000; background: #ffffff;">
        <div style="border-bottom: 2px solid #000000; padding-bottom: 3mm; margin-bottom: 4mm; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 13pt; font-weight: 900;">HOSPITAL SÃO PAULO - UNIFESP • SPDM</div>
            <div style="font-size: 10pt; font-weight: bold; color: #334155;">CENTRAL DE NUTRIÇÃO E DIETÉTICA • RELATÓRIO CONSOLIDADO SPDM</div>
            <div style="font-size: 11pt; font-weight: 900; color: #0369a1; margin-top: 1mm;">RELAÇÃO DE DISPOSITIVOS E VOLUMES HOSPITALARES</div>
          </div>
          <div style="text-align: right; font-size: 8.5pt;">
            <div><strong>Emissão:</strong> ${dataHoraStr}</div>
            <div><strong>Total Pacientes:</strong> ${calculo.totalPacientesAtivos} leitos ativos</div>
          </div>
        </div>
    `;

    // 1. Tabela Dispositivos
    if (secao === "todas" || secao === "disp") {
      html += `
        <div style="margin-bottom: 5mm; page-break-inside: avoid;">
          <div style="background: #1e293b; color: #ffffff; padding: 1.5mm 3mm; font-size: 9.5pt; font-weight: bold;">
            1. CENSO DE DISPOSITIVOS
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-top: 1mm;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #000000;">
                <th style="padding: 1mm; text-align: left;">Enfermaria</th>
                <th style="padding: 1mm; text-align: center;">Água</th>
                <th style="padding: 1mm; text-align: center;">Mamadeira</th>
                <th style="padding: 1mm; text-align: center;">Frasco Enteral</th>
                <th style="padding: 1mm; text-align: center;">Frasco V.O</th>
                <th style="padding: 1mm; text-align: center;">Chuca</th>
                <th style="padding: 1mm; text-align: center;">Copo</th>
                <th style="padding: 1mm; text-align: center;">Seringa</th>
                <th style="padding: 1mm; text-align: center;">Equipo Roxo</th>
                <th style="padding: 1mm; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${calculo.dispositivos.filter(d => d.totalLinha > 0).map(d => `
                <tr style="border-bottom: 0.5px solid #cbd5e1;">
                  <td style="padding: 1mm;">${escapeHtml(d.enfermaria)}</td>
                  <td style="padding: 1mm; text-align: center;">${d.agua || '-'}</td>
                  <td style="padding: 1mm; text-align: center; font-weight: bold;">${d.mamadeira || '-'}</td>
                  <td style="padding: 1mm; text-align: center; font-weight: bold;">${d.frascoEnteral || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${d.frascoVO || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${d.chucaSemBico || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${d.copo || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${d.seringa || '-'}</td>
                  <td style="padding: 1mm; text-align: center; font-weight: bold;">${d.equipoRoxo || '-'}</td>
                  <td style="padding: 1mm; text-align: right; font-weight: bold;">${d.totalLinha}</td>
                </tr>
              `).join("")}
              <tr style="background: #fef3c7; font-weight: bold; border-top: 1.5px solid #000000;">
                <td style="padding: 1mm;">TOTAL GERAL:</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalDispositivos.agua}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalDispositivos.mamadeira}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalDispositivos.frascoEnteral}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalDispositivos.frascoVO}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalDispositivos.chucaSemBico}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalDispositivos.copo}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalDispositivos.seringa}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalDispositivos.equipoRoxo}</td>
                <td style="padding: 1mm; text-align: right; font-weight: 900;">${calculo.totalDispositivos.totalGeral}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // 2. Tabela Volumes Autoclavadas
    if (secao === "todas" || secao === "aut") {
      html += `
        <div style="margin-bottom: 5mm; page-break-inside: avoid;">
          <div style="background: #0369a1; color: #ffffff; padding: 1.5mm 3mm; font-size: 9.5pt; font-weight: bold;">
            2. CENSO DE VOLUMES AUTOCLAVADAS (ML)
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-top: 1mm;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #000000;">
                <th style="padding: 1mm; text-align: left;">Enfermaria</th>
                <th style="padding: 1mm; text-align: center;">Pré Nan</th>
                <th style="padding: 1mm; text-align: center;">Pré Nan Conc</th>
                <th style="padding: 1mm; text-align: center;">Nan 1</th>
                <th style="padding: 1mm; text-align: center;">Nan 1 Conc</th>
                <th style="padding: 1mm; text-align: center;">Nan 2</th>
                <th style="padding: 1mm; text-align: center;">Nan 2 Conc</th>
                <th style="padding: 1mm; text-align: center;">Aptamil Soja</th>
                <th style="padding: 1mm; text-align: center;">Ninho</th>
                <th style="padding: 1mm; text-align: right;">Total (ml)</th>
              </tr>
            </thead>
            <tbody>
              ${calculo.volumeAut.filter(a => a.totalLinha > 0).map(a => `
                <tr style="border-bottom: 0.5px solid #cbd5e1;">
                  <td style="padding: 1mm;">${escapeHtml(a.enfermaria)}</td>
                  <td style="padding: 1mm; text-align: center;">${a.preNan || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.preNanConc || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.nan1 || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.nan1Conc || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.nan2 || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.nan2Conc || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.aptamilSoja || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.ninho || '-'}</td>
                  <td style="padding: 1mm; text-align: right; font-weight: bold;">${a.totalLinha} ml</td>
                </tr>
              `).join("")}
              <tr style="background: #dcfce7; font-weight: bold; border-top: 1.5px solid #000000;">
                <td style="padding: 1mm;">TOTAL GERAL:</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeAut.preNan}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeAut.preNanConc}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeAut.nan1}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeAut.nan1Conc}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeAut.nan2}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeAut.nan2Conc}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeAut.aptamilSoja}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeAut.ninho}</td>
                <td style="padding: 1mm; text-align: right; font-weight: 900;">${calculo.totalVolumeAut.totalVol} ml</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // 3. Tabela Volumes Não Autoclavadas
    if (secao === "todas" || secao === "naut") {
      html += `
        <div style="margin-bottom: 5mm; page-break-inside: avoid;">
          <div style="background: #6b21a8; color: #ffffff; padding: 1.5mm 3mm; font-size: 9.5pt; font-weight: bold;">
            3. CENSO DE VOLUMES NÃO AUTOCLAVADAS / BANCADA ESTÉRIL (ML)
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; margin-top: 1mm;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #000000;">
                <th style="padding: 1mm; text-align: left;">Enfermaria</th>
                <th style="padding: 1mm; text-align: center;">Neocate</th>
                <th style="padding: 1mm; text-align: center;">Neocate Conc</th>
                <th style="padding: 1mm; text-align: center;">Leite Desn</th>
                <th style="padding: 1mm; text-align: center;">Monogen</th>
                <th style="padding: 1mm; text-align: center;">Pregomin 1:30</th>
                <th style="padding: 1mm; text-align: center;">Pregomin 1:25</th>
                <th style="padding: 1mm; text-align: center;">Pregomin 1:20</th>
                <th style="padding: 1mm; text-align: center;">Leite SL</th>
                <th style="padding: 1mm; text-align: center;">Nan SL</th>
                <th style="padding: 1mm; text-align: center;">Nan Espessar</th>
                <th style="padding: 1mm; text-align: center;">Peptamen Jr</th>
                <th style="padding: 1mm; text-align: center;">Fortini</th>
                <th style="padding: 1mm; text-align: center;">Infatrini</th>
                <th style="padding: 1mm; text-align: center;">Modulen</th>
                <th style="padding: 1mm; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${calculo.volumeNAut.filter(a => a.totalLinha > 0).map(a => `
                <tr style="border-bottom: 0.5px solid #cbd5e1;">
                  <td style="padding: 1mm;">${escapeHtml(a.enfermaria)}</td>
                  <td style="padding: 1mm; text-align: center;">${a.neocate || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.neocateConc || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.leiteDesnatado || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.monogen || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.pregomin130 || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.pregomin125 || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.pregomin120 || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.leiteSL || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.nanSL || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.nanEspessar || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.peptamenJr || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.fortini || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.infatrini || '-'}</td>
                  <td style="padding: 1mm; text-align: center;">${a.modulen1 || '-'}</td>
                  <td style="padding: 1mm; text-align: right; font-weight: bold;">${a.totalLinha} ml</td>
                </tr>
              `).join("")}
              <tr style="background: #f3e8ff; font-weight: bold; border-top: 1.5px solid #000000;">
                <td style="padding: 1mm;">TOTAL GERAL:</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.neocate}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.neocateConc}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.leiteDesnatado}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.monogen}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.pregomin130}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.pregomin125}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.pregomin120}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.leiteSL}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.nanSL}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.nanEspessar}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.peptamenJr}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.fortini}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.infatrini}</td>
                <td style="padding: 1mm; text-align: center;">${calculo.totalVolumeNAut.modulen1}</td>
                <td style="padding: 1mm; text-align: right; font-weight: 900;">${calculo.totalVolumeNAut.totalVol} ml</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // 4. Tabela Abreviação de Jejum
    if (secao === "todas" || secao === "jejum") {
      html += `
        <div style="margin-bottom: 5mm; page-break-inside: avoid;">
          <div style="background: #0e7490; color: #ffffff; padding: 1.5mm 3mm; font-size: 9.5pt; font-weight: bold;">
            4. ABREVIAÇÃO DE JEJUM (CHÁ SEM AÇÚCAR + 25G MALTODEXTRINA)
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-top: 1mm;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #000000;">
                <th style="padding: 1mm; text-align: left; width: 12%;">Data</th>
                <th style="padding: 1mm; text-align: center; width: 12%;">Leito</th>
                <th style="padding: 1mm; text-align: left; width: 28%;">Paciente</th>
                <th style="padding: 1mm; text-align: left; width: 20%;">Dieta</th>
                <th style="padding: 1mm; text-align: center; width: 10%;">Volume</th>
                <th style="padding: 1mm; text-align: center; width: 8%;">Vezes</th>
                <th style="padding: 1mm; text-align: left; width: 10%;">Horários</th>
              </tr>
            </thead>
            <tbody>
              ${calculo.jejum.length > 0 ? calculo.jejum.map(j => `
                <tr style="border-bottom: 0.5px solid #cbd5e1;">
                  <td style="padding: 1mm;">${j.data}</td>
                  <td style="padding: 1mm; text-align: center; font-weight: bold;">${escapeHtml(j.leito)}</td>
                  <td style="padding: 1mm; font-weight: bold;">${escapeHtml(j.nome)}</td>
                  <td style="padding: 1mm;">${j.dieta}</td>
                  <td style="padding: 1mm; text-align: center; font-weight: bold;">${j.volume} ml</td>
                  <td style="padding: 1mm; text-align: center;">${j.vezes}x</td>
                  <td style="padding: 1mm;">${escapeHtml(j.horarios)}</td>
                </tr>
              `).join("") : `
                <tr>
                  <td colspan="7" style="padding: 3mm; text-align: center; color: #64748b;">
                    Nenhum paciente prescrito em Abreviação de Jejum.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      `;
    }

    html += `
        <div style="margin-top: 6mm; padding-top: 3mm; border-top: 1px solid #000000; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8pt;">
          <div>
            ${(() => {
              const nutri = (typeof App !== "undefined" && typeof App.obterDadosNutricionista === "function") ? App.obterDadosNutricionista() : {};
              return nutri.nome 
                ? `<strong>Nutricionista Responsável:</strong> ${escapeHtml(nutri.nome)} • <strong>CRN:</strong> ${escapeHtml(nutri.crn || 'Não informado')}${nutri.setor ? ` (${escapeHtml(nutri.setor)})` : ''}`
                : `<strong>Nutricionista Responsável:</strong> ___________________________ • <strong>CRN:</strong> _________`;
            })()}
          </div>
          <div style="text-align: right;">
            <div>Assinatura: ___________________________</div>
            <div style="font-size: 7.5pt; color: #475569; margin-top: 1mm;">Lactário Digital • Hospital São Paulo - UNIFESP • Emissão: ${dataHoraStr}</div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    document.body.classList.remove("print-zebra-active");
    document.body.classList.add("print-bancada-active");

    const limparImpressao = () => {
      document.body.classList.remove("print-bancada-active");
      document.body.classList.remove("print-zebra-active");
    };

    window.addEventListener("afterprint", limparImpressao, { once: true });
    window.print();
  }
};

if (typeof window !== "undefined") {
  window.SpdmModule = SpdmModule;
}
