/**
 * Módulo de Cálculos de Bancada de Produção e Planilhas de Soma
 * Lactário - Hospital São Paulo (UNIFESP-EPM) / SPDM
 * 
 * Contém e renderiza com fidelidade ao Excel:
 * 1. Mapa Geral de Bancada de Preparo
 * 2. Planilha SOMA AUTOCLAVADA (Volume Autoclavada)
 * 3. Planilha SOMA NÃO AUTOCLAVADA (Volume Não Autoclavada)
 * 4. Planilha SOMA ENTERAL (Volume Enteral)
 * 5. Visualização Consolidada (Todas as Somas)
 * 
 * Regra Oficial de Turnos de Preparo:
 * - PREPARO 1: Refeições das 08:00 às 18:00 (8 <= h <= 18)
 * - PREPARO 2: Refeições das 20:00 às 06:00 (20 <= h <= 24 || h <= 6)
 */

const BancadaModule = {
  visaoAtiva: "bancada", // "bancada" | "soma_autoclavada" | "soma_nao_autoclavada" | "soma_enteral" | "todas_somas"

  // Parâmetros Oficiais de Esterilização e Manipulação do Lactário HSP
  PARAMETROS_INSTITUCIONAIS: {
    AUTOCLAVADA_P1: {
      titulo: "1. Autoclavadas - Preparo 1 (Fornada 1 - Padrão Pediátrico)",
      temperatura: "121°C",
      tempoAutoclave: "15 minutos",
      pressao: "1.1 kgf/cm² (1.1 bar)",
      procedimento: "Dissolução em água morna filtrada (50°C), envase em frascos de vidro borossilicato, fechamento e esterilização terminal em autoclave.",
      corBadge: "badge-autoclavada-p1"
    },
    AUTOCLAVADA_P2: {
      titulo: "2. Autoclavadas - Preparo 2 (Fornada 2 - Nan 2 / Fórmulas de Transição)",
      temperatura: "121°C",
      tempoAutoclave: "15 minutos",
      pressao: "1.1 kgf/cm² (1.1 bar)",
      procedimento: "Preparo em batelada separada para transição do 2º semestre. Esterilização terminal em autoclave.",
      corBadge: "badge-autoclavada-p2"
    },
    NAO_AUTOCLAVADA: {
      titulo: "3. Não Autoclavadas (Manipulação Asséptica em Bancada Estéril)",
      temperatura: "Água estéril a 70°C",
      tempoAutoclave: "NÃO AUTOCLAVAR (Fórmulas com probióticos / hidrolisados termossensíveis)",
      pressao: "Ambiente asséptico sob capela de fluxo laminar",
      procedimento: "Reconstituição estéril com água fervida resfriada a 70°C. Envase em mamadeiras e frascos previamente autoclavados vazios.",
      corBadge: "badge-nao-autoclavada"
    },
    ESPECIAIS: {
      titulo: "4. Dietas Especiais / Módulos Nutricionais",
      temperatura: "Bancada estéril",
      tempoAutoclave: "Manipulação asséptica individualizada",
      pressao: "Fracionamento de precisão",
      procedimento: "Pesagem em balança analítica calibrada e homogeneização imediata.",
      corBadge: "badge-especial"
    },
    JEJUM: {
      titulo: "5. Abreviação de Jejum (Chá + Maltodextrina)",
      temperatura: "Temperatura ambiente",
      tempoAutoclave: "Solução aquosa estéril clara",
      pressao: "Envase asséptico",
      procedimento: "Dissolução de carboidrato em infusão estéril para pré-operatório pediátrico imediato.",
      corBadge: "badge-jejum"
    }
  },

  // Definições Oficiais das 3 Planilhas de Soma do Lactário
  CONFIG_SOMAS: {
    AUTOCLAVADA: {
      id: "soma_autoclavada",
      titulo: "VOLUME AUTOCLAVADA",
      subtitulo: "Central de Nutrição e Dietética • Relatório Oficial de Soma Autoclavada",
      corHeader: "#1e40af", // Azul
      corBadge: "bg-blue-100 text-blue-900 border-blue-300",
      dietas: [
        { id: "nan_1", nomeOficial: "DIETA: FORMULA INFANTIL - NAN 1 COMFOR (1:30) - 13,5%" },
        { id: "nan_1_conc", nomeOficial: "DIETA: FORMULA INFANTIL CONCENTRADA - NAN 1 COMFOR CONCENTRADO (1:25) - 16,2%" },
        { id: "nan_2", nomeOficial: "DIETA: FORMULA SEQUENCIA - NAN 2 COMFOR (1:30) - 14,2%" },
        { id: "nan_2_conc", nomeOficial: "DIETA: FORMULA SEQUENCIA CONCENTRADA - NAN 2 COMFOR CONCENTRADO (1:25) - 17,0%" },
        { id: "aptamil_soja", nomeOficial: "DIETA: FORMULA DE SOJA - APTAMIL SOJA (1:30) - 13,8%" },
        { id: "ld_sem_acucar", nomeOficial: "DIETA: LD SEM AÇUCAR - 12,5%" },
        { id: "ld_com_acucar", nomeOficial: "DIETA: LD COM AÇUCAR" },
        { id: "ld_achocolatado", nomeOficial: "DIETA: LD COM ACHOCOLATADO" }
      ]
    },
    NAO_AUTOCLAVADA: {
      id: "soma_nao_autoclavada",
      titulo: "VOLUME NÃO AUTOCLAVADA",
      subtitulo: "Central de Nutrição e Dietética • Relatório Oficial de Soma Não Autoclavada (Bancada Estéril)",
      corHeader: "#7e22ce", // Roxo
      corBadge: "bg-purple-100 text-purple-900 border-purple-300",
      dietas: [
        { id: "pre_nan", nomeOficial: "DIETA: FORMULA PREMATURO - PRE NAN (1:30) - 16,3%" },
        { id: "pre_nan_conc", nomeOficial: "DIETA: FORMULA PREMATURO CONCENTRADO - PRENAN CONCENTRADO (1:25) - 19,6%" },
        { id: "neocate_lcp", idsAlternativos: ["neocate_lcp", "alfamino"], nomeOficial: "DIETA: FÓRMULA ELEMENTAR - NEOCATE (1:30) - 13,8%" },
        { id: "neocate_conc", idsAlternativos: ["neocate_conc", "alfamino_conc"], nomeOficial: "DIETA: FÓRMULA ELEMENTAR CONCENTRADA - NEOCATE CONCENTRADO (1:25) - 16,6%" },
        { id: "leite_desnatado", nomeOficial: "DIETA: LEITE DESNATADO - 10,0%" },
        { id: "monogen", nomeOficial: "DIETA: MONOGEN (1:30) - 16,8%" },
        { id: "pregomin_1_30", nomeOficial: "DIETA: FÓRMULA HIDROLISADA 1:30 - PREGOMIN 1:30 - 12,9%" },
        { id: "pregomin_1_25", nomeOficial: "DIETA: FÓRMULA HIDROLISADA CONCENTRADA 1:25 - PREGOMIN CONCENTRADO 1:25 - 15,5%" },
        { id: "pregomin_1_20", nomeOficial: "DIETA: FÓRMULA HIDROLISADA CONCENTRADA 1:20 - PREGOMIN CONCENTRADO 1:20 - 19,35%" },
        { id: "leite_sl_uht", nomeOficial: "DIETA: LEITE SEM LACTOSE" },
        { id: "nan_sl", nomeOficial: "DIETA: FORMULA SEM LACTOSE - NAN SEM LACTOSE (1:30) - 13,2%" },
        { id: "nan_sl_conc", nomeOficial: "DIETA: FORMULA SEM LACTOSE CONCENTRADA - NAN SEM LACTOSE CONCENTRADO (1:25) - 15,8%" },
        { id: "nan_espessar", nomeOficial: "DIETA: FORMULA ANTI REGURGITAMENTO - NAN ESPESSAR (1:30) - 13,3%" },
        { id: "nan_espessar_conc", nomeOficial: "DIETA: FORMULA ANTI REGURGITAMENTO - NAN ESPESSAR CONCENTRADO (1:25) - 16,0%" }
      ]
    },
    ENTERAL: {
      id: "soma_enteral",
      titulo: "VOLUME ENTERAL",
      subtitulo: "Central de Nutrição e Dietética • Relatório Oficial de Soma Enteral",
      corHeader: "#047857", // Verde
      corBadge: "bg-emerald-100 text-emerald-900 border-emerald-300",
      dietas: [
        { id: "peptamen_jr", nomeOficial: "DIETA: PEPTAMEN JR" },
        { id: "fortini_10", nomeOficial: "DIETA: FORTINI (1,0 kcal/ml)" },
        { id: "fortini_15", nomeOficial: "DIETA: FORTINI CONCENTRADO (1,5 kcal/ml)" },
        { id: "infatrini", nomeOficial: "DIETA: INFATRINI - 20,4%" },
        { id: "modulen_10", nomeOficial: "DIETA: MODULEN 1 (1,0 kcal/ml)" },
        { id: "modulen_15", nomeOficial: "DIETA: MODULEN 2 (1,5 kcal/ml)" }
      ]
    }
  },

  /**
   * Classifica um horário de refeição em Turno Preparo 1 ou Preparo 2
   * PREPARO 1: 08:00 às 18:00 (8 <= h <= 18)
   * PREPARO 2: 20:00 às 06:00 (20 <= h <= 24 || h <= 6)
   */
  classificarTurnoHorario(horarioStr) {
    if (!horarioStr) return null;
    const match = String(horarioStr).trim().match(/^(\d{1,2})/);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    if (h === 24) h = 0;
    if (h >= 8 && h <= 18) {
      return 1; // Preparo 1
    } else {
      return 2; // Preparo 2
    }
  },

  /**
   * Alterna a visualização da aba produção
   */
  setVisao(visao) {
    BancadaModule.visaoAtiva = visao;
    if (typeof App !== "undefined") {
      App.renderizarBancada();
    }
  },

  /**
   * Calcula a distribuição de volumes de cada planilha de soma (Autoclavada, Não Autoclavada e Enteral)
   */
  calcularSomas(pacientesAtivos, dietasCatalogo) {
    const mapaDietas = new Map();
    if (Array.isArray(dietasCatalogo)) {
      dietasCatalogo.forEach(d => mapaDietas.set(d.id, d));
    }

    const processarPlanilhaSoma = (config) => {
      let totalP1Vol = 0;
      let totalP2Vol = 0;
      let totalGeralVol = 0;
      let totalPoG = 0;
      let totalAguaMl = 0;
      let totalFrascos = 0;

      const blocos = config.dietas.map(itemConfig => {
        const ids = itemConfig.idsAlternativos || [itemConfig.id];
        const pacs = pacientesAtivos.filter(p => !p.suspenso && !p.alta && ids.includes(p.dietaId));
        
        let p1Vezes = 0;
        let p2Vezes = 0;
        let p1Vol = 0;
        let p2Vol = 0;
        let volTotal = 0;
        const leitosP1 = [];
        const leitosP2 = [];
        const todosLeitos = [];

        pacs.forEach(p => {
          const volUnit = Number(p.volumeMl) || 0;
          const vezesTot = Number(p.vezesDia) || 0;
          let p1P = 0;
          let p2P = 0;

          const gradeHorarios = (Array.isArray(p.horarios) && p.horarios.length > 0)
            ? p.horarios
            : ((typeof CensoModule !== "undefined" && typeof CensoModule.calcularGradeHorarios === "function")
                ? CensoModule.calcularGradeHorarios(p.horarioInicio || "06:00", vezesTot)
                : []);

          if (gradeHorarios.length > 0) {
            gradeHorarios.forEach(h => {
              const t = BancadaModule.classificarTurnoHorario(h);
              if (t === 1) p1P++;
              else if (t === 2) p2P++;
            });
          } else {
            p1P = Math.ceil(vezesTot / 2);
            p2P = vezesTot - p1P;
          }

          p1Vezes += p1P;
          p2Vezes += p2P;
          p1Vol += p1P * volUnit;
          p2Vol += p2P * volUnit;
          volTotal += vezesTot * volUnit;

          if (p1P > 0) leitosP1.push(p.leito);
          if (p2P > 0) leitosP2.push(p.leito);
          todosLeitos.push(p.leito);
        });

        const dietaObj = mapaDietas.get(itemConfig.id) || { g_po_100ml: 14.0, ml_agua_100ml: 90.0 };
        const poG = volTotal * ((Number(dietaObj.g_po_100ml) || 14.0) / 100.0);
        const aguaMl = volTotal * ((Number(dietaObj.ml_agua_100ml) || 90.0) / 100.0);

        totalP1Vol += p1Vol;
        totalP2Vol += p2Vol;
        totalGeralVol += volTotal;
        totalPoG += poG;
        totalAguaMl += aguaMl;
        totalFrascos += (p1Vezes + p2Vezes);

        return {
          id: itemConfig.id,
          nomeOficial: itemConfig.nomeOficial,
          dieta: dietaObj,
          pacientes: pacs,
          leitosP1,
          leitosP2,
          todosLeitos,
          p1Vezes,
          p2Vezes,
          p1Vol,
          p2Vol,
          volTotal,
          poG,
          aguaMl
        };
      });

      return {
        config,
        blocos,
        totais: {
          totalP1Vol,
          totalP2Vol,
          totalGeralVol,
          totalPoG,
          totalAguaMl,
          totalFrascos,
          totalPacientes: pacientesAtivos.filter(p => !p.suspenso && !p.alta && config.dietas.some(d => (d.idsAlternativos || [d.id]).includes(p.dietaId))).length
        }
      };
    };

    return {
      autoclavada: processarPlanilhaSoma(BancadaModule.CONFIG_SOMAS.AUTOCLAVADA),
      naoAutoclavada: processarPlanilhaSoma(BancadaModule.CONFIG_SOMAS.NAO_AUTOCLAVADA),
      enteral: processarPlanilhaSoma(BancadaModule.CONFIG_SOMAS.ENTERAL)
    };
  },

  /**
   * Calcula volumes por turno, consumo de pós, água e dispositivos para todos os pacientes ativos
   */
  calcularProducao(pacientesAtivos, dietasCatalogo) {
    const mapaDietas = new Map();
    if (Array.isArray(dietasCatalogo)) {
      dietasCatalogo.forEach(d => mapaDietas.set(d.id, d));
    }

    const agrupado = {};

    let volumeTotalGeralMl = 0;
    let volumePrep1GeralMl = 0;
    let volumePrep2GeralMl = 0;
    let poTotalGeralG = 0;
    let aguaTotalGeralMl = 0;
    let totalFrascosDia = 0;
    let totalMamadeiras = 0;
    let totalEnterais = 0;
    let totalSeringasCopos = 0;

    pacientesAtivos.forEach(paciente => {
      if (paciente.suspenso || paciente.alta) return;

      const dietaId = paciente.dietaId;
      const dietaObj = mapaDietas.get(dietaId) || {
        id: dietaId,
        nome: paciente.dietaNome || "Fórmula Padrão",
        categoria: "AUTOCLAVADA_P1",
        categoriaNome: "Autoclavada P1",
        g_po_100ml: 14.0,
        ml_agua_100ml: 90.0,
        peso_lata_g: 400,
        kcal_100ml: 67
      };

      if (!agrupado[dietaId]) {
        agrupado[dietaId] = {
          dieta: dietaObj,
          pacientes: [],
          volumeTotalMl: 0,
          volumePrep1Ml: 0,
          volumePrep2Ml: 0,
          vezesPrep1: 0,
          vezesPrep2: 0,
          totalFrascos: 0,
          mamadeiras: 0,
          frascosEnterais: 0,
          seringasCopos: 0,
          poTotalG: 0,
          aguaTotalMl: 0
        };
      }

      const volUnit = Number(paciente.volumeMl) || 0;
      const vezesTotal = Number(paciente.vezesDia) || 0;
      const volDiarioPaciente = volUnit * vezesTotal;

      let prep1Vezes = 0;
      let prep2Vezes = 0;

      if (Array.isArray(paciente.horarios) && paciente.horarios.length > 0) {
        paciente.horarios.forEach(h => {
          const t = BancadaModule.classificarTurnoHorario(h);
          if (t === 1) prep1Vezes++;
          else if (t === 2) prep2Vezes++;
        });
      } else {
        prep1Vezes = Math.ceil(vezesTotal / 2);
        prep2Vezes = vezesTotal - prep1Vezes;
      }

      const volPrep1 = prep1Vezes * volUnit;
      const volPrep2 = prep2Vezes * volUnit;

      agrupado[dietaId].pacientes.push(paciente);
      agrupado[dietaId].volumeTotalMl += volDiarioPaciente;
      agrupado[dietaId].volumePrep1Ml += volPrep1;
      agrupado[dietaId].volumePrep2Ml += volPrep2;
      agrupado[dietaId].vezesPrep1 += prep1Vezes;
      agrupado[dietaId].vezesPrep2 += prep2Vezes;
      agrupado[dietaId].totalFrascos += vezesTotal;

      const disp = String(paciente.dispositivo || "").toLowerCase();
      if (disp.includes("mamadeira") || disp.includes("chuca")) {
        agrupado[dietaId].mamadeiras += vezesTotal;
        totalMamadeiras += vezesTotal;
      } else if (disp.includes("enteral") || disp.includes("frasco")) {
        agrupado[dietaId].frascosEnterais += vezesTotal;
        totalEnterais += vezesTotal;
      } else {
        agrupado[dietaId].seringasCopos += vezesTotal;
        totalSeringasCopos += vezesTotal;
      }
    });

    const resultados = Object.values(agrupado).map(item => {
      const gPorMl = (Number(item.dieta.g_po_100ml) || 14.0) / 100.0;
      const mlAguaPorMl = (Number(item.dieta.ml_agua_100ml) || 90.0) / 100.0;

      item.poTotalG = item.volumeTotalMl * gPorMl;
      item.aguaTotalMl = item.volumeTotalMl * mlAguaPorMl;

      volumeTotalGeralMl += item.volumeTotalMl;
      volumePrep1GeralMl += item.volumePrep1Ml;
      volumePrep2GeralMl += item.volumePrep2Ml;
      poTotalGeralG += item.poTotalG;
      aguaTotalGeralMl += item.aguaTotalMl;
      totalFrascosDia += item.totalFrascos;

      return item;
    });

    return {
      resultados,
      somas: BancadaModule.calcularSomas(pacientesAtivos, dietasCatalogo),
      totais: {
        volumeTotalGeralMl,
        volumePrep1GeralMl,
        volumePrep2GeralMl,
        poTotalGeralG,
        aguaTotalGeralMl,
        totalFrascosDia,
        totalMamadeiras,
        totalEnterais,
        totalSeringasCopos,
        totalPacientes: pacientesAtivos.filter(p => !p.suspenso && !p.alta).length
      }
    };
  },

  /**
   * Renderiza HTML de uma tabela de Soma individual (Autoclavada, Não Autoclavada ou Enteral)
   */
  gerarHtmlPlanilhaSoma(dadosSoma) {
    const { config, blocos, totais } = dadosSoma;

    return `
      <div class="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden mb-4 w-full">
        <!-- Banner Institucional da Planilha de Soma -->
        <div class="p-3.5 border-b border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2" style="background: ${config.corHeader}; color: #ffffff;">
          <div>
            <div class="text-[10px] uppercase font-black tracking-wider text-slate-200">HOSPITAL SÃO PAULO • CENTRAL DE NUTRIÇÃO E DIETÉTICA</div>
            <h3 class="text-sm sm:text-base font-black tracking-wide">${config.titulo}</h3>
            <div class="text-[11px] text-slate-200 mt-0.5">${config.subtitulo}</div>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span class="bg-white/20 text-white px-2.5 py-1 rounded border border-white/30 font-mono">P1 (08h-18h): ${(totais.totalP1Vol / 1000).toFixed(2)} L</span>
            <span class="bg-white/20 text-white px-2.5 py-1 rounded border border-white/30 font-mono">P2 (20h-06h): ${(totais.totalP2Vol / 1000).toFixed(2)} L</span>
            <span class="bg-white text-slate-950 px-2.5 py-1 rounded font-black font-mono">TOTAL: ${(totais.totalGeralVol / 1000).toFixed(2)} L</span>
          </div>
        </div>

        <!-- Grade de Blocos de Fórmulas -->
        <div class="divide-y divide-slate-200">
          ${blocos.map(b => `
            <div class="p-3 sm:p-4 hover:bg-slate-50 transition-colors ${b.volTotal > 0 ? 'bg-white' : 'bg-slate-50/60 opacity-75'}">
              <!-- Cabeçalho da Dieta -->
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 pb-2 border-b border-slate-200/80">
                <div class="font-black text-slate-950 text-xs sm:text-sm flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full ${b.volTotal > 0 ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
                  <span>${escapeHtml(b.nomeOficial)}</span>
                </div>
                <div class="text-xs font-bold text-slate-600 font-mono">
                  ${b.volTotal > 0 ? `Vol: ${b.volTotal} ml (${(b.volTotal/1000).toFixed(2)}L) • Pó: ${b.poG.toFixed(1)}g • Água: ${b.aguaMl.toFixed(0)}ml` : 'Sem demanda no plantão'}
                </div>
              </div>

              <!-- Duas Colunas de Preparo (Padrão Excel SOMA) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <!-- Coluna PREPARO 1 (08:00 às 18:00) -->
                <div class="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50 flex flex-col justify-between">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-black text-purple-950 text-xs sm:text-[13px] flex items-center gap-1">
                      <span>☀️</span>
                      <span>PREPARO 1 (08:00 às 18:00)</span>
                    </span>
                    <span class="font-black font-mono text-sm sm:text-base text-purple-950">${b.p1Vol} ml</span>
                  </div>
                  <div class="text-xs text-slate-700 font-medium flex justify-between items-center">
                    <span>Frascos: <strong class="font-bold text-slate-900">${b.p1Vezes} un</strong></span>
                    <span class="text-xs text-slate-600 font-semibold truncate max-w-[200px]" title="${b.leitosP1.join(', ')}">
                      Leitos: ${b.leitosP1.length > 0 ? b.leitosP1.join(', ') : '-'}
                    </span>
                  </div>
                </div>

                <!-- Coluna PREPARO 2 (20:00 às 06:00) -->
                <div class="p-2.5 rounded-lg border border-pink-200 bg-pink-50/50 flex flex-col justify-between">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-black text-pink-950 text-xs sm:text-[13px] flex items-center gap-1">
                      <span>🌙</span>
                      <span>PREPARO 2 (20:00 às 06:00)</span>
                    </span>
                    <span class="font-black font-mono text-sm sm:text-base text-pink-950">${b.p2Vol} ml</span>
                  </div>
                  <div class="text-xs text-slate-700 font-medium flex justify-between items-center">
                    <span>Frascos: <strong class="font-bold text-slate-900">${b.p2Vezes} un</strong></span>
                    <span class="text-xs text-slate-600 font-semibold truncate max-w-[200px]" title="${b.leitosP2.join(', ')}">
                      Leitos: ${b.leitosP2.length > 0 ? b.leitosP2.join(', ') : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Rodapé de Totais da Planilha de Soma -->
        <div class="p-3 bg-slate-100 border-t-2 border-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-black">
          <div class="text-slate-800 uppercase tracking-wide">
            TOTAL CONSOLIDADO • ${config.titulo}:
          </div>
          <div class="flex flex-wrap items-center gap-3 font-mono text-xs sm:text-sm">
            <span class="text-purple-900">P1: ${(totais.totalP1Vol / 1000).toFixed(2)} L</span>
            <span>•</span>
            <span class="text-pink-900">P2: ${(totais.totalP2Vol / 1000).toFixed(2)} L</span>
            <span>•</span>
            <span class="text-slate-950 text-sm sm:text-base font-black bg-white px-2.5 py-0.5 rounded border border-slate-300">
              TOTAL: ${(totais.totalGeralVol / 1000).toFixed(2)} L
            </span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Impressão de Folha de Soma Oficial em A4
   */
  imprimirFolhaSoma(tipo = "todas") {
    const container = document.getElementById("print-area-bancada");
    if (!container) return;

    const pacsAtivos = (typeof CensoModule !== "undefined") ? CensoModule.getPacientesAtivos() : [];
    const dietas = (typeof App !== "undefined") ? App.dietasCatalogo : [];
    const somas = BancadaModule.calcularSomas(pacsAtivos, dietas);

    const agora = new Date();
    const dataHoraStr = agora.toLocaleDateString("pt-BR") + " às " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    let planilhasParaImprimir = [];
    if (tipo === "soma_autoclavada" || tipo === "todas") planilhasParaImprimir.push(somas.autoclavada);
    if (tipo === "soma_nao_autoclavada" || tipo === "todas") planilhasParaImprimir.push(somas.naoAutoclavada);
    if (tipo === "soma_enteral" || tipo === "todas") planilhasParaImprimir.push(somas.enteral);

    container.innerHTML = `
      <div style="padding: 6mm; font-family: Arial, sans-serif; color: #000000; background: #ffffff;">
        <div style="border-bottom: 2px solid #000000; padding-bottom: 2mm; margin-bottom: 4mm; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 13pt; font-weight: 900;">HOSPITAL SÃO PAULO - UNIFESP/EPM</div>
            <div style="font-size: 10pt; font-weight: bold; color: #334155;">CENTRAL DE NUTRIÇÃO E DIETÉTICA • LACTÁRIO</div>
            <div style="font-size: 11pt; font-weight: 900; color: #0369a1; margin-top: 1mm;">RELATÓRIO CONSOLIDADO DE SOMA DE DIETAS</div>
          </div>
          <div style="text-align: right; font-size: 8.5pt;">
            <div><strong>Emissão:</strong> ${dataHoraStr}</div>
            <div><strong>Plantão:</strong> 24 Horas</div>
          </div>
        </div>

        ${planilhasParaImprimir.map(s => `
          <div style="margin-bottom: 6mm; page-break-inside: avoid;">
            <div style="background: #1e293b; color: #ffffff; padding: 2mm 3mm; font-size: 10pt; font-weight: bold; display: flex; justify-content: space-between;">
              <span>${s.config.titulo}</span>
              <span>P1: ${(s.totais.totalP1Vol/1000).toFixed(2)}L | P2: ${(s.totais.totalP2Vol/1000).toFixed(2)}L | Total: ${(s.totais.totalGeralVol/1000).toFixed(2)}L</span>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-top: 1mm;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 1.5px solid #000000;">
                  <th style="padding: 1.5mm; text-align: left; width: 40%;">Dieta / Fórmula</th>
                  <th style="padding: 1.5mm; text-align: center; width: 18%;">Preparo 1 (08h-18h)</th>
                  <th style="padding: 1.5mm; text-align: center; width: 18%;">Preparo 2 (20h-06h)</th>
                  <th style="padding: 1.5mm; text-align: right; width: 24%;">Total da Fórmula</th>
                </tr>
              </thead>
              <tbody>
                ${s.blocos.map(b => `
                  <tr style="border-bottom: 0.5px solid #cbd5e1; ${b.volTotal > 0 ? '' : 'color: #94a3b8;'}">
                    <td style="padding: 1.5mm; font-weight: bold;">${escapeHtml(b.nomeOficial)}</td>
                    <td style="padding: 1.5mm; text-align: center; font-family: monospace;">${b.p1Vol} ml (${b.p1Vezes}x)</td>
                    <td style="padding: 1.5mm; text-align: center; font-family: monospace;">${b.p2Vol} ml (${b.p2Vezes}x)</td>
                    <td style="padding: 1.5mm; text-align: right; font-family: monospace; font-weight: bold;">${b.volTotal} ml</td>
                  </tr>
                `).join("")}
                <tr style="background: #fef3c7; font-weight: bold; border-top: 1.5px solid #000000;">
                  <td style="padding: 1.5mm;">TOTAL ${s.config.titulo}:</td>
                  <td style="padding: 1.5mm; text-align: center; font-family: monospace;">${(s.totais.totalP1Vol/1000).toFixed(2)} L</td>
                  <td style="padding: 1.5mm; text-align: center; font-family: monospace;">${(s.totais.totalP2Vol/1000).toFixed(2)} L</td>
                  <td style="padding: 1.5mm; text-align: right; font-family: monospace; font-weight: 900;">${(s.totais.totalGeralVol/1000).toFixed(2)} L</td>
                </tr>
              </tbody>
            </table>
          </div>
        `).join("")}

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

    document.body.classList.remove("print-zebra-active");
    document.body.classList.add("print-bancada-active");

    const limparImpressao = () => {
      document.body.classList.remove("print-bancada-active");
      document.body.classList.remove("print-zebra-active");
    };

    window.addEventListener("afterprint", limparImpressao, { once: true });
    window.print();
  },

  // Impressão da Folha de Produção / Bancada A4
  imprimirFolhaBancada(calculoProducao) {
    if (!calculoProducao) {
      const pacs = (typeof CensoModule !== "undefined") ? CensoModule.getPacientesAtivos() : [];
      const dietas = (typeof App !== "undefined") ? App.dietasCatalogo : [];
      calculoProducao = BancadaModule.calcularProducao(pacs, dietas);
    }

    const container = document.getElementById("print-area-bancada");
    if (!container) return;

    const agora = new Date();
    const dataHoraStr = agora.toLocaleDateString("pt-BR") + " às " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    let htmlTabelas = "";

    const categorias = [
      { id: "AUTOCLAVADA_P1", nome: "1. AUTOCLAVADAS - PREPARO 1 (FORNADA 1 - PADRÃO PEDIÁTRICO)" },
      { id: "AUTOCLAVADA_P2", nome: "2. AUTOCLAVADAS - PREPARO 2 (FORNADA 2 - NAN 2 / TRANSIÇÃO)" },
      { id: "NAO_AUTOCLAVADA", nome: "3. NÃO AUTOCLAVADAS (MANIPULAÇÃO EM BANCADA ESTÉRIL A 70°C)" },
      { id: "ESPECIAIS", nome: "4. DIETAS ESPECIAIS e MÓDULOS NUTRICIONAIS" },
      { id: "JEJUM", nome: "5. ABREVIAÇÃO DE JEJUM (CHÁ + MALTODEXTRINA)" }
    ];

    categorias.forEach(cat => {
      const itens = calculoProducao.resultados.filter(r => r.dieta.categoria === cat.id);
      if (itens.length === 0) return;

      const volSub = itens.reduce((a, b) => a + b.volumeTotalMl, 0);
      const volP1Sub = itens.reduce((a, b) => a + b.volumePrep1Ml, 0);
      const volP2Sub = itens.reduce((a, b) => a + b.volumePrep2Ml, 0);
      const poSub = itens.reduce((a, b) => a + b.poTotalG, 0);

      htmlTabelas += `
        <div style="margin-bottom: 6mm; page-break-inside: avoid;">
          <div style="background: #1e293b; color: #ffffff; padding: 2mm 3mm; font-size: 10pt; font-weight: bold; display: flex; justify-content: space-between;">
            <span>${cat.nome}</span>
            <span>Prep 1 (08h-18h): ${(volP1Sub/1000).toFixed(2)} L | Prep 2 (20h-06h): ${(volP2Sub/1000).toFixed(2)} L | Total: ${(volSub/1000).toFixed(2)} L</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-top: 1mm;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1.5px solid #000000; text-align: left;">
                <th style="padding: 1.5mm; width: 26%;">Fórmula / Dieta</th>
                <th style="padding: 1.5mm; text-align: center; width: 12%;">Diluição</th>
                <th style="padding: 1.5mm; text-align: center; width: 12%;">Prep 1 (08h-18h)</th>
                <th style="padding: 1.5mm; text-align: center; width: 12%;">Prep 2 (20h-06h)</th>
                <th style="padding: 1.5mm; text-align: center; width: 12%;">Vol Total</th>
                <th style="padding: 1.5mm; text-align: center; width: 12%; font-weight: 900; background: #e2e8f0;">Pó (g)</th>
                <th style="padding: 1.5mm; text-align: center; width: 14%; font-weight: 900; background: #f8fafc;">Água (ml)</th>
              </tr>
            </thead>
            <tbody>
              ${itens.map(item => `
                <tr style="border-bottom: 0.8px solid #cbd5e1;">
                  <td style="padding: 1.5mm; font-weight: bold;">${escapeHtml(item.dieta.nome)}</td>
                  <td style="padding: 1.5mm; text-align: center;">${item.dieta.g_po_100ml}g / ${item.dieta.ml_agua_100ml}ml</td>
                  <td style="padding: 1.5mm; text-align: center; font-family: monospace; color: #1e3a8a;">${item.volumePrep1Ml} ml</td>
                  <td style="padding: 1.5mm; text-align: center; font-family: monospace; color: #831843;">${item.volumePrep2Ml} ml</td>
                  <td style="padding: 1.5mm; text-align: center; font-family: monospace; font-weight: bold;">${item.volumeTotalMl} ml</td>
                  <td style="padding: 1.5mm; text-align: center; font-family: monospace; font-weight: 900; background: #f1f5f9;">${item.poTotalG.toFixed(1)} g</td>
                  <td style="padding: 1.5mm; text-align: center; font-family: monospace; font-weight: bold;">${item.aguaTotalMl.toFixed(0)} ml</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="padding: 6mm; font-family: Arial, sans-serif; color: #000000; background: #ffffff;">
        <div style="border-bottom: 2px solid #000000; padding-bottom: 3mm; margin-bottom: 4mm; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 13pt; font-weight: 900; letter-spacing: 0.5px;">HOSPITAL SÃO PAULO - UNIFESP/EPM</div>
            <div style="font-size: 10pt; font-weight: bold; color: #334155;">SERVIÇO DE NUTRIÇÃO E DIETÉTICA • LACTÁRIO CENTRAL</div>
            <div style="font-size: 11pt; font-weight: 900; color: #0369a1; margin-top: 1mm;">MAPA DIÁRIO DE BANCADA E PRODUÇÃO DE FÓRMULAS INFANTIS</div>
          </div>
          <div style="text-align: right; font-size: 8.5pt;">
            <div><strong>Emissão:</strong> ${dataHoraStr}</div>
            <div><strong>Total em Produção:</strong> ${calculoProducao.totais.totalPacientes} leitos</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 3mm; margin-bottom: 5mm; text-align: center; font-size: 9pt;">
          <div style="border: 1px solid #000000; padding: 2mm; background: #f8fafc;">
            <div style="font-size: 7.5pt; text-transform: uppercase;">Preparo 1 (08h-18h)</div>
            <div style="font-size: 12pt; font-weight: 900; font-family: monospace; color: #1e3a8a;">${(calculoProducao.totais.volumePrep1GeralMl / 1000).toFixed(2)} L</div>
          </div>
          <div style="border: 1px solid #000000; padding: 2mm; background: #f8fafc;">
            <div style="font-size: 7.5pt; text-transform: uppercase;">Preparo 2 (20h-06h)</div>
            <div style="font-size: 12pt; font-weight: 900; font-family: monospace; color: #831843;">${(calculoProducao.totais.volumePrep2GeralMl / 1000).toFixed(2)} L</div>
          </div>
          <div style="border: 1px solid #000000; padding: 2mm; background: #f8fafc;">
            <div style="font-size: 7.5pt; text-transform: uppercase;">Volume Total Diário</div>
            <div style="font-size: 12pt; font-weight: 900; font-family: monospace;">${(calculoProducao.totais.volumeTotalGeralMl / 1000).toFixed(2)} L</div>
          </div>
          <div style="border: 1px solid #000000; padding: 2mm; background: #f8fafc;">
            <div style="font-size: 7.5pt; text-transform: uppercase;">Pó Total a Pesar</div>
            <div style="font-size: 12pt; font-weight: 900; font-family: monospace; color: #065f46;">${(calculoProducao.totais.poTotalGeralG / 1000).toFixed(2)} kg</div>
          </div>
        </div>

        ${htmlTabelas}

        <div style="margin-top: 8mm; padding-top: 4mm; border-top: 1.5px solid #000000; display: flex; justify-content: space-between; font-size: 8.5pt; page-break-inside: avoid;">
          <div style="width: 45%; text-align: center;">
            <div style="border-bottom: 1px solid #000000; margin-bottom: 1.5mm; height: 10mm;"></div>
            <div><strong>Lactarista / Manipulador(a) Responsável</strong></div>
            <div style="font-size: 7.5pt; color: #64748b;">Conferência de pesagem analítica e temperatura</div>
          </div>
          <div style="width: 48%; text-align: center;">
            <div style="border-bottom: 1px solid #000000; margin-bottom: 1.5mm; height: 10mm;"></div>
            <div>
              ${(() => {
                const nutri = (typeof App !== "undefined" && typeof App.obterDadosNutricionista === "function") ? App.obterDadosNutricionista() : {};
                return nutri.nome 
                  ? `<strong>${escapeHtml(nutri.nome)}</strong> • CRN: ${escapeHtml(nutri.crn || 'Não informado')}`
                  : `<strong>Nutricionista Responsável / CRN</strong>`;
              })()}
            </div>
            <div style="font-size: 7.5pt; color: #64748b;">
              ${(() => {
                const nutri = (typeof App !== "undefined" && typeof App.obterDadosNutricionista === "function") ? App.obterDadosNutricionista() : {};
                return nutri.setor ? escapeHtml(nutri.setor) : "Validação do censo e liberação do plantão";
              })()}
            </div>
          </div>
        </div>
      </div>
    `;

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
  window.BancadaModule = BancadaModule;
}
