/**
 * Módulo de Planilhas de Censo Nominal (Autoclavada, Não Autoclavada e Dieta Especial)
 * Hospital São Paulo (UNIFESP-EPM) / SPDM
 * 
 * Design System Padronizado: Clean, Flat, Sem Sombreamento 3D, Fundo Claro,
 * Bordas Finas Cinza Escuro e Cabeçalhos Temáticos (Azul, Roxo, Âmbar).
 */

const PlanilhasCensoModule = {
  visaoAtiva: "autoclavada", // "autoclavada" | "nao_autoclavada" | "dieta_especial" | "todas"

  // Configurações Oficiais das Seções de Dietas Autoclavadas
  SECOES_AUTOCLAVADA: [
    {
      id: "pre_nan",
      tituloOficial: "DIETA: FÓRMULA PREMATURO - PRE NAN (1:30) - 16,3%",
      tag: "PRE NAN",
      g_po_100ml: 16.3,
      ml_agua_100ml: 90.0,
      ids: ["pre_nan", "prenan"]
    },
    {
      id: "pre_nan_conc",
      tituloOficial: "DIETA: FÓRMULA PREMATURO CONCENTRADO - PRENAN CONCENTRADO (1:25) - 19,6%",
      tag: "PRE NAN CONCENTRADO",
      g_po_100ml: 19.6,
      ml_agua_100ml: 90.0,
      ids: ["pre_nan_conc", "prenan_conc"]
    },
    {
      id: "nan_1",
      tituloOficial: "DIETA: FÓRMULA INFANTIL - NAN 1 COMFOR (1:30) - 13,5%",
      tag: "NAN 1",
      g_po_100ml: 13.5,
      ml_agua_100ml: 90.0,
      ids: ["nan_1", "nan1"]
    },
    {
      id: "nan_1_conc",
      tituloOficial: "DIETA: FÓRMULA INFANTIL CONCENTRADA - NAN 1 COMFOR CONCENTRADO (1:25) - 16,2%",
      tag: "NAN 1 CONCENTRADO",
      g_po_100ml: 16.2,
      ml_agua_100ml: 90.0,
      ids: ["nan_1_conc", "nan1_conc"]
    },
    {
      id: "nan_2",
      tituloOficial: "DIETA: FÓRMULA INFANTIL - NAN 2 COMFOR (1:30) - 14,2%",
      tag: "NAN 2",
      g_po_100ml: 14.2,
      ml_agua_100ml: 90.0,
      ids: ["nan_2", "nan2"]
    },
    {
      id: "nan_2_conc",
      tituloOficial: "DIETA: FÓRMULA INFANTIL CONCENTRADA - NAN 2 COMFOR CONCENTRADO (1:25) - 17,0%",
      tag: "NAN 2 CONCENTRADO",
      g_po_100ml: 17.0,
      ml_agua_100ml: 90.0,
      ids: ["nan_2_conc", "nan2_conc"]
    },
    {
      id: "aptamil_soja",
      tituloOficial: "DIETA: FÓRMULA À BASE DE SOJA - APTAMIL SOJA (1:30) - 13,8%",
      tag: "APTAMIL SOJA",
      g_po_100ml: 13.8,
      ml_agua_100ml: 90.0,
      ids: ["aptamil_soja", "soja"]
    },
    {
      id: "ld_sem_acucar",
      tituloOficial: "DIETA: LEITE INTEGRAL (NINHO) - LD SEM AÇÚCAR - 12,5%",
      tag: "LD SEM AÇÚCAR",
      g_po_100ml: 12.5,
      ml_agua_100ml: 90.0,
      ids: ["ld_sem_acucar", "ninho_sem_acucar", "leite_integral"]
    },
    {
      id: "ld_com_acucar",
      tituloOficial: "DIETA: LD COM AÇÚCAR",
      tag: "LD COM AÇÚCAR",
      g_po_100ml: 12.5,
      ml_agua_100ml: 90.0,
      ids: ["ld_com_acucar", "ninho_com_acucar"]
    },
    {
      id: "ld_achocolatado",
      tituloOficial: "DIETA: LD COM ACHOCOLATADO",
      tag: "LD COM ACHOCOLATADO",
      g_po_100ml: 12.5,
      ml_agua_100ml: 90.0,
      ids: ["ld_achocolatado", "ninho_achocolatado"]
    }
  ],

  // Configurações Oficiais das Seções de Dietas Não Autoclavadas (Bancada Estéril e Enteral)
  SECOES_NAO_AUTOCLAVADA: [
    {
      id: "neocate",
      tituloOficial: "DIETA: FÓRMULA ELEMENTAR - NEOCATE (1:30) - 13,8%",
      tag: "NEOCATE",
      g_po_100ml: 13.8,
      ml_agua_100ml: 90.0,
      ids: ["neocate", "alfamino"]
    },
    {
      id: "neocate_conc",
      tituloOficial: "DIETA: FÓRMULA ELEMENTAR CONCENTRADA - NEOCATE CONCENTRADO (1:25) - 16,6%",
      tag: "NEOCATE CONCENTRADO",
      g_po_100ml: 16.6,
      ml_agua_100ml: 90.0,
      ids: ["neocate_conc", "alfamino_conc"]
    },
    {
      id: "leite_desnatado",
      tituloOficial: "DIETA: LEITE DESNATADO - 10,0%",
      tag: "LEITE DESNATADO",
      g_po_100ml: 10.0,
      ml_agua_100ml: 90.0,
      ids: ["leite_desnatado", "molico"]
    },
    {
      id: "monogen",
      tituloOficial: "DIETA: MONOGEN (1:30) - 16,8%",
      tag: "MONOGEN",
      g_po_100ml: 16.8,
      ml_agua_100ml: 90.0,
      ids: ["monogen"]
    },
    {
      id: "pregomin_130",
      tituloOficial: "DIETA: FÓRMULA HIDROLISADA 1:30 - PREGOMIN 1:30 - 12,9%",
      tag: "PREGOMIN 1:30",
      g_po_100ml: 12.9,
      ml_agua_100ml: 90.0,
      ids: ["pregomin_130", "pregomin"]
    },
    {
      id: "pregomin_125",
      tituloOficial: "DIETA: FÓRMULA HIDROLISADA CONCENTRADA - PREGOMIN CONCENTRADO 1:25 - 15,5%",
      tag: "PREGOMIN 1:25",
      g_po_100ml: 15.5,
      ml_agua_100ml: 90.0,
      ids: ["pregomin_125"]
    },
    {
      id: "pregomin_120",
      tituloOficial: "DIETA: FÓRMULA HIDROLISADA CONCENTRADA - PREGOMIN CONCENTRADO 1:20 - 19,35%",
      tag: "PREGOMIN 1:20",
      g_po_100ml: 19.35,
      ml_agua_100ml: 90.0,
      ids: ["pregomin_120"]
    },
    {
      id: "leite_sem_lactose",
      tituloOficial: "DIETA: LEITE SEM LACTOSE",
      tag: "LEITE SL",
      g_po_100ml: 13.0,
      ml_agua_100ml: 90.0,
      ids: ["leite_sem_lactose", "leite_sl"]
    },
    {
      id: "nan_sem_lactose",
      tituloOficial: "DIETA: FÓRMULA SEM LACTOSE - NAN SEM LACTOSE (1:30) - 13,2%",
      tag: "NAN SL",
      g_po_100ml: 13.2,
      ml_agua_100ml: 90.0,
      ids: ["nan_sem_lactose", "nan_sl"]
    },
    {
      id: "nan_sl_conc",
      tituloOficial: "DIETA: FÓRMULA SEM LACTOSE CONCENTRADA - NAN SEM LACTOSE CONCENTRADO (1:25) - 15,8%",
      tag: "NAN SL CONCENTRADO",
      g_po_100ml: 15.8,
      ml_agua_100ml: 90.0,
      ids: ["nan_sl_conc", "nan_sem_lactose_conc"]
    },
    {
      id: "nan_espessar",
      tituloOficial: "DIETA: FÓRMULA ANTI-REFLUXO - NAN ESPESSAR (1:30) - 13,3%",
      tag: "NAN ESPESSAR",
      g_po_100ml: 13.3,
      ml_agua_100ml: 90.0,
      ids: ["nan_espessar", "nan_ar"]
    },
    {
      id: "nan_espessar_conc",
      tituloOficial: "DIETA: FÓRMULA ANTI-REFLUXO CONCENTRADA - NAN ESPESSAR CONCENTRADO (1:25) - 16,0%",
      tag: "NAN ESPESSAR CONCENTRADO",
      g_po_100ml: 16.0,
      ml_agua_100ml: 90.0,
      ids: ["nan_espessar_conc"]
    },
    {
      id: "peptamen_jr",
      tituloOficial: "DIETA: PEPTAMEN JR",
      tag: "PEPTAMEN JR",
      g_po_100ml: 20.0,
      ml_agua_100ml: 85.0,
      ids: ["peptamen_jr", "peptamen"]
    },
    {
      id: "fortini_10",
      tituloOficial: "DIETA: FORTINI (1,0 kcal/ml)",
      tag: "FORTINI 1.0",
      g_po_100ml: 20.0,
      ml_agua_100ml: 85.0,
      ids: ["fortini_10", "fortini"]
    },
    {
      id: "fortini_15",
      tituloOficial: "DIETA: FORTINI CONCENTRADO (1,5 kcal/ml)",
      tag: "FORTINI 1.5",
      g_po_100ml: 30.0,
      ml_agua_100ml: 80.0,
      ids: ["fortini_15", "fortini_plus"]
    },
    {
      id: "infatrini",
      tituloOficial: "DIETA: INFATRINI - 20,4%",
      tag: "INFATRINI",
      g_po_100ml: 20.4,
      ml_agua_100ml: 85.0,
      ids: ["infatrini"]
    },
    {
      id: "modulen_10",
      tituloOficial: "DIETA: MODULEN 1 (1,0 kcal/ml)",
      tag: "MODULEN 1.0",
      g_po_100ml: 20.0,
      ml_agua_100ml: 85.0,
      ids: ["modulen_10", "modulen"]
    },
    {
      id: "modulen_15",
      tituloOficial: "DIETA: MODULEN 2 (1,5 kcal/ml)",
      tag: "MODULEN 1.5",
      g_po_100ml: 30.0,
      ml_agua_100ml: 80.0,
      ids: ["modulen_15", "modulen_2"]
    }
  ],

  /**
   * Grade de horários interativa (clean e compacta)
   */
  gerarHorariosGridHTML(p) {
    const intervalo = p.intervaloHoras || (Number(p.vezesDia) === 12 ? 2 : 3);
    const horasTeoricas = (typeof CensoModule !== "undefined" && typeof CensoModule.gerarHorariosTeoricos === "function")
      ? CensoModule.gerarHorariosTeoricos(p.horarioInicio || "06:00", intervalo)
      : [];
    const horariosAtivos = (typeof CensoModule !== "undefined" && typeof CensoModule.obterHorariosAtivosPaciente === "function")
      ? CensoModule.obterHorariosAtivosPaciente(p)
      : [];

    return `
      <div class="grid grid-cols-4 gap-1 w-48 mx-auto py-0.5">
        ${horasTeoricas.map(hora => {
          const isAtivo = horariosAtivos.includes(hora);
          if (isAtivo) {
            return `
              <div class="inline-flex flex-col items-center justify-center min-w-[42px] h-7 rounded bg-blue-50 border border-blue-300 text-blue-950 px-1 py-0.5 shadow-2xs" title="Horário com refeição: ${hora}">
                <span class="font-mono text-[10.5px] font-black tracking-tight leading-none text-blue-950">${hora}</span>
              </div>
            `;
          } else {
            return `
              <div class="inline-flex flex-col items-center justify-center min-w-[42px] h-7 rounded bg-slate-100 border border-dashed border-slate-300 text-slate-400 opacity-40 px-1 py-0.5" title="Sem refeição: ${hora}">
                <span class="font-mono text-[10px] line-through leading-none">${hora}</span>
              </div>
            `;
          }
        }).join("")}
      </div>
    `;
  },

  /**
   * Badge de status oficial do paciente
   */
  gerarStatusBadgeHTML(p) {
    if (p.alta) {
      return `<span class="inline-flex flex-col items-center justify-center px-2 py-0.5 rounded text-[10.5px] font-bold border border-slate-400 bg-slate-200 text-slate-800 leading-tight text-center whitespace-nowrap"><span>🏥 ALTA</span></span>`;
    } else if (p.suspenso) {
      return `<span class="inline-flex flex-col items-center justify-center px-2 py-0.5 rounded text-[10.5px] font-black border border-amber-400 bg-amber-200 text-amber-950 leading-tight text-center whitespace-nowrap shadow-2xs"><span>⏸ DIETA</span><span>SUSPENSA</span></span>`;
    } else {
      return `<span class="inline-flex flex-col items-center justify-center px-2 py-0.5 rounded text-[10.5px] font-black border border-emerald-300 bg-emerald-100 text-emerald-950 leading-tight text-center whitespace-nowrap shadow-2xs"><span>✓ DIETA</span><span>ATIVA</span></span>`;
    }
  },

  /**
   * Barra de botões de ação para a linha do paciente
   */
  gerarAcoesHTML(p) {
    if (p.alta) {
      return `
        <button 
          onclick="App.reinternarPaciente('${escapeHtml(p.id)}')" 
          title="Reinternar paciente no censo ativo"
          class="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-colors shadow-2xs h-7 inline-flex items-center justify-center cursor-pointer whitespace-nowrap"
        >
          🔄 Reinternar
        </button>
      `;
    }

    return `
      <div class="inline-flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
        <!-- 1. Suspender / Reativar Dieta -->
        <button 
          onclick="App.toggleSuspensao('${escapeHtml(p.id)}')" 
          title="${p.suspenso ? 'Reativar dieta para produção' : 'Suspender dieta temporariamente'}"
          class="px-2 py-0.5 text-[10px] font-extrabold leading-tight text-center rounded transition-colors h-7 flex items-center justify-center cursor-pointer ${p.suspenso ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs' : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-2xs'}"
        >
          ${p.suspenso ? 'Reativar<br>Dieta' : 'Suspender<br>Dieta'}
        </button>

        <!-- 2. Editar Prescrição e Horários (Posicionado entre Suspender e Imprimir) -->
        <button 
          onclick="App.abrirModalEdicao('${escapeHtml(p.id)}')" 
          title="Editar Prescrição e Horários"
          class="w-7 h-7 text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-300 rounded-lg transition-colors flex items-center justify-center text-xs cursor-pointer shadow-2xs"
        >
          ✏️
        </button>

        <!-- 3. Imprimir Etiqueta Individual -->
        <button 
          onclick="App.imprimirEtiquetaIndividual('${escapeHtml(p.id)}')" 
          title="Imprimir Etiqueta Térmica deste paciente"
          class="w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs flex items-center justify-center text-xs cursor-pointer"
        >
          🏷️
        </button>

        <!-- 4. Alta Hospitalar -->
        <button 
          onclick="App.abrirModalAlta('${escapeHtml(p.id)}')" 
          title="Registrar Alta Hospitalar"
          class="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-colors h-7 flex items-center justify-center cursor-pointer whitespace-nowrap"
        >
          🏥 Alta
        </button>

        <!-- 5. Excluir -->
        <button 
          onclick="App.excluirPaciente('${escapeHtml(p.id)}')" 
          title="Excluir paciente permanentemente"
          class="w-7 h-7 text-rose-700 hover:text-rose-900 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center text-xs cursor-pointer"
        >
          🗑️
        </button>
      </div>
    `;
  },

  /**
   * Processa pacientes e calcula os dados de uma planilha
   */
  processarPlanilha(secoesConfig, pacientes) {
    const listaPacientes = (pacientes || []).filter(p => !p.alta);
    
    let totalP1Frascos = 0;
    let totalP2Frascos = 0;
    let totalP1Vol = 0;
    let totalP2Vol = 0;
    let totalGeralVol = 0;
    let totalPoG = 0;
    let totalAguaMl = 0;
    let totalPacientes = 0;

    const blocos = secoesConfig.map(sec => {
      const pacs = listaPacientes.filter(p => {
        const dId = String(p.dietaId || "").toLowerCase();
        const dNome = String(p.dietaNome || "").toLowerCase();
        return sec.ids.some(id => dId === id || dId.includes(id) || dNome.includes(id.replace("_", " ")));
      });

      let blocoP1Frascos = 0;
      let blocoP2Frascos = 0;
      let blocoP1Vol = 0;
      let blocoP2Vol = 0;
      let blocoVolTotal = 0;

      const pacientesProcessados = pacs.map(p => {
        const volUnit = Number(p.volumeMl) || 0;
        const vezesTot = Number(p.vezesDia) || 0;
        const volPrescritoDia = volUnit * vezesTot;

        // Calcula grade de horários
        const grade = (Array.isArray(p.horarios) && p.horarios.length > 0)
          ? p.horarios
          : ((typeof CensoModule !== "undefined" && typeof CensoModule.calcularGradeHorarios === "function")
              ? CensoModule.calcularGradeHorarios(p.horarioInicio || "06:00", vezesTot)
              : []);

        let p1Frascos = 0;
        let p2Frascos = 0;

        if (grade.length > 0) {
          grade.forEach(h => {
            const horaNum = parseInt(String(h).split(":")[0], 10);
            if (horaNum >= 8 && horaNum <= 18) p1Frascos++;
            else p2Frascos++;
          });
        } else {
          p1Frascos = Math.ceil(vezesTot / 2);
          p2Frascos = vezesTot - p1Frascos;
        }

        const p1Vol = p1Frascos * volUnit;
        const p2Vol = p2Frascos * volUnit;

        if (!p.suspenso) {
          blocoP1Frascos += p1Frascos;
          blocoP2Frascos += p2Frascos;
          blocoP1Vol += p1Vol;
          blocoP2Vol += p2Vol;
          blocoVolTotal += volPrescritoDia;
        }

        return {
          paciente: p,
          volUnit,
          vezesTot,
          volDia: volPrescritoDia,
          grade,
          gradeStr: grade.join(", "),
          p1Frascos,
          p2Frascos,
          p1Vol,
          p2Vol,
          suspenso: !!p.suspenso
        };
      });

      const poG = blocoVolTotal * (sec.g_po_100ml / 100.0);
      const aguaMl = blocoVolTotal * (sec.ml_agua_100ml / 100.0);

      totalP1Frascos += blocoP1Frascos;
      totalP2Frascos += blocoP2Frascos;
      totalP1Vol += blocoP1Vol;
      totalP2Vol += blocoP2Vol;
      totalGeralVol += blocoVolTotal;
      totalPoG += poG;
      totalAguaMl += aguaMl;
      totalPacientes += pacs.length;

      return {
        sec,
        pacientes: pacientesProcessados,
        totalPacientes: pacs.length,
        blocoP1Frascos,
        blocoP2Frascos,
        blocoP1Vol,
        blocoP2Vol,
        blocoVolTotal,
        poG,
        aguaMl
      };
    });

    return {
      blocos,
      totais: {
        totalPacientes,
        totalP1Frascos,
        totalP2Frascos,
        totalP1Vol,
        totalP2Vol,
        totalGeralVol,
        totalPoG,
        totalAguaMl
      }
    };
  },

  /**
   * Processa pacientes da Dieta Especial
   */
  processarDietaEspecial(pacientes) {
    const listaPacientes = (pacientes || []).filter(p => !p.alta);
    
    const pacs = listaPacientes.filter(p => {
      const dId = String(p.dietaId || "").toLowerCase();
      const dNome = String(p.dietaNome || "").toLowerCase();
      const espDesc = String(p.dietaEspecialDesc || "").trim();
      
      return dId === "dieta_especial" || 
             dNome.includes("especial") || 
             espDesc.length > 0;
    });

    let totalVol = 0;
    let totalFrascos = 0;

    const lista = pacs.map(p => {
      const volUnit = Number(p.volumeMl) || 0;
      const vezesTot = Number(p.vezesDia) || 0;
      const volDia = volUnit * vezesTot;
      const grade = (Array.isArray(p.horarios) && p.horarios.length > 0)
        ? p.horarios
        : ((typeof CensoModule !== "undefined" && typeof CensoModule.calcularGradeHorarios === "function")
            ? CensoModule.calcularGradeHorarios(p.horarioInicio || "06:00", vezesTot)
            : []);

      if (!p.suspenso) {
        totalVol += volDia;
        totalFrascos += vezesTot;
      }

      const alimento = p.dietaEspecialDesc || p.dietaNome || "Dieta Especial";
      const quantidade = p.dietaEspecialQtd || (volUnit ? `${volUnit} ml` : "-");
      const dietaFormatada = p.dietaEspecialDesc 
        ? `${p.dietaNome} (${p.dietaEspecialDesc}${p.dietaEspecialQtd ? ` - ${p.dietaEspecialQtd}` : ''})` 
        : p.dietaNome;

      return {
        paciente: p,
        alimento,
        quantidade,
        volUnit,
        vezesTot,
        volDia,
        gradeStr: grade.join(", "),
        dietaFormatada,
        suspenso: !!p.suspenso
      };
    });

    return {
      pacientes: lista,
      totais: {
        totalPacientes: pacs.length,
        totalVol,
        totalFrascos
      }
    };
  },

  /**
   * Gera o HTML do Banner Oficial de Cabeçalho da Planilha Atual (Para zona fixa superior)
   */
  gerarHtmlBanner(tituloGeral, subtituloBadge, totais, corBanner = "#6b21a8") {
    const agora = new Date();
    const dataStr = agora.toLocaleDateString("pt-BR") + " às " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return `
      <div class="rounded-xl p-3.5 shadow-sm border border-purple-900/40 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2" style="background: ${corBanner}; color: #ffffff; border-top: 4px solid ${corBanner} !important;">
        <div>
          <div class="text-[10px] uppercase font-black tracking-wider text-purple-200">HOSPITAL SÃO PAULO • CENTRAL DE NUTRIÇÃO E DIETÉTICA</div>
          <h2 class="text-sm sm:text-base font-black tracking-wide text-white mt-0.5">${tituloGeral}</h2>
          <div class="text-[11px] text-purple-200 mt-0.5">${subtituloBadge} • Atualizado em ${dataStr}</div>
        </div>

        <!-- Métricas Resumidas do Cabeçalho -->
        <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span class="bg-white/20 text-white px-2.5 py-1 rounded border border-white/30 font-mono">Pacientes: ${totais.totalPacientes || 0}</span>
          ${totais.totalP1Vol !== undefined ? `<span class="bg-white/20 text-white px-2.5 py-1 rounded border border-white/30 font-mono">P1: ${(totais.totalP1Vol / 1000).toFixed(2)} L</span>` : ''}
          ${totais.totalP2Vol !== undefined ? `<span class="bg-white/20 text-white px-2.5 py-1 rounded border border-white/30 font-mono">P2: ${(totais.totalP2Vol / 1000).toFixed(2)} L</span>` : ''}
          ${totais.totalGeralVol !== undefined ? `<span class="bg-white text-slate-950 px-2.5 py-1 rounded font-black font-mono">TOTAL: ${(totais.totalGeralVol / 1000).toFixed(2)} L</span>` : (totais.totalVol !== undefined ? `<span class="bg-white text-purple-950 px-2.5 py-1 rounded font-black font-mono">Volume Total: ${totais.totalVol} ml</span>` : '')}
        </div>
      </div>
    `;
  },

  /**
   * Gera o corpo rolável contendo as tabelas das fórmulas
   */
  gerarHtmlTabelasCorpo(blocos, corBanner = "#6b21a8") {
    return `
      <div class="space-y-4">
        ${blocos.map(b => {
          const hasPacs = b.pacientes.length > 0;
          return `
            <div class="bg-white rounded-xl border border-purple-200 overflow-hidden shadow-2xs" style="border-top: 4px solid ${corBanner} !important;">
              
              <!-- Título da Dieta / Fórmula -->
              <div class="p-2.5 bg-purple-50/80 border-b border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full ${hasPacs ? 'bg-emerald-500' : 'bg-purple-300'}"></span>
                  <h3 class="text-xs sm:text-sm font-bold text-purple-950 tracking-wide">${b.sec.tituloOficial}</h3>
                </div>
                <div class="flex items-center gap-2 text-[11px] font-mono font-bold text-purple-900">
                  <span>Diluição: ${b.sec.g_po_100ml}g pó / ${b.sec.ml_agua_100ml}ml água</span>
                  <span class="px-2 py-0.5 rounded bg-white text-purple-950 border border-purple-200">${b.totalPacientes} paciente(s)</span>
                </div>
              </div>

              <!-- Tabela de Pacientes do Bloco -->
              <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse min-w-[1180px] text-xs">
                  <thead class="sticky top-0 z-20 bg-purple-50/95 backdrop-blur-xs shadow-2xs">
                    <tr class="text-xs font-bold uppercase text-purple-950 border-b border-purple-200">
                      <th class="py-2.5 px-2 text-center w-10">
                        <input 
                          type="checkbox" 
                          id="censo-select-all-checkbox"
                          onchange="LoteEsteiraModule.selecionarTodos(this.checked)"
                          class="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer" 
                          title="Selecionar todos os pacientes ativos"
                        />
                      </th>
                      <th class="py-2.5 px-2.5 text-center w-16">LEITO</th>
                      <th class="py-2.5 px-2 text-center w-24">ATENDIMENTO</th>
                      <th class="py-2.5 px-3">PACIENTE</th>
                      <th class="py-2.5 px-2.5">ENFERMARIA</th>
                      <th class="py-2.5 px-2.5 text-center">FÓRMULA / DIETA</th>
                      <th class="py-2.5 px-2.5">OBSERVAÇÃO</th>
                      <th class="py-2.5 px-2 text-center min-w-[180px]">HORÁRIOS</th>
                      <th class="py-2.5 px-1.5 text-center w-14">VEZES</th>
                      <th class="py-2.5 px-1.5 text-center w-16">VOL.</th>
                      <th class="py-2.5 px-2 text-center w-16">VIA</th>
                      <th class="py-2.5 px-2.5">DISPOSITIVO</th>
                      <th class="py-2.5 px-2 text-center bg-purple-100/70 text-purple-950 border-x border-purple-200 w-24">PREPARO 1</th>
                      <th class="py-2.5 px-2 text-center bg-pink-100/70 text-pink-950 border-r border-purple-200 w-24">PREPARO 2</th>
                      <th class="py-2.5 px-2 text-center bg-purple-50/60 text-purple-950 font-bold w-24">VOL. DIA</th>
                      <th class="py-2.5 px-2 text-center w-20">STATUS</th>
                      <th class="py-2.5 px-3 text-center sticky right-0 bg-purple-50/95 z-10">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-purple-100 text-xs text-slate-800 bg-white">
                    ${hasPacs ? b.pacientes.map(item => `
                      <tr class="${item.paciente.alta ? 'opacity-60 bg-slate-100' : (item.paciente.suspenso ? 'paciente-suspenso font-medium' : 'hover:bg-purple-50/50 transition-colors')}">
                        <!-- 0. CHECKBOX / SELEÇÃO EM LOTE -->
                        <td class="py-2.5 px-2 text-center">
                          <input 
                            type="checkbox" 
                            class="censo-paciente-checkbox w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                            data-paciente-id="${escapeHtml(item.paciente.id)}"
                            ${typeof LoteEsteiraModule !== 'undefined' && LoteEsteiraModule.estaSelecionado(item.paciente.id) ? 'checked' : ''}
                            onchange="LoteEsteiraModule.toggleSelecao('${escapeHtml(item.paciente.id)}')"
                          />
                        </td>

                        <!-- 1. LEITO -->
                        <td class="py-2.5 px-2.5 text-center">
                          <span class="inline-block px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 text-xs">${escapeHtml(item.paciente.leito || "-")}</span>
                        </td>

                        <!-- 2. ATENDIMENTO -->
                        <td class="py-2.5 px-2 text-center font-mono font-bold text-xs sm:text-[13px] text-slate-700">${escapeHtml(item.paciente.rh || "-")}</td>

                        <!-- 3. PACIENTE -->
                        <td class="py-2.5 px-3 font-bold text-slate-950 text-xs sm:text-[13px]">
                          <button 
                            type="button" 
                            onclick="App.abrirEvolucaoPaciente('${item.paciente.id}')" 
                            class="text-left font-bold text-purple-950 hover:text-purple-600 hover:underline cursor-pointer inline-flex items-center gap-1 group/btn" 
                            title="Clique para ver a Linha do Tempo e Evolução Nutricional"
                          >
                            <span>${escapeHtml(item.paciente.nome || "-")}</span>
                            <span class="text-[11px] opacity-60 group-hover/btn:opacity-100 transition-opacity">📈</span>
                          </button>
                        </td>

                        <!-- 4. ENFERMARIA -->
                        <td class="py-2.5 px-2.5 text-slate-800 font-semibold text-xs sm:text-[12.5px] truncate max-w-[160px]" title="${escapeHtml(item.paciente.enfermariaNome || item.paciente.enfermaria || "-")}">
                          ${escapeHtml(item.paciente.enfermariaNome || item.paciente.enfermaria || "-")}
                        </td>

                        <!-- 5. FÓRMULA / DIETA -->
                        <td class="py-2.5 px-2.5 text-center whitespace-nowrap">
                          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-bold ${item.paciente.categoria === 'AUTOCLAVADA_P1' ? 'bg-purple-100 text-purple-950 border border-purple-200' : 'bg-pink-100 text-pink-950 border border-pink-200'}">
                            ${escapeHtml(item.paciente.dietaNome || b.sec.tituloOficial)}
                          </span>
                        </td>

                        <!-- 6. OBSERVAÇÃO -->
                        <td class="py-2.5 px-2.5 text-amber-900 font-bold text-[11px]">${escapeHtml(item.paciente.espessanteObs || "-")}</td>
                        
                        <!-- 7. HORÁRIOS -->
                        <td class="py-1 px-1.5 text-center">
                          ${PlanilhasCensoModule.gerarHorariosGridHTML(item.paciente)}
                        </td>

                        <!-- 8. VEZES -->
                        <td class="py-2.5 px-1.5 text-center font-mono font-bold text-slate-800 text-xs sm:text-[13px]">${item.vezesTot}x</td>

                        <!-- 9. VOLUME UNITÁRIO -->
                        <td class="py-2.5 px-1.5 text-center font-mono font-bold text-slate-950 text-xs sm:text-[13px]">${item.volUnit} ml</td>

                        <!-- 10. VIA -->
                        <td class="py-2.5 px-2 text-center font-bold text-purple-900 text-xs">${escapeHtml(item.paciente.via || "ORAL")}</td>

                        <!-- 11. DISPOSITIVO -->
                        <td class="py-2.5 px-2.5 text-slate-700 text-xs">${escapeHtml(item.paciente.dispositivo || "Mamadeira")}</td>

                        <!-- 12. PREPARO 1 (08h - 18h) -->
                        <td class="py-2.5 px-2 text-center font-mono font-bold text-purple-950 bg-purple-50/50 text-xs sm:text-[13px] border-x border-purple-100">
                          ${item.p1Vol > 0 ? `${item.p1Vol} ml` : '-'}
                        </td>

                        <!-- 13. PREPARO 2 (20h - 06h) -->
                        <td class="py-2.5 px-2 text-center font-mono font-bold text-pink-950 bg-pink-50/50 text-xs sm:text-[13px] border-r border-purple-100">
                          ${item.p2Vol > 0 ? `${item.p2Vol} ml` : '-'}
                        </td>

                        <!-- 14. VOLUME TOTAL DIÁRIO -->
                        <td class="py-2.5 px-2 text-center font-mono font-black text-purple-950 text-xs sm:text-[13px] bg-purple-50/40">${item.volDia} ml</td>
                        
                        <!-- 15. STATUS -->
                        <td class="py-2.5 px-2 text-center">
                          ${PlanilhasCensoModule.gerarStatusBadgeHTML(item.paciente)}
                        </td>

                        <!-- 16. AÇÕES -->
                        <td class="py-1.5 px-2 text-center whitespace-nowrap sticky right-0 bg-white z-10">
                          ${PlanilhasCensoModule.gerarAcoesHTML(item.paciente)}
                        </td>
                      </tr>
                    `).join("") : `
                      <tr>
                        <td colspan="17" class="py-4 px-3 text-center text-slate-400 italic text-xs">
                          Nenhum paciente ativo com esta prescrição no momento.
                        </td>
                      </tr>
                    `}
                  </tbody>
                  <tfoot>
                    <tr class="bg-purple-50/70 font-bold text-xs border-t-2 border-purple-300 text-purple-950">
                      <td class="py-2.5 px-3 text-left" colspan="12">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="uppercase tracking-wider font-extrabold text-purple-950">Total:</span>
                          <span class="font-mono font-black text-purple-950 text-sm">${b.blocoVolTotal} ml</span>
                          <span class="text-purple-400 font-bold">➔</span>
                          <span class="font-mono font-bold text-purple-950 bg-purple-100/90 px-2 py-0.5 rounded border border-purple-300 text-xs">(${b.poG.toFixed(0)}g de PÓ + ${b.aguaMl.toFixed(0)}ml de ÁGUA)</span>
                        </div>
                      </td>
                      <td class="py-2.5 px-2 text-center font-mono text-purple-950 bg-purple-100/70 border-x border-purple-300 font-black text-xs sm:text-[13px]">
                        ${b.blocoP1Vol} ml
                      </td>
                      <td class="py-2.5 px-2 text-center font-mono text-pink-950 bg-pink-100/70 border-r border-purple-300 font-black text-xs sm:text-[13px]">
                        ${b.blocoP2Vol} ml
                      </td>
                      <td class="py-2.5 px-2 text-center font-mono text-purple-950 bg-purple-100/90 font-black text-xs sm:text-[13px]">
                        ${b.blocoVolTotal} ml
                      </td>
                      <td colspan="2" class="bg-purple-50/70"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>
          `;
        }).join("")}
      </div>
    `;
  },

  /**
   * Gera o corpo rolável contendo a tabela de Dietas Especiais
   */
  gerarHtmlTabelasDietaEspecial(dadosDietaEspecial) {
    const { pacientes, totais } = dadosDietaEspecial;

    return `
      <div class="bg-white rounded-xl border border-purple-200 overflow-hidden shadow-2xs" style="border-top: 4px solid #a21caf !important;">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse min-w-[1180px] text-xs">
            <thead class="sticky top-0 z-20 bg-purple-50/95 backdrop-blur-xs shadow-2xs">
              <tr class="text-xs font-bold uppercase text-purple-950 border-b border-purple-200">
                <th class="py-2.5 px-2 text-center w-10">
                  <input 
                    type="checkbox" 
                    id="censo-select-all-checkbox-especial"
                    onchange="LoteEsteiraModule.selecionarTodos(this.checked)"
                    class="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer" 
                    title="Selecionar todos os pacientes ativos"
                  />
                </th>
                <th class="py-2.5 px-3 text-center w-16">LEITO</th>
                <th class="py-2.5 px-3 text-center w-24">RH</th>
                <th class="py-2.5 px-3">PACIENTE</th>
                <th class="py-2.5 px-3">ENFERMARIA</th>
                <th class="py-2.5 px-3 text-center">FÓRMULA / DIETA</th>
                <th class="py-2.5 px-3">OBSERVAÇÃO</th>
                <th class="py-2.5 px-3">TIPO DE ALIMENTO / DIETA</th>
                <th class="py-2.5 px-2 text-center w-28">QUANTIDADE</th>
                <th class="py-2.5 px-3 text-center min-w-[180px]">HORÁRIOS</th>
                <th class="py-2.5 px-2 text-center w-16">VOLUME</th>
                <th class="py-2.5 px-2 text-center w-14">VEZES</th>
                <th class="py-2.5 px-3 text-center">VIA / DISPOSITIVO</th>
                <th class="py-2.5 px-2 text-center w-20">STATUS</th>
                <th class="py-2.5 px-3 text-center sticky right-0 bg-purple-50/95 z-10">AÇÕES</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-purple-100 text-xs text-slate-800 bg-white">
              ${pacientes.length > 0 ? pacientes.map(item => `
                <tr class="${item.paciente.alta ? 'opacity-60 bg-slate-100' : (item.paciente.suspenso ? 'paciente-suspenso font-medium' : 'hover:bg-purple-50/50 transition-colors')}">
                  <!-- 0. CHECKBOX / SELEÇÃO EM LOTE -->
                  <td class="py-2.5 px-2 text-center">
                    <input 
                      type="checkbox" 
                      class="censo-paciente-checkbox w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      data-paciente-id="${escapeHtml(item.paciente.id)}"
                      ${typeof LoteEsteiraModule !== 'undefined' && LoteEsteiraModule.estaSelecionado(item.paciente.id) ? 'checked' : ''}
                      onchange="LoteEsteiraModule.toggleSelecao('${escapeHtml(item.paciente.id)}')"
                    />
                  </td>

                  <td class="py-2.5 px-3 text-center">
                    <span class="inline-block px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 text-xs">${escapeHtml(item.paciente.leito || "-")}</span>
                  </td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-xs sm:text-[13px] text-slate-700">${escapeHtml(item.paciente.rh || "-")}</td>
                  <td class="py-2.5 px-3 font-bold text-slate-950 text-xs sm:text-[13px]">
                    <button 
                      type="button" 
                      onclick="App.abrirEvolucaoPaciente('${item.paciente.id}')" 
                      class="text-left font-bold text-purple-950 hover:text-purple-600 hover:underline cursor-pointer inline-flex items-center gap-1 group/btn" 
                      title="Clique para ver a Linha do Tempo e Evolução Nutricional"
                    >
                      <span>${escapeHtml(item.paciente.nome || "-")}</span>
                      <span class="text-[11px] opacity-60 group-hover/btn:opacity-100 transition-opacity">📈</span>
                    </button>
                  </td>
                  <td class="py-2.5 px-3 text-slate-800 font-semibold text-xs sm:text-[12.5px] truncate max-w-[160px]" title="${escapeHtml(item.paciente.enfermariaNome || item.paciente.enfermaria || "-")}">
                    ${escapeHtml(item.paciente.enfermariaNome || item.paciente.enfermaria || "-")}
                  </td>
                  <td class="py-2.5 px-3 text-center whitespace-nowrap">
                    <span class="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-950 border border-purple-200">
                      ${escapeHtml(item.paciente.dietaNome || "Dieta Especial")}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-amber-900 font-bold text-[11px]">${escapeHtml(item.paciente.espessanteObs || "-")}</td>
                  
                  <!-- Tipo de Alimento / Dieta -->
                  <td class="py-2.5 px-3 font-bold text-purple-950 text-xs sm:text-[13px]">
                    ${escapeHtml(item.alimento)}
                  </td>

                  <!-- Coluna de Quantidade -->
                  <td class="py-2.5 px-2 text-center font-mono text-purple-950 font-black bg-purple-50/70 text-xs sm:text-[13px] border-x border-purple-200">
                    ${escapeHtml(item.quantidade)}
                  </td>
                  
                  <!-- Coluna HORÁRIOS -->
                  <td class="py-1 px-1.5 text-center">
                    ${PlanilhasCensoModule.gerarHorariosGridHTML(item.paciente)}
                  </td>

                  <td class="py-2.5 px-2 text-center font-mono font-bold text-slate-950 text-xs sm:text-[13px]">${item.volUnit} ml</td>
                  <td class="py-2.5 px-2 text-center font-mono font-bold text-slate-800 text-xs sm:text-[13px]">${item.vezesTot}x</td>
                  <td class="py-2.5 px-3 text-center font-medium text-slate-700 text-xs">
                    ${escapeHtml(item.paciente.via || "ORAL")} • ${escapeHtml(item.paciente.dispositivo || "Mamadeira")}
                  </td>

                  <!-- Coluna STATUS -->
                  <td class="py-2.5 px-2 text-center">
                    ${PlanilhasCensoModule.gerarStatusBadgeHTML(item.paciente)}
                  </td>

                  <!-- Coluna AÇÕES -->
                  <td class="py-1.5 px-2 text-center whitespace-nowrap sticky right-0 bg-white z-10">
                    ${PlanilhasCensoModule.gerarAcoesHTML(item.paciente)}
                  </td>
                </tr>
              `).join("") : `
                <tr>
                  <td colspan="15" class="py-6 text-center text-slate-400 font-medium text-xs">
                    Nenhum paciente com Dieta Especial prescrita no momento.
                  </td>
                </tr>
              `}
            </tbody>
            ${pacientes.length > 0 ? `
              <tfoot>
                <tr class="bg-purple-50/70 font-bold text-xs border-t-2 border-purple-300 text-purple-950">
                  <td class="py-2.5 px-3 text-left" colspan="10">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="uppercase tracking-wider font-extrabold text-purple-950">Total:</span>
                      <span class="font-mono font-black text-purple-950 text-sm">${totais.totalVol} ml</span>
                      <span class="text-purple-400 font-bold">➔</span>
                      <span class="font-mono font-bold text-purple-950 bg-purple-100/90 px-2 py-0.5 rounded border border-purple-300 text-xs">(${totais.totalFrascos} refeições • ${totais.totalPacientes} paciente(s))</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-2 text-center font-mono text-purple-950 bg-purple-100/80 font-black text-xs sm:text-[13px]">
                    ${totais.totalVol} ml
                  </td>
                  <td class="py-2.5 px-2 text-center font-mono text-purple-950 font-bold text-xs sm:text-[13px]">
                    ${totais.totalFrascos}x
                  </td>
                  <td colspan="3" class="bg-purple-50/70"></td>
                </tr>
              </tfoot>
            ` : ''}
          </table>
        </div>
      </div>
    `;
  },

  /**
   * Gera o HTML completo da Planilha de Fórmulas Autoclavadas ou Não Autoclavadas
   */
  gerarHtmlPlanilhaNominal(tituloGeral, subtituloBadge, dadosProcessados, corBanner = "#6b21a8") {
    const banner = PlanilhasCensoModule.gerarHtmlBanner(tituloGeral, subtituloBadge, dadosProcessados.totais, corBanner);
    const tabelas = PlanilhasCensoModule.gerarHtmlTabelasCorpo(dadosProcessados.blocos, corBanner);

    return `
      <div class="space-y-3 w-full">
        ${banner}
        ${tabelas}
      </div>
    `;
  },

  /**
   * Gera o HTML completo da Planilha de Dietas Especiais
   */
  gerarHtmlDietaEspecial(dadosDietaEspecial) {
    const banner = PlanilhasCensoModule.gerarHtmlBanner("RELAÇÃO DE DIETA ESPECIAL", "Alimentos e Fórmulas Personalizadas", dadosDietaEspecial.totais, "#a21caf");
    const tabelas = PlanilhasCensoModule.gerarHtmlTabelasDietaEspecial(dadosDietaEspecial);

    return `
      <div class="space-y-3 w-full">
        ${banner}
        ${tabelas}
      </div>
    `;
  },

  /**
   * Exporta a planilha atual em CSV
   */
  exportarCSV(tipo, pacientesAtivos) {
    let csvContent = "data:text/csv;charset=utf-8,";
    const agora = new Date().toISOString().slice(0, 10);

    if (tipo === "autoclavada" || tipo === "todas") {
      const dados = PlanilhasCensoModule.processarPlanilha(PlanilhasCensoModule.SECOES_AUTOCLAVADA, pacientesAtivos);
      csvContent += "=== RELAÇÃO DE FÓRMULAS AUTOCLAVADAS - HOSPITAL SÃO PAULO ===\n";
      csvContent += "Dieta,Leito,RH,Nome,Enfermaria,Obs,Vezes,Horario,Volume,Via,Dispositivo,Preparo 1,Preparo 2,Volume Total,Status\n";
      
      dados.blocos.forEach(b => {
        b.pacientes.forEach(i => {
          csvContent += `"${b.sec.tituloOficial}","${i.paciente.leito}","${i.paciente.rh}","${i.paciente.nome}","${i.paciente.enfermariaNome || i.paciente.enfermaria || ''}","${i.paciente.espessanteObs}",${i.vezesTot},"${i.gradeStr}",${i.volUnit},"${i.paciente.via}","${i.paciente.dispositivo}",${i.p1Vol},${i.p2Vol},${i.volDia},"${i.paciente.alta ? 'Alta' : (i.paciente.suspenso ? 'Dieta Suspensa' : 'Dieta Ativa')}"\n`;
        });
      });
      csvContent += "\n";
    }

    if (tipo === "nao_autoclavada" || tipo === "todas") {
      const dados = PlanilhasCensoModule.processarPlanilha(PlanilhasCensoModule.SECOES_NAO_AUTOCLAVADA, pacientesAtivos);
      csvContent += "=== RELAÇÃO DE FÓRMULAS NÃO AUTOCLAVADAS - HOSPITAL SÃO PAULO ===\n";
      csvContent += "Dieta,Leito,RH,Nome,Enfermaria,Obs,Vezes,Horario,Volume,Via,Dispositivo,Preparo 1,Preparo 2,Volume Total,Status\n";
      
      dados.blocos.forEach(b => {
        b.pacientes.forEach(i => {
          csvContent += `"${b.sec.tituloOficial}","${i.paciente.leito}","${i.paciente.rh}","${i.paciente.nome}","${i.paciente.enfermariaNome || i.paciente.enfermaria || ''}","${i.paciente.espessanteObs}",${i.vezesTot},"${i.gradeStr}",${i.volUnit},"${i.paciente.via}","${i.paciente.dispositivo}",${i.p1Vol},${i.p2Vol},${i.volDia},"${i.paciente.alta ? 'Alta' : (i.paciente.suspenso ? 'Dieta Suspensa' : 'Dieta Ativa')}"\n`;
        });
      });
      csvContent += "\n";
    }

    if (tipo === "dieta_especial" || tipo === "todas") {
      const dados = PlanilhasCensoModule.processarDietaEspecial(pacientesAtivos);
      csvContent += "=== RELAÇÃO DE DIETAS ESPECIAIS - HOSPITAL SÃO PAULO ===\n";
      csvContent += "Leito,RH,Nome,Enfermaria,Obs,Tipo de Alimento,Quantidade,Volume,Vezes,Horario,Via/Dispositivo,Status\n";
      
      dados.pacientes.forEach(i => {
        csvContent += `"${i.paciente.leito}","${i.paciente.rh}","${i.paciente.nome}","${i.paciente.enfermariaNome || i.paciente.enfermaria || ''}","${i.paciente.espessanteObs}","${i.alimento}","${i.quantidade}",${i.volUnit},${i.vezesTot},"${i.gradeStr}","${i.paciente.via} - ${i.paciente.dispositivo}","${i.paciente.alta ? 'Alta' : (i.paciente.suspenso ? 'Dieta Suspensa' : 'Dieta Ativa')}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relacao_${tipo}_${agora}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Imprime a planilha em A4
   */
  imprimirA4(tipo, pacientesAtivos) {
    const printContainer = document.getElementById("print-area-bancada");
    if (!printContainer) return;

    const agora = new Date();
    const dataStr = agora.toLocaleDateString("pt-BR") + " às " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    let html = `
      <style>
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm 6mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000000;
            background: #ffffff;
            font-size: 8.5pt;
            line-height: 1.15;
          }
          .page-break {
            page-break-before: always;
          }
          .print-header {
            border-bottom: 1.5px solid #000000;
            padding-bottom: 2mm;
            margin-bottom: 3mm;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .print-title {
            font-size: 11.5pt;
            font-weight: 900;
          }
          .print-subtitle {
            font-size: 8.5pt;
            font-weight: bold;
            color: #334155;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 3mm;
          }
          .print-table th, .print-table td {
            border: 1px solid #000000;
            padding: 1.5mm 1.5mm;
            font-size: 8pt;
          }
          .print-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: left;
            text-transform: uppercase;
            font-size: 7.5pt;
          }
          .print-total-row {
            background-color: #e2e8f0;
            font-weight: bold;
          }
        }
      </style>

      <div class="print-header">
        <div>
          <div class="print-title">HOSPITAL SÃO PAULO - UNIFESP/EPM</div>
          <div class="print-subtitle">CENTRAL DE NUTRIÇÃO E DIETÉTICA • LACTÁRIO</div>
          <div style="font-size: 9pt; font-weight: bold; margin-top: 1mm;">
            ${tipo === "autoclavada" ? "RELAÇÃO DIÁRIA DE FÓRMULAS AUTOCLAVADAS" :
              tipo === "nao_autoclavada" ? "RELAÇÃO DIÁRIA DE FÓRMULAS NÃO AUTOCLAVADAS / BANCADA ESTÉRIL" :
              tipo === "dieta_especial" ? "RELAÇÃO DIÁRIA DE DIETAS ESPECIAIS E ALIMENTOS PERSONALIZADOS" :
              "RELAÇÃO GERAL CONSOLIDADA DE PACIENTES E DIETAS"}
          </div>
        </div>
        <div style="text-align: right; font-size: 7.5pt;">
          <div><strong>Data/Hora Emissão:</strong> ${dataStr}</div>
          <div><strong>Total de Pacientes:</strong> ${pacientesAtivos.length}</div>
        </div>
      </div>
    `;

    if (tipo === "interativo") {
      let totalVol = 0;
      let totalFrascos = 0;

      html += `
        <table class="print-table">
          <thead>
            <tr>
              <th style="width:12mm;">LEITO</th>
              <th style="width:18mm;">RH</th>
              <th>PACIENTE</th>
              <th>ENFERMARIA</th>
              <th>DIETA / FÓRMULA</th>
              <th style="width:12mm;">VOL</th>
              <th style="width:8mm;">VEZES</th>
              <th>HORÁRIOS</th>
              <th style="width:14mm;">VIA</th>
              <th style="width:20mm;">DISPOSITIVO</th>
              <th>OBSERVAÇÃO</th>
              <th style="width:14mm;">STATUS</th>
            </tr>
          </thead>
          <tbody>
            ${pacientesAtivos.map(p => {
              const horarios = (typeof CensoModule !== "undefined" && typeof CensoModule.obterHorariosAtivosPaciente === "function")
                ? CensoModule.obterHorariosAtivosPaciente(p).join(", ")
                : (p.horarios || []).join(", ");
              const statusText = p.alta ? "Alta" : (p.suspenso ? "Dieta Suspensa" : "Dieta Ativa");
              const dietaFormatada = p.dietaEspecialDesc 
                ? `${p.dietaNome} (${p.dietaEspecialDesc}${p.dietaEspecialQtd ? ` - ${p.dietaEspecialQtd}` : ''})` 
                : p.dietaNome;

              if (!p.suspenso && !p.alta) {
                const vezes = (typeof CensoModule !== "undefined" && typeof CensoModule.obterHorariosAtivosPaciente === "function")
                  ? CensoModule.obterHorariosAtivosPaciente(p).length
                  : (Number(p.vezesDia) || 0);
                totalVol += (Number(p.volumeMl) || 0) * vezes;
                totalFrascos += vezes;
              }

              return `
                <tr style="${p.suspenso ? 'background: #fffbeb; color: #78350f;' : ''}">
                  <td style="text-align:center; font-weight:bold;">${escapeHtml(p.leito || '-')}</td>
                  <td style="text-align:center;">${escapeHtml(p.rh || '-')}</td>
                  <td style="font-weight:bold;">${escapeHtml(p.nome)}${p.suspenso ? ' <strong style="color:#b45309; font-size:7pt;">[DIETA SUSPENSA]</strong>' : ''}</td>
                  <td>${escapeHtml(p.enfermariaNome || p.enfermaria || '-')}</td>
                  <td>${escapeHtml(dietaFormatada)}</td>
                  <td style="text-align:center;">${Number(p.volumeMl) || 0}ml</td>
                  <td style="text-align:center;">${p.vezesDia || '-'}x</td>
                  <td style="text-align:center;">${escapeHtml(horarios || '-')}</td>
                  <td style="text-align:center;">${escapeHtml(p.via || 'ORAL')}</td>
                  <td>${escapeHtml(p.dispositivo || 'Mamadeira')}</td>
                  <td>${escapeHtml(p.espessanteObs || '-')}</td>
                  <td style="text-align:center; font-weight:bold;">${statusText}</td>
                </tr>
              `;
            }).join("")}
            <tr class="print-total-row">
              <td colspan="4">TOTAL DA RELAÇÃO:</td>
              <td colspan="2" style="text-align:center;">${(totalVol / 1000).toFixed(2)} L (${totalVol} ml)</td>
              <td colspan="2" style="text-align:center;">${totalFrascos} refeições / dia</td>
              <td colspan="4" style="text-align:center;">${pacientesAtivos.length} paciente(s)</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    if (tipo === "autoclavada" || tipo === "todas") {
      const dados = PlanilhasCensoModule.processarPlanilha(PlanilhasCensoModule.SECOES_AUTOCLAVADA, pacientesAtivos);
      html += `<h4 style="margin:4mm 0 2mm; font-size: 9pt; background:#ddd; padding:1.5mm;">FÓRMULAS AUTOCLAVADAS</h4>`;
      dados.blocos.forEach(b => {
        if (b.pacientes.length === 0) return;
        html += `
          <div style="font-weight:bold; font-size:8pt; margin-top:2mm;">${b.sec.tituloOficial}</div>
          <table class="print-table">
            <thead>
              <tr>
                <th style="width:12mm;">LEITO</th>
                <th style="width:18mm;">RH</th>
                <th>PACIENTE</th>
                <th style="width:24mm;">ENFERMARIA</th>
                <th>FÓRMULA / DIETA</th>
                <th>OBS</th>
                <th style="width:8mm;">VEZES</th>
                <th>HORÁRIO</th>
                <th style="width:12mm;">VOL</th>
                <th style="width:16mm;">DISP</th>
                <th style="width:16mm;">PREP 1</th>
                <th style="width:16mm;">PREP 2</th>
                <th style="width:16mm;">VOL DIA</th>
              </tr>
            </thead>
            <tbody>
              ${b.pacientes.map(i => `
                <tr style="${i.paciente.suspenso ? 'background: #fffbeb; color: #78350f;' : ''}">
                  <td style="text-align:center; font-weight:bold;">${i.paciente.leito}</td>
                  <td style="text-align:center;">${i.paciente.rh || '-'}</td>
                  <td style="font-weight:bold;">${i.paciente.nome}${i.paciente.suspenso ? ' <strong style="color:#b45309; font-size:7pt;">[DIETA SUSPENSA]</strong>' : ''}</td>
                  <td>${i.paciente.enfermariaNome || i.paciente.enfermaria || '-'}</td>
                  <td style="font-weight:bold;">${escapeHtml(i.paciente.dietaNome || b.sec.tituloOficial)}</td>
                  <td>${i.paciente.espessanteObs || '-'}</td>
                  <td style="text-align:center;">${i.vezesTot}</td>
                  <td style="text-align:center;">${i.gradeStr}</td>
                  <td style="text-align:center;">${i.volUnit}ml</td>
                  <td>${i.paciente.dispositivo}</td>
                  <td style="text-align:center;">${i.paciente.suspenso ? '0ml' : `${i.p1Vol}ml`}</td>
                  <td style="text-align:center;">${i.paciente.suspenso ? '0ml' : `${i.p2Vol}ml`}</td>
                  <td style="text-align:center; font-weight:bold;">${i.paciente.suspenso ? '0ml (SUSP)' : `${i.volDia}ml`}</td>
                </tr>
              `).join("")}
              <tr class="print-total-row">
                <td colspan="10" style="text-align:left; font-weight:bold;">TOTAL: ${b.blocoVolTotal}ml -> (${b.poG.toFixed(0)}g de PÓ + ${b.aguaMl.toFixed(0)}ml de ÁGUA)</td>
                <td style="text-align:center;">${b.blocoP1Vol}ml</td>
                <td style="text-align:center;">${b.blocoP2Vol}ml</td>
                <td style="text-align:center; font-weight:bold;">${b.blocoVolTotal}ml</td>
              </tr>
            </tbody>
          </table>
        `;
      });
    }

    if (tipo === "nao_autoclavada" || tipo === "todas") {
      const dados = PlanilhasCensoModule.processarPlanilha(PlanilhasCensoModule.SECOES_NAO_AUTOCLAVADA, pacientesAtivos);
      html += `<div class="page-break"></div><h4 style="margin:4mm 0 2mm; font-size: 9pt; background:#ddd; padding:1.5mm;">FÓRMULAS NÃO AUTOCLAVADAS / BANCADA ESTÉRIL</h4>`;
      dados.blocos.forEach(b => {
        if (b.pacientes.length === 0) return;
        html += `
          <div style="font-weight:bold; font-size:8pt; margin-top:2mm;">${b.sec.tituloOficial}</div>
          <table class="print-table">
            <thead>
              <tr>
                <th style="width:12mm;">LEITO</th>
                <th style="width:18mm;">RH</th>
                <th>PACIENTE</th>
                <th style="width:24mm;">ENFERMARIA</th>
                <th>FÓRMULA / DIETA</th>
                <th>OBS</th>
                <th style="width:8mm;">VEZES</th>
                <th>HORÁRIO</th>
                <th style="width:12mm;">VOL</th>
                <th style="width:16mm;">DISP</th>
                <th style="width:16mm;">PREP 1</th>
                <th style="width:16mm;">PREP 2</th>
                <th style="width:16mm;">VOL DIA</th>
              </tr>
            </thead>
            <tbody>
              ${b.pacientes.map(i => `
                <tr style="${i.paciente.suspenso ? 'background: #fffbeb; color: #78350f;' : ''}">
                  <td style="text-align:center; font-weight:bold;">${i.paciente.leito}</td>
                  <td style="text-align:center;">${i.paciente.rh || '-'}</td>
                  <td style="font-weight:bold;">${i.paciente.nome}${i.paciente.suspenso ? ' <strong style="color:#b45309; font-size:7pt;">[DIETA SUSPENSA]</strong>' : ''}</td>
                  <td>${i.paciente.enfermariaNome || i.paciente.enfermaria || '-'}</td>
                  <td style="font-weight:bold;">${escapeHtml(i.paciente.dietaNome || b.sec.tituloOficial)}</td>
                  <td>${i.paciente.espessanteObs || '-'}</td>
                  <td style="text-align:center;">${i.vezesTot}</td>
                  <td style="text-align:center;">${i.gradeStr}</td>
                  <td style="text-align:center;">${i.volUnit}ml</td>
                  <td>${i.paciente.dispositivo}</td>
                  <td style="text-align:center;">${i.paciente.suspenso ? '0ml' : `${i.p1Vol}ml`}</td>
                  <td style="text-align:center;">${i.paciente.suspenso ? '0ml' : `${i.p2Vol}ml`}</td>
                  <td style="text-align:center; font-weight:bold;">${i.paciente.suspenso ? '0ml (SUSP)' : `${i.volDia}ml`}</td>
                </tr>
              `).join("")}
              <tr class="print-total-row">
                <td colspan="10" style="text-align:left; font-weight:bold;">TOTAL: ${b.blocoVolTotal}ml -> (${b.poG.toFixed(0)}g de PÓ + ${b.aguaMl.toFixed(0)}ml de ÁGUA)</td>
                <td style="text-align:center;">${b.blocoP1Vol}ml</td>
                <td style="text-align:center;">${b.blocoP2Vol}ml</td>
                <td style="text-align:center; font-weight:bold;">${b.blocoVolTotal}ml</td>
              </tr>
            </tbody>
          </table>
        `;
      });
    }

    if (tipo === "dieta_especial" || tipo === "todas") {
      const dados = PlanilhasCensoModule.processarDietaEspecial(pacientesAtivos);
      html += `<div class="page-break"></div><h4 style="margin:4mm 0 2mm; font-size: 9pt; background:#ddd; padding:1.5mm;">DIETAS ESPECIAIS E ALIMENTOS PERSONALIZADOS</h4>`;
      html += `
        <table class="print-table">
          <thead>
            <tr>
              <th style="width:12mm;">LEITO</th>
              <th style="width:18mm;">RH</th>
              <th>PACIENTE</th>
              <th style="width:24mm;">ENFERMARIA</th>
              <th>FÓRMULA / DIETA</th>
              <th>OBS</th>
              <th>TIPO DE ALIMENTO / DIETA</th>
              <th style="width:18mm;">QUANTIDADE</th>
              <th style="width:14mm;">VOL</th>
              <th style="width:10mm;">VEZES</th>
              <th>HORÁRIOS</th>
              <th>VIA / DISPOSITIVO</th>
            </tr>
          </thead>
          <tbody>
            ${dados.pacientes.map(i => `
              <tr style="${i.paciente.suspenso ? 'background: #fffbeb; color: #78350f;' : ''}">
                <td style="text-align:center; font-weight:bold;">${i.paciente.leito}</td>
                <td style="text-align:center;">${i.paciente.rh || '-'}</td>
                <td style="font-weight:bold;">${i.paciente.nome}${i.paciente.suspenso ? ' <strong style="color:#b45309; font-size:7pt;">[DIETA SUSPENSA]</strong>' : ''}</td>
                <td>${i.paciente.enfermariaNome || i.paciente.enfermaria || '-'}</td>
                <td style="font-weight:bold;">${escapeHtml(i.paciente.dietaNome || "Dieta Especial")}</td>
                <td>${i.paciente.espessanteObs || '-'}</td>
                <td style="font-weight:bold;">${i.alimento}</td>
                <td style="text-align:center; font-weight:bold;">${i.quantidade}</td>
                <td style="text-align:center;">${i.volUnit}ml</td>
                <td style="text-align:center;">${i.vezesTot}x</td>
                <td style="text-align:center;">${i.gradeStr}</td>
                <td>${i.paciente.via} • ${i.paciente.dispositivo}${i.paciente.suspenso ? ' • <strong style="color:#b45309;">SUSPENSA</strong>' : ''}</td>
              </tr>
            `).join("")}
            <tr class="print-total-row">
              <td colspan="8" style="text-align:left; font-weight:bold;">TOTAL DIETAS ESPECIAIS: ${dados.totais.totalVol}ml -> (${dados.totais.totalFrascos} refeições • ${dados.totais.totalPacientes} paciente(s))</td>
              <td style="text-align:center; font-weight:bold;">${dados.totais.totalVol}ml</td>
              <td style="text-align:center; font-weight:bold;">${dados.totais.totalFrascos}x</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>
      `;
    }

    // Rodapé Oficial com Assinatura Técnica do(a) Nutricionista Responsável
    const nutri = (typeof App !== "undefined" && typeof App.obterDadosNutricionista === "function")
      ? App.obterDadosNutricionista()
      : { nome: "", crn: "", setor: "", ramal: "" };

    const nutriTexto = nutri.nome 
      ? `<strong>Nutricionista Responsável:</strong> ${escapeHtml(nutri.nome)} • <strong>CRN:</strong> ${escapeHtml(nutri.crn || 'Não informado')}${nutri.setor ? ` (${escapeHtml(nutri.setor)})` : ''}`
      : `<strong>Nutricionista Responsável:</strong> ___________________________ • <strong>CRN:</strong> _________`;

    html += `
      <div style="margin-top: 6mm; padding-top: 3mm; border-top: 1px solid #000000; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8pt;">
        <div>${nutriTexto}</div>
        <div style="text-align: right;">
          <div>Assinatura: ___________________________</div>
          <div style="font-size: 7.5pt; color: #475569; margin-top: 1mm;">Lactário Digital • Hospital São Paulo - UNIFESP • Emissão: ${dataStr}</div>
        </div>
      </div>
    `;

    printContainer.innerHTML = html;
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
  window.PlanilhasCensoModule = PlanilhasCensoModule;
}
