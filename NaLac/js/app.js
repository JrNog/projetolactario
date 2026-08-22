/**
 * ============================================================================
 * LACTÁRIO DIGITAL - HOSPITAL SÃO PAULO (UNIFESP-EPM)
 * Controlador Principal da SPA (Single Page Application)
 * ============================================================================
 */

const App = {
  abaAtiva: "censo",
  subAbaConfigAtiva: "enfermarias",
  dietasCatalogo: [],
  enfermariasCatalogo: [],
  intervalosCatalogo: [],
  viasCatalogo: [],
  dispositivosCatalogo: [],
  pacienteEdicaoId: null,
  pacienteAltaId: null,
  ultimoEnfermariaSelecionada: null,
  ultimoDietaSelecionada: null,
  edicaoPendente: null,
  gradeHorariosModal: [], // Array de { hora: "06:00", ativo: true }

  async init() {
    console.log("Iniciando Lactário Digital - Hospital São Paulo...");
    
    // Carregar dietas e censo em paralelo (elimina waterfall)
    const [dietas] = await Promise.all([
      ApiService.getDietas(),
      CensoModule.init()
    ]);
    this.dietasCatalogo = dietas;

    // Carregar catálogos mestres configuráveis
    this.carregarListasConfiguraveis();

    // Recuperar preferências salvas de retenção
    this.carregarPreferenciasRetencao();

    // Inicializar UI e Eventos
    this.popularSelects();
    this.atualizarDatalistsAutocompletar();
    this.renderizarTudo();
    this.configurarEventos();

    this.atualizarStatusConexao();
    this.atualizarBotaoUndo();
  },

  // Carrega as 5 listas mestres configuráveis do localStorage ou padrões oficiais
  carregarListasConfiguraveis() {
    // 1. Enfermarias (Catálogo Oficial das 47 Enfermarias da aba 'Config' do Excel)
    const padraoEnf = (typeof ENFERMARIAS_SPDM !== "undefined" && ENFERMARIAS_SPDM.length > 0)
      ? ENFERMARIAS_SPDM
      : ENFERMARIAS_HSP;

    const salvoEnf = localStorage.getItem("lactario_config_enfermarias");
    if (salvoEnf) {
      try {
        this.enfermariasCatalogo = JSON.parse(salvoEnf);
      } catch (e) {
        this.enfermariasCatalogo = JSON.parse(JSON.stringify(padraoEnf));
      }
    } else {
      this.enfermariasCatalogo = JSON.parse(JSON.stringify(padraoEnf));
    }

    // 2. Intervalos
    const salvoInt = localStorage.getItem("lactario_config_intervalos");
    const padraoInt = [
      { id: "3", horas: 3, label: "De 3 em 3 horas (Padrão - 8 horários)", refeicoes: 8 },
      { id: "2", horas: 2, label: "De 2 em 2 horas (12 horários)", refeicoes: 12 },
      { id: "4", horas: 4, label: "De 4 em 4 horas (6 horários)", refeicoes: 6 }
    ];
    if (salvoInt) {
      try {
        this.intervalosCatalogo = JSON.parse(salvoInt);
      } catch (e) {
        this.intervalosCatalogo = padraoInt;
      }
    } else {
      this.intervalosCatalogo = padraoInt;
    }

    // 3. Vias
    const salvoVias = localStorage.getItem("lactario_config_vias");
    const padraoVias = [
      { id: "ORAL", nome: "ORAL", descricao: "Via oral (mamadeira / copo)" },
      { id: "ENTERAL", nome: "ENTERAL", descricao: "Nutrição enteral geral" },
      { id: "SONDA NASOGÁSTRICA (SNG)", nome: "SONDA NASOGÁSTRICA (SNG)", descricao: "Sonda gástrica" },
      { id: "SONDA NASOENTERAL (SNE)", nome: "SONDA NASOENTERAL (SNE)", descricao: "Sonda enteral pós-pilórica" },
      { id: "GASTROSTOMIA (GTT)", nome: "GASTROSTOMIA (GTT)", descricao: "Estomia gástrica" },
      { id: "JEJUNOSTOMIA", nome: "JEJUNOSTOMIA", descricao: "Estomia jejunal" }
    ];
    if (salvoVias) {
      try {
        this.viasCatalogo = JSON.parse(salvoVias);
      } catch (e) {
        this.viasCatalogo = padraoVias;
      }
    } else {
      this.viasCatalogo = padraoVias;
    }

    // 4. Dispositivos
    const salvoDisp = localStorage.getItem("lactario_config_dispositivos");
    const padraoDisp = [
      { id: "Mamadeira", nome: "Mamadeira", descricao: "Frasco graduado com bico" },
      { id: "Frasco Enteral", nome: "Frasco Enteral", descricao: "Frasco para bomba ou gravidade" },
      { id: "Frasco V.O.", nome: "Frasco V.O.", descricao: "Frasco para via oral" },
      { id: "Chuca sem bico", nome: "Chuca sem bico", descricao: "Chuca descartável" },
      { id: "Copo", nome: "Copo", descricao: "Copo dosador" },
      { id: "Seringa", nome: "Seringa", descricao: "Seringa enteral graduada" },
      { id: "Equipo Roxo", nome: "Equipo Roxo", descricao: "Linha de infusão enteral" }
    ];
    if (salvoDisp) {
      try {
        this.dispositivosCatalogo = JSON.parse(salvoDisp);
      } catch (e) {
        this.dispositivosCatalogo = padraoDisp;
      }
    } else {
      this.dispositivosCatalogo = padraoDisp;
    }
  },

  // Carrega configurações locais de retenção de campos
  carregarPreferenciasRetencao() {
    const salvoManter = localStorage.getItem("lactario_manter_campos_v1");
    const checkManter = document.getElementById("modal-manter-campos");
    if (checkManter) {
      checkManter.checked = salvoManter !== "false"; // Default: true
    }
  },

  // Popula os seletores de enfermarias, dietas, dispositivos e vias nos formulários dinamicamente
  popularSelects() {
    // 1. Select de Filtro de Enfermarias no Censo
    const selectFiltroEnf = document.getElementById("filtro-enfermaria");
    if (selectFiltroEnf) {
      selectFiltroEnf.innerHTML = '<option value="TODAS">Todas as Enfermarias</option>';
      this.enfermariasCatalogo.forEach(enf => {
        selectFiltroEnf.innerHTML += `<option value="${enf.id}">${enf.nome} (${enf.sigla || enf.id})</option>`;
      });
    }

    // 2. Select de Enfermarias no Modal de Paciente
    const selectModalEnf = document.getElementById("modal-enfermaria");
    if (selectModalEnf) {
      selectModalEnf.innerHTML = "";
      this.enfermariasCatalogo.forEach(enf => {
        selectModalEnf.innerHTML += `<option value="${enf.id}">${enf.nome}</option>`;
      });
    }

    // 3. Select de Dietas no Modal de Paciente com Cores Diferenciadas (Autoclavadas vs Não Autoclavadas)
    const selectModalDieta = document.getElementById("modal-dieta");
    if (selectModalDieta) {
      selectModalDieta.innerHTML = "";
      
      const autoclavadas = this.dietasCatalogo.filter(d => d.categoria === "AUTOCLAVADA_P1" || d.categoria === "AUTOCLAVADA_P2");
      const naoAutoclavadas = this.dietasCatalogo.filter(d => d.categoria === "NAO_AUTOCLAVADA");
      const especiais = this.dietasCatalogo.filter(d => d.categoria === "ESPECIAIS");
      const jejum = this.dietasCatalogo.filter(d => d.categoria === "JEJUM");

      let htmlDietas = "";

      if (autoclavadas.length > 0) {
        htmlDietas += `<optgroup label="🔥 DIETAS AUTOCLAVADAS (Preparo Térmico)" style="background-color: #eff6ff; color: #1e3a8a; font-weight: bold;">`;
        autoclavadas.forEach(d => {
          htmlDietas += `<option value="${d.id}" style="background-color: #dbeafe; color: #1e3a8a; font-weight: 600;">🔵 [Autoclavada] ${d.nome} (${d.g_po_100ml}g/100ml)</option>`;
        });
        htmlDietas += `</optgroup>`;
      }

      if (naoAutoclavadas.length > 0) {
        htmlDietas += `<optgroup label="✨ DIETAS NÃO AUTOCLAVADAS (Bancada Estéril)" style="background-color: #fdf2f8; color: #831843; font-weight: bold;">`;
        naoAutoclavadas.forEach(d => {
          htmlDietas += `<option value="${d.id}" style="background-color: #fce7f3; color: #831843; font-weight: 600;">🟣 [Não Autoclavada] ${d.nome} (${d.g_po_100ml}g/100ml)</option>`;
        });
        htmlDietas += `</optgroup>`;
      }

      if (especiais.length > 0) {
        htmlDietas += `<optgroup label="⭐ DIETA ESPECIAL" style="background-color: #fffbeb; color: #78350f; font-weight: bold;">`;
        const itemUnico = especiais.find(d => d.id === "dieta_especial") || especiais[0] || { id: "dieta_especial", nome: "Dieta Especial" };
        htmlDietas += `<option value="${itemUnico.id}" style="background-color: #fef3c7; color: #78350f; font-weight: 600;">⭐ Dieta Especial</option>`;
        htmlDietas += `</optgroup>`;
      }

      if (jejum.length > 0) {
        htmlDietas += `<optgroup label="💧 ABREVIAÇÃO DE JEJUM" style="background-color: #f0f9ff; color: #0369a1; font-weight: bold;">`;
        jejum.forEach(d => {
          htmlDietas += `<option value="${d.id}" style="background-color: #e0f2fe; color: #0369a1; font-weight: 600;">💧 ${d.nome}</option>`;
        });
        htmlDietas += `</optgroup>`;
      }

      selectModalDieta.innerHTML = htmlDietas;
    }

    // 4. Select de Intervalo no Modal de Paciente
    const selectModalInt = document.getElementById("modal-intervalo");
    if (selectModalInt) {
      selectModalInt.innerHTML = "";
      this.intervalosCatalogo.forEach(item => {
        selectModalInt.innerHTML += `<option value="${item.horas}">${item.label}</option>`;
      });
    }

    // 5. Select de Dispositivos no Modal
    const selectModalDisp = document.getElementById("modal-dispositivo");
    if (selectModalDisp) {
      selectModalDisp.innerHTML = "";
      this.dispositivosCatalogo.forEach(disp => {
        const nome = typeof disp === "string" ? disp : disp.nome;
        selectModalDisp.innerHTML += `<option value="${nome}">${nome}</option>`;
      });
    }

    // 6. Select de Vias no Modal
    const selectModalVia = document.getElementById("modal-via");
    if (selectModalVia) {
      selectModalVia.innerHTML = "";
      this.viasCatalogo.forEach(via => {
        const nome = typeof via === "string" ? via : via.nome;
        selectModalVia.innerHTML += `<option value="${nome}">${nome}</option>`;
      });
    }

    // 7. Select de Filtro de Enfermaria na Central de Etiquetas
    const selectFiltroEtq = document.getElementById("etiquetas-filtro-enfermaria");
    if (selectFiltroEtq) {
      selectFiltroEtq.innerHTML = '<option value="TODAS">Todas as Enfermarias</option>';
      this.enfermariasCatalogo.forEach(enf => {
        selectFiltroEtq.innerHTML += `<option value="${enf.id}">${enf.nome} (${enf.sigla || enf.id})</option>`;
      });
    }
  },

  // Alterna a exibição do campo de especificação para Dieta Especial e estiliza o select
  atualizarVisibilidadeDietaEspecialModal() {
    const selectDieta = document.getElementById("modal-dieta");
    const containerEspecial = document.getElementById("modal-container-dieta-especial");
    const inputDesc = document.getElementById("modal-dieta-especial-desc");
    if (!selectDieta || !containerEspecial) return;

    const dietaId = selectDieta.value;
    const dietaObj = this.dietasCatalogo.find(d => d.id === dietaId);
    
    // Altera a cor de fundo do próprio select conforme a categoria selecionada
    if (dietaObj) {
      if (dietaObj.categoria === "AUTOCLAVADA_P1" || dietaObj.categoria === "AUTOCLAVADA_P2") {
        selectDieta.className = "w-full h-10 px-3 bg-blue-50 border border-blue-300 rounded-lg text-xs font-bold text-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer";
      } else if (dietaObj.categoria === "NAO_AUTOCLAVADA") {
        selectDieta.className = "w-full h-10 px-3 bg-pink-50 border border-pink-300 rounded-lg text-xs font-bold text-pink-950 focus:bg-white focus:ring-2 focus:ring-pink-600 focus:outline-none cursor-pointer";
      } else if (dietaObj.categoria === "ESPECIAIS") {
        selectDieta.className = "w-full h-10 px-3 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-950 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none cursor-pointer";
      } else {
        selectDieta.className = "w-full h-10 px-3 bg-sky-50 border border-sky-300 rounded-lg text-xs font-bold text-sky-950 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none cursor-pointer";
      }
    }

    // Se for Dieta Especial ou da categoria especial, exibe o campo para especificar o alimento/fórmula
    const isEspecial = dietaId === "dieta_especial" || (dietaObj && (dietaObj.categoria === "ESPECIAIS" || dietaObj.nome.toLowerCase().includes("especial")));
    if (isEspecial) {
      containerEspecial.classList.remove("hidden");
      if (inputDesc && !inputDesc.value) {
        setTimeout(() => inputDesc.focus(), 50);
      }
    } else {
      containerEspecial.classList.add("hidden");
    }
  },

  // Atualiza as listas de sugestões para Autocomplete (RH, Nomes e Leitos das 47 Enfermarias)
  atualizarDatalistsAutocompletar() {
    const historico = CensoModule.getHistoricoRHeNomes();
    
    const datalistRH = document.getElementById("rh-sugestoes");
    if (datalistRH) {
      datalistRH.innerHTML = historico.rhs.map(rh => `<option value="${rh}">`).join("");
    }

    const datalistNomes = document.getElementById("nomes-sugestoes");
    if (datalistNomes) {
      datalistNomes.innerHTML = historico.nomes.map(nome => `<option value="${nome}">`).join("");
    }

    const datalistLeitos = document.getElementById("leitos-sugestoes");
    if (datalistLeitos) {
      let sugestoes = [];
      this.enfermariasCatalogo.forEach(enf => {
        if (Array.isArray(enf.leitos) && enf.leitos.length > 0) {
          enf.leitos.forEach(l => sugestoes.push({ leito: l, enfNome: enf.nome }));
        } else if (enf.leitoInicial && enf.leitoFinal && typeof window.gerarLeitosDaFaixa === "function") {
          const leitosGerados = window.gerarLeitosDaFaixa(enf.leitoInicial, enf.leitoFinal);
          leitosGerados.forEach(l => sugestoes.push({ leito: l, enfNome: enf.nome }));
        }
      });
      datalistLeitos.innerHTML = sugestoes.map(item => `<option value="${item.leito}">${item.enfNome}</option>`).join("");
    }
  },

  // Identifica a qual enfermaria um determinado leito pertence (baseado na aba 'Config')
  detectarEnfermariaPorLeito(leito) {
    if (!leito) return null;
    const leitoFormatado = String(leito).toUpperCase().trim();
    if (leitoFormatado.length < 2) return null;

    // 1. Correspondência exata no array de leitos
    for (const enf of this.enfermariasCatalogo) {
      if (Array.isArray(enf.leitos) && enf.leitos.includes(leitoFormatado)) {
        return enf;
      }
    }

    // 2. Correspondência por faixa alfanumérica (leitoInicial a leitoFinal ou faixa: "X a Y")
    for (const enf of this.enfermariasCatalogo) {
      let ini = enf.leitoInicial;
      let fim = enf.leitoFinal;

      if ((!ini || !fim) && enf.faixa && enf.faixa.includes(" a ")) {
        const parts = enf.faixa.split(/ a /i);
        ini = parts[0].trim().toUpperCase();
        fim = parts[1].trim().toUpperCase();
      }

      if (ini && fim) {
        ini = String(ini).toUpperCase().trim();
        fim = String(fim).toUpperCase().trim();

        const regex = /^([A-Z]+)(\d+)$/;
        const matchIni = ini.match(regex);
        const matchFim = fim.match(regex);
        const matchLeito = leitoFormatado.match(regex);

        if (matchIni && matchFim && matchLeito) {
          const prefixIni = matchIni[1];
          const prefixFim = matchFim[1];
          const prefixLeito = matchLeito[1];

          if (prefixIni === prefixFim && prefixLeito === prefixIni) {
            const numIni = parseInt(matchIni[2], 10);
            const numFim = parseInt(matchFim[2], 10);
            const numLeito = parseInt(matchLeito[2], 10);

            if (numLeito >= numIni && numLeito <= numFim) {
              return enf;
            }
          }
        } else {
          if (leitoFormatado >= ini && leitoFormatado <= fim && leitoFormatado.length >= ini.length) {
            return enf;
          }
        }
      }
    }

    return null;
  },

  // Disparado ao digitar no campo de Leito do Modal de Paciente (preenchimento automático da Enfermaria)
  aoDigitarLeitoModal(valor) {
    const inputLeito = document.getElementById("modal-leito");
    const selectEnf = document.getElementById("modal-enfermaria");
    if (!inputLeito) return;

    const leitoFormatado = String(valor || "").toUpperCase().trim();
    inputLeito.value = leitoFormatado;

    if (!leitoFormatado || !selectEnf) return;

    const enf = this.detectarEnfermariaPorLeito(leitoFormatado);
    if (enf) {
      selectEnf.value = enf.id;
      this.ultimoEnfermariaSelecionada = enf.id;

      // Destaque visual sutil de confirmação de auto-preenchimento
      selectEnf.classList.remove("border-slate-300");
      selectEnf.classList.add("border-emerald-500", "bg-emerald-50", "text-emerald-950");
      setTimeout(() => {
        selectEnf.classList.remove("border-emerald-500", "bg-emerald-50", "text-emerald-950");
        selectEnf.classList.add("border-slate-300");
      }, 1000);
    }
  },

  // Renderiza todos os módulos
  renderizarTudo() {
    this.renderizarMetricas();
    this.renderizarDashboard();
    this.renderizarCenso();
    this.renderizarBancada();
    this.renderizarSPDM();
    this.renderizarEtiquetas();
    this.renderizarCompras();
    this.renderizarConfiguracoes();
    this.atualizarDatalistsAutocompletar();
    this.atualizarBotaoUndo();
  },

  // Renderiza o Dashboard Clínico Intuitivo
  renderizarDashboard() {
    if (typeof DashboardModule !== "undefined") {
      DashboardModule.renderizar();
    }
  },

  // Abre a Linha do Tempo e Relatório de Evolução do Paciente
  abrirEvolucaoPaciente(pacienteId) {
    if (typeof EvolucaoModule !== "undefined") {
      EvolucaoModule.abrirModal(pacienteId);
    }
  },

  // Troca de Aba (Sidebar e Seções)
  trocarAba(nomeAba) {
    this.abaAtiva = nomeAba;

    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      if (btn.dataset.tab === nomeAba) {
        btn.classList.add("active-tab", "bg-gradient-to-r", "from-purple-600", "via-fuchsia-600", "to-pink-600", "text-white", "font-black", "shadow-lg", "shadow-purple-600/30", "border-cyan-400");
        btn.classList.remove("text-white", "text-slate-100", "text-purple-200/75", "text-purple-200/80", "text-slate-300", "hover:text-white", "hover:bg-white/12", "hover:bg-purple-900/40", "hover:bg-purple-900/30", "hover:bg-slate-800/80", "hover:bg-slate-800", "border-transparent", "border-purple-800/60", "border-slate-800");
      } else {
        btn.classList.remove("active-tab", "bg-gradient-to-r", "from-purple-600", "via-fuchsia-600", "to-pink-600", "from-purple-600/90", "to-fuchsia-600/90", "bg-indigo-600", "bg-sky-600", "text-white", "shadow-lg", "shadow-purple-600/30", "shadow-md", "shadow-purple-600/20", "shadow-sm", "border-cyan-400", "border-pink-400", "border-indigo-400", "border-indigo-500", "border-sky-500", "font-black");
        btn.classList.add("text-white", "hover:text-white", "hover:bg-white/12", "border-transparent");
      }
    });

    document.querySelectorAll(".tab-section").forEach(sec => {
      if (sec.id === `tab-${nomeAba}`) {
        sec.classList.remove("hidden");
      } else {
        sec.classList.add("hidden");
      }
    });

    if (nomeAba === "dashboard") this.renderizarDashboard();
    if (nomeAba === "bancada") this.renderizarBancada();
    if (nomeAba === "spdm") this.renderizarSPDM();
    if (nomeAba === "etiquetas") this.renderizarEtiquetas();
    if (nomeAba === "compras") this.renderizarCompras();
    if (nomeAba === "config") this.renderizarConfiguracoes();
  },

  // Alterna o modo de exibição do Censo (Pacientes Ativos vs Todos os Pacientes)
  alternarModoExibicaoCenso(modo) {
    CensoModule.modoExibicao = modo;
    
    const btnAtivo = document.getElementById("btn-modo-censo-ativo");
    const btnGeral = document.getElementById("btn-modo-historico-geral");

    if (modo === "CENSO_ATIVO") {
      if (btnAtivo) btnAtivo.className = "h-full px-2.5 rounded-md font-black bg-purple-700 text-white shadow-xs border border-purple-800 ring-1 ring-purple-400/40 transition-all cursor-pointer flex items-center gap-1 text-[11px]";
      if (btnGeral) btnGeral.className = "h-full px-2.5 rounded-md font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-300/80 transition-all cursor-pointer flex items-center gap-1 border border-transparent text-[11px]";
    } else {
      if (btnAtivo) btnAtivo.className = "h-full px-2.5 rounded-md font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-300/80 transition-all cursor-pointer flex items-center gap-1 border border-transparent text-[11px]";
      if (btnGeral) btnGeral.className = "h-full px-2.5 rounded-md font-black bg-purple-700 text-white shadow-xs border border-purple-800 ring-1 ring-purple-400/40 transition-all cursor-pointer flex items-center gap-1 text-[11px]";
    }

    this.renderizarCenso();
  },

  // Alterna e atualiza a ordenação das colunas do Censo
  ordenarCenso(coluna) {
    CensoModule.alternarOrdenacao(coluna);
    
    const colunas = ["leito", "rh", "nome", "enfermaria", "dieta", "volume", "horarios", "vezes", "via", "dispositivo", "espessante", "status"];
    colunas.forEach(c => {
      const el = document.getElementById(`sort-${c}`);
      if (el) {
        if (CensoModule.colunaOrdenacao === c) {
          el.innerText = CensoModule.direcaoOrdenacao === "asc" ? "▲" : "▼";
          el.className = "text-purple-600 font-black";
        } else {
          el.innerText = "↕";
          el.className = "text-slate-400";
        }
      }
    });

    this.renderizarCenso();
  },

  // 1. Renderiza Métricas do Cabeçalho
  renderizarMetricas() {
    const stats = CensoModule.getEstatisticas();
    document.getElementById("metric-total-pacientes").innerText = stats.total;
    document.getElementById("metric-ativos").innerText = stats.ativos;
    document.getElementById("metric-suspensos").innerText = stats.suspensos;
    document.getElementById("metric-volume-dia").innerText = `${(stats.volumeTotalDiario / 1000).toFixed(1)} L`;
  },

  // 2. Renderiza Planilhas Nominais da Aba PACIENTES (Autoclavada, Não Autoclavada, Dieta Especial e Todas as Planilhas)
  renderizarCenso() {
    const visao = (typeof PlanilhasCensoModule !== "undefined") ? PlanilhasCensoModule.visaoAtiva : "autoclavada";

    // 1. Atualiza estilos dos botões da barra superior de visualização do Censo
    const idsBotoes = ["autoclavada", "nao_autoclavada", "dieta_especial", "todas"];
    idsBotoes.forEach(id => {
      const btn = document.getElementById(`btn-censo-visao-${id}`);
      if (btn) {
        if (id === visao) {
          btn.className = "px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black shadow-xs border border-purple-500";
        } else {
          btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-purple-50/70 hover:bg-purple-100 text-purple-950 border border-purple-200/80 hover:border-purple-300";
        }
      }
    });

    const bannerContainer = document.getElementById("censo-banner-header");
    const planilhaContainer = document.getElementById("censo-planilha-view-container");
    if (!planilhaContainer || typeof PlanilhasCensoModule === "undefined") return;

    const termoBusca = (document.getElementById("censo-busca")?.value || "").trim().toLowerCase();
    let internados = CensoModule.getPacientesInternados();

    if (termoBusca) {
      internados = internados.filter(p => {
        return (p.nome || "").toLowerCase().includes(termoBusca) ||
               (p.leito || "").toLowerCase().includes(termoBusca) ||
               (p.rh || "").toLowerCase().includes(termoBusca) ||
               (p.dietaNome || "").toLowerCase().includes(termoBusca) ||
               (p.enfermariaNome || p.enfermaria || "").toLowerCase().includes(termoBusca) ||
               (p.espessanteObs || "").toLowerCase().includes(termoBusca);
      });
    }

    if (visao === "autoclavada") {
      const dados = PlanilhasCensoModule.processarPlanilha(PlanilhasCensoModule.SECOES_AUTOCLAVADA, internados);
      if (bannerContainer) {
        bannerContainer.innerHTML = PlanilhasCensoModule.gerarHtmlBanner(
          "RELAÇÃO DE FÓRMULAS AUTOCLAVADAS",
          "Autoclavada / Lactário",
          dados.totais,
          "#6b21a8"
        );
        planilhaContainer.innerHTML = PlanilhasCensoModule.gerarHtmlTabelasCorpo(dados.blocos, "#6b21a8");
      } else {
        planilhaContainer.innerHTML = PlanilhasCensoModule.gerarHtmlPlanilhaNominal(
          "RELAÇÃO DE FÓRMULAS AUTOCLAVADAS",
          "Autoclavada / Lactário",
          dados,
          "#6b21a8"
        );
      }
      return;
    }

    if (visao === "nao_autoclavada") {
      const dados = PlanilhasCensoModule.processarPlanilha(PlanilhasCensoModule.SECOES_NAO_AUTOCLAVADA, internados);
      if (bannerContainer) {
        bannerContainer.innerHTML = PlanilhasCensoModule.gerarHtmlBanner(
          "RELAÇÃO DE FÓRMULAS NÃO AUTOCLAVADAS",
          "Bancada Estéril / Enteral",
          dados.totais,
          "#86198f"
        );
        planilhaContainer.innerHTML = PlanilhasCensoModule.gerarHtmlTabelasCorpo(dados.blocos, "#86198f");
      } else {
        planilhaContainer.innerHTML = PlanilhasCensoModule.gerarHtmlPlanilhaNominal(
          "RELAÇÃO DE FÓRMULAS NÃO AUTOCLAVADAS",
          "Bancada Estéril / Enteral",
          dados,
          "#86198f"
        );
      }
      return;
    }

    if (visao === "dieta_especial") {
      const dados = PlanilhasCensoModule.processarDietaEspecial(internados);
      if (bannerContainer) {
        bannerContainer.innerHTML = PlanilhasCensoModule.gerarHtmlBanner(
          "RELAÇÃO DE DIETA ESPECIAL",
          "Alimentos e Fórmulas Personalizadas",
          dados.totais,
          "#a21caf"
        );
        planilhaContainer.innerHTML = PlanilhasCensoModule.gerarHtmlTabelasDietaEspecial(dados);
      } else {
        planilhaContainer.innerHTML = PlanilhasCensoModule.gerarHtmlDietaEspecial(dados);
      }
      if (typeof LoteEsteiraModule !== "undefined") {
        LoteEsteiraModule.sincronizarCheckboxesVisual();
        LoteEsteiraModule.atualizarBarraAcoesFlutuante();
      }
      return;
    }

    if (visao === "todas") {
      const dadosAuto = PlanilhasCensoModule.processarPlanilha(PlanilhasCensoModule.SECOES_AUTOCLAVADA, internados);
      const dadosNAuto = PlanilhasCensoModule.processarPlanilha(PlanilhasCensoModule.SECOES_NAO_AUTOCLAVADA, internados);
      const dadosEspecial = PlanilhasCensoModule.processarDietaEspecial(internados);

      const totaisGerais = {
        totalPacientes: internados.length,
        totalP1Vol: (dadosAuto.totais.totalP1Vol || 0) + (dadosNAuto.totais.totalP1Vol || 0),
        totalP2Vol: (dadosAuto.totais.totalP2Vol || 0) + (dadosNAuto.totais.totalP2Vol || 0),
        totalGeralVol: (dadosAuto.totais.totalGeralVol || 0) + (dadosNAuto.totais.totalGeralVol || 0) + (dadosEspecial.totais.totalVol || 0)
      };

      if (bannerContainer) {
        bannerContainer.innerHTML = PlanilhasCensoModule.gerarHtmlBanner(
          "RELAÇÃO GERAL DE TODAS AS PLANILHAS",
          "Consolidado de Fórmulas e Dietas Especiais",
          totaisGerais,
          "#4c1d95"
        );
        planilhaContainer.innerHTML = `
          <div class="space-y-6">
            <div>
              <div class="p-2 mb-2 rounded-lg bg-purple-900 text-white text-xs font-black uppercase tracking-wider sticky top-0 z-20 shadow-xs flex items-center gap-2">
                <span>🟣</span>
                <span>Fórmulas Autoclavadas</span>
              </div>
              ${PlanilhasCensoModule.gerarHtmlTabelasCorpo(dadosAuto.blocos, "#6b21a8")}
            </div>

            <div>
              <div class="p-2 mb-2 rounded-lg bg-fuchsia-900 text-white text-xs font-black uppercase tracking-wider sticky top-0 z-20 shadow-xs flex items-center gap-2">
                <span>🟣</span>
                <span>Fórmulas Não Autoclavadas</span>
              </div>
              ${PlanilhasCensoModule.gerarHtmlTabelasCorpo(dadosNAuto.blocos, "#86198f")}
            </div>

            <div>
              <div class="p-2 mb-2 rounded-lg bg-pink-900 text-white text-xs font-black uppercase tracking-wider sticky top-0 z-20 shadow-xs flex items-center gap-2">
                <span>🟡</span>
                <span>Dietas Especiais</span>
              </div>
              ${PlanilhasCensoModule.gerarHtmlTabelasDietaEspecial(dadosEspecial)}
            </div>
          </div>
        `;
      } else {
        planilhaContainer.innerHTML = `
          <div class="space-y-4">
            ${PlanilhasCensoModule.gerarHtmlPlanilhaNominal("RELAÇÃO DE FÓRMULAS AUTOCLAVADAS", "Autoclavada / Lactário", dadosAuto, "#6b21a8")}
            ${PlanilhasCensoModule.gerarHtmlPlanilhaNominal("RELAÇÃO DE FÓRMULAS NÃO AUTOCLAVADAS", "Bancada Estéril / Enteral", dadosNAuto, "#86198f")}
            ${PlanilhasCensoModule.gerarHtmlDietaEspecial(dadosEspecial)}
          </div>
        `;
      }
      if (typeof LoteEsteiraModule !== "undefined") {
        LoteEsteiraModule.sincronizarCheckboxesVisual();
        LoteEsteiraModule.atualizarBarraAcoesFlutuante();
      }
      return;
    }

    if (typeof LoteEsteiraModule !== "undefined") {
      LoteEsteiraModule.sincronizarCheckboxesVisual();
      LoteEsteiraModule.atualizarBarraAcoesFlutuante();
    }
  },

  // 2.1 Alternar visualização da aba PACIENTES (Planilhas Nominais Oficiais)
  setVisaoCenso(visao) {
    if (typeof PlanilhasCensoModule !== "undefined") {
      PlanilhasCensoModule.visaoAtiva = visao;
    }
    this.renderizarCenso();
  },

  // 2.2 Exportar Planilha de Censo Atual em CSV
  exportarPlanilhaCensoCSV() {
    const visao = (typeof PlanilhasCensoModule !== "undefined") ? PlanilhasCensoModule.visaoAtiva : "autoclavada";
    if (typeof PlanilhasCensoModule !== "undefined") {
      const lista = CensoModule.getPacientesInternados();
      PlanilhasCensoModule.exportarCSV(visao, lista);
    }
  },

  // 2.3 Imprimir Planilha de Censo Atual em Folha A4 Oficial
  imprimirPlanilhaCensoA4() {
    const visao = (typeof PlanilhasCensoModule !== "undefined") ? PlanilhasCensoModule.visaoAtiva : "autoclavada";
    if (typeof PlanilhasCensoModule !== "undefined") {
      const lista = CensoModule.getPacientesInternados();
      PlanilhasCensoModule.imprimirA4(visao, lista);
    }
  },

  // 3. Renderiza Painel de Produção e Bancada de Preparo
  renderizarBancada() {
    const ativos = CensoModule.getPacientesAtivos();
    const calculo = BancadaModule.calcularProducao(ativos, this.dietasCatalogo);
    const container = document.getElementById("bancada-cards-container");
    if (!container) return;

    const elPrep1 = document.getElementById("bancada-total-prep1");
    const elPrep2 = document.getElementById("bancada-total-prep2");
    const elLitros = document.getElementById("bancada-total-litros");
    const elPo = document.getElementById("bancada-total-po");
    const elFrascos = document.getElementById("bancada-total-frascos");

    if (elPrep1) elPrep1.innerText = `${(calculo.totais.volumePrep1GeralMl / 1000).toFixed(2)} L`;
    if (elPrep2) elPrep2.innerText = `${(calculo.totais.volumePrep2GeralMl / 1000).toFixed(2)} L`;
    if (elLitros) elLitros.innerText = `${(calculo.totais.volumeTotalGeralMl / 1000).toFixed(2)} L`;
    if (elPo) elPo.innerText = `${(calculo.totais.poTotalGeralG / 1000).toFixed(2)} kg`;
    if (elFrascos) elFrascos.innerText = `${calculo.totais.totalFrascosDia} un`;

    // Atualiza o estilo dos botões de visualização da produção
    const visao = BancadaModule.visaoAtiva || "bancada";
    const idsBotoes = ["bancada", "soma_autoclavada", "soma_nao_autoclavada", "soma_enteral", "todas_somas"];
    idsBotoes.forEach(id => {
      const btn = document.getElementById(`btn-visao-${id}`);
      if (btn) {
        if (id === visao) {
          btn.className = "px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-xs border border-purple-500";
        } else {
          btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-purple-50/70 hover:bg-purple-100 text-purple-950 border border-purple-200/80 hover:border-purple-300";
        }
      }
    });

    // 1. Visualizações das Planilhas de Soma Fiel ao Excel
    if (visao === "soma_autoclavada") {
      container.innerHTML = BancadaModule.gerarHtmlPlanilhaSoma(calculo.somas.autoclavada);
      return;
    }

    if (visao === "soma_nao_autoclavada") {
      container.innerHTML = BancadaModule.gerarHtmlPlanilhaSoma(calculo.somas.naoAutoclavada);
      return;
    }

    if (visao === "soma_enteral") {
      container.innerHTML = BancadaModule.gerarHtmlPlanilhaSoma(calculo.somas.enteral);
      return;
    }

    if (visao === "todas_somas") {
      container.innerHTML = `
        <div class="space-y-4">
          ${BancadaModule.gerarHtmlPlanilhaSoma(calculo.somas.autoclavada)}
          ${BancadaModule.gerarHtmlPlanilhaSoma(calculo.somas.naoAutoclavada)}
          ${BancadaModule.gerarHtmlPlanilhaSoma(calculo.somas.enteral)}
        </div>
      `;
      return;
    }

    // 2. Visualização Padrão: Mapa Geral de Bancada de Preparo
    if (calculo.resultados.length === 0) {
      container.innerHTML = `
        <div class="col-span-full bg-white p-12 text-center rounded-xl border border-slate-300 text-slate-600 font-bold">
          Nenhum paciente ativo com prescrição de dieta no momento.
        </div>
      `;
      return;
    }

    const categorias = [
      { id: "AUTOCLAVADA_P1", dados: BancadaModule.PARAMETROS_INSTITUCIONAIS.AUTOCLAVADA_P1, badgeClass: "card-bancada-p1" },
      { id: "AUTOCLAVADA_P2", dados: BancadaModule.PARAMETROS_INSTITUCIONAIS.AUTOCLAVADA_P2, badgeClass: "card-bancada-p2" },
      { id: "NAO_AUTOCLAVADA", dados: BancadaModule.PARAMETROS_INSTITUCIONAIS.NAO_AUTOCLAVADA, badgeClass: "card-bancada-nao-auto" },
      { id: "ESPECIAIS", dados: BancadaModule.PARAMETROS_INSTITUCIONAIS.ESPECIAIS, badgeClass: "card-bancada-especial" },
      { id: "JEJUM", dados: BancadaModule.PARAMETROS_INSTITUCIONAIS.JEJUM, badgeClass: "card-bancada-jejum" }
    ];

    container.innerHTML = categorias.map(cat => {
      const itens = calculo.resultados.filter(r => r.dieta.categoria === cat.id);
      if (itens.length === 0) return "";

      const volCat = itens.reduce((acc, i) => acc + i.volumeTotalMl, 0);
      const volP1Cat = itens.reduce((acc, i) => acc + i.volumePrep1Ml, 0);
      const volP2Cat = itens.reduce((acc, i) => acc + i.volumePrep2Ml, 0);
      const poCat = itens.reduce((acc, i) => acc + i.poTotalG, 0);
      const frascosCat = itens.reduce((acc, i) => acc + i.totalFrascos, 0);

      return `
        <div class="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden mb-4 card-bancada ${cat.badgeClass} w-full">
          
          <div class="p-3.5 bg-slate-100 border-b border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 class="text-sm font-bold text-slate-800">${cat.dados.titulo}</h3>
              <div class="text-[11px] text-slate-600 mt-0.5">
                <span class="text-blue-900 font-bold">Parâmetro:</span> ${cat.dados.temperatura} • ${cat.dados.tempoAutoclave} • ${cat.dados.pressao}
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-1.5 text-xs font-bold font-mono">
              <span class="bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">P1: ${(volP1Cat / 1000).toFixed(2)}L</span>
              <span class="bg-purple-50 text-purple-900 px-2 py-0.5 rounded border border-purple-200">P2: ${(volP2Cat / 1000).toFixed(2)}L</span>
              <span class="bg-white text-slate-900 px-2 py-0.5 rounded border border-slate-300 font-bold">Total: ${(volCat / 1000).toFixed(2)}L</span>
              <span class="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200">Pó: ${poCat.toFixed(1)}g</span>
              <span class="bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">${frascosCat} un</span>
            </div>
          </div>

          <div class="overflow-x-auto w-full">
            <table class="w-full text-left border-collapse min-w-full">
              <thead>
                <tr class="bg-slate-100 text-[10px] font-bold text-slate-700 uppercase border-b border-slate-300">
                  <th class="py-2.5 px-3">Fórmula Infantil / Dieta</th>
                  <th class="py-2.5 px-2 text-center">Diluição HSP</th>
                  <th class="py-2.5 px-2 text-center bg-blue-50 text-blue-900 border-x border-slate-300">Prep 1 (08h-18h)</th>
                  <th class="py-2.5 px-2 text-center bg-purple-50 text-purple-900 border-r border-slate-300">Prep 2 (20h-06h)</th>
                  <th class="py-2.5 px-2 text-center font-bold text-slate-900">Vol Total</th>
                  <th class="py-2.5 px-2 text-center bg-emerald-50 text-emerald-900 font-bold">Pó (g)</th>
                  <th class="py-2.5 px-2 text-center bg-blue-50 text-blue-900 font-bold">Água (ml)</th>
                  <th class="py-2.5 px-3">Leitos Atendidos</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 text-xs bg-white text-slate-700">
                ${itens.map(item => `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-2.5 px-3 font-bold text-slate-800 text-xs">
                      ${escapeHtml(item.dieta.nome)}
                    </td>
                    <td class="py-2.5 px-2 text-center font-semibold text-slate-600 font-mono text-[11px]">
                      ${item.dieta.g_po_100ml}g / ${item.dieta.ml_agua_100ml}ml
                    </td>
                    <td class="py-2.5 px-2 text-center font-bold font-mono text-blue-900 bg-blue-50/40 border-x border-slate-200">
                      ${item.volumePrep1Ml} ml
                    </td>
                    <td class="py-2.5 px-2 text-center font-bold font-mono text-purple-900 bg-purple-50/40 border-r border-slate-200">
                      ${item.volumePrep2Ml} ml
                    </td>
                    <td class="py-2.5 px-2 text-center font-bold font-mono text-slate-900">
                      ${item.volumeTotalMl} ml
                    </td>
                    <td class="py-2.5 px-2 text-center font-bold font-mono text-emerald-900 bg-emerald-50/40">
                      ${item.poTotalG.toFixed(1)} g
                    </td>
                    <td class="py-2.5 px-2 text-center font-bold font-mono text-blue-900 bg-blue-50/40">
                      ${item.aguaTotalMl.toFixed(0)} ml
                    </td>
                    <td class="py-2.5 px-3 text-xs">
                      <div class="flex flex-wrap gap-1">
                        ${item.pacientes.map(p => `<span class="inline-block px-1.5 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 text-[11px]">${escapeHtml(p.leito)}</span>`).join("")}
                      </div>
                    </td>
                  </tr>
                `).join("")}
            </table>
          </div>

        </div>
      `;
    }).join("");
  },

  // 3.1 Renderiza Censo Consolidado para SPDM
  renderizarSPDM() {
    if (typeof SpdmModule !== "undefined") {
      const pacientes = (typeof CensoModule !== "undefined" && typeof CensoModule.getPacientesAtivos === "function") 
        ? CensoModule.getPacientesAtivos() 
        : [];
      SpdmModule.renderizarAba(pacientes);
    }
  },

  // 4. Renderiza Central de Etiquetas Zebra
  renderizarEtiquetas() {
    this.atualizarStatusImpressoraZebra();
    const pacientesAtivos = CensoModule.getPacientesAtivos();
    const filtrados = EtiquetasModule.getPacientesFiltrados(pacientesAtivos, this.dietasCatalogo);

    const previewGrid = document.getElementById("etiquetas-preview-grid");
    if (previewGrid) {
      if (filtrados.length === 0) {
        previewGrid.innerHTML = `
          <div class="col-span-full bg-white p-8 text-center rounded-xl border border-slate-300 text-slate-600 font-bold">
            Nenhum paciente ativo correspondente aos filtros selecionados.
          </div>
        `;
      } else {
        previewGrid.innerHTML = filtrados.slice(0, 3).map(p => EtiquetasModule.gerarPreviewHTML(p)).join("");
      }
    }

    const tbody = document.getElementById("etiquetas-selecao-corpo");
    if (tbody) {
      if (filtrados.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" class="text-center py-10 text-slate-500 font-medium">
              Nenhuma etiqueta encontrada para os filtros aplicados.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = filtrados.map(p => {
          const horariosAtivos = CensoModule.obterHorariosAtivosPaciente(p);
          return `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-200">
              <td class="py-2 px-3 text-center">
                <input type="checkbox" value="${escapeHtml(p.id)}" class="checkbox-etiqueta rounded text-blue-600 h-4 w-4 cursor-pointer" onchange="App.atualizarSelecaoEtiquetas()" checked>
              </td>
              <td class="py-2 px-3 text-center">
                <span class="inline-block px-1.5 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 text-[11px]">
                  ${escapeHtml(p.leito)}
                </span>
              </td>
              <td class="py-2 px-3 text-center font-mono font-semibold text-slate-600 text-xs">
                ${escapeHtml(p.rh || "---")}
              </td>
              <td class="py-2 px-3 font-bold text-slate-800 text-xs">
                ${escapeHtml(p.nome)}
              </td>
              <td class="py-2 px-3 text-center text-xs font-semibold text-blue-900">
                ${escapeHtml(p.enfermariaNome || p.enfermaria)}
              </td>
              <td class="py-2 px-3 text-center text-xs font-semibold text-slate-700">
                ${escapeHtml(p.dietaNome)}
              </td>
              <td class="py-2 px-3 text-center font-mono font-bold text-xs text-slate-800">
                ${p.volumeMl} ml
              </td>
              <td class="py-2 px-3 text-center font-mono font-bold text-xs text-slate-700">
                ${horariosAtivos.length}x / dia
              </td>
              <td class="py-2 px-3 font-mono text-[11px] text-slate-600">
                ${horariosAtivos.slice(0, 4).join(" • ")}${horariosAtivos.length > 4 ? "..." : ""}
              </td>
              <td class="py-2 px-3 text-center">
                <button 
                  onclick="App.imprimirEtiquetaIndividual('${escapeHtml(p.id)}')"
                  class="px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1"
                >
                  <span>🏷️</span>
                  <span>Imprimir</span>
                </button>
              </td>
            </tr>
          `;
        }).join("");
      }
      this.atualizarContadorEtiquetas();
    }
  },

  // Impressão por Turno Específico (Manhã / Noite / Todos)
  imprimirPorTurno(turno = "TODOS") {
    const idsMarcados = Array.from(document.querySelectorAll(".checkbox-etiqueta:checked")).map(cb => cb.value);
    if (idsMarcados.length === 0) {
      this.mostrarToast("Selecione pelo menos um paciente para imprimir etiquetas.", "warning");
      return;
    }

    const multiplicador = document.getElementById("etiquetas-multiplicador-frascos")?.checked ?? true;
    EtiquetasModule.multiplicadorPorVezes = multiplicador;

    const pacientesParaImprimir = idsMarcados
      .map(id => CensoModule.obterPorId(id))
      .filter(p => p && !p.suspenso && !p.alta);

    EtiquetasModule.imprimirLote(pacientesParaImprimir, turno);
  },

  // Limpar Filtros da Aba de Etiquetas
  limparFiltrosEtiquetas() {
    const inputBusca = document.getElementById("etiquetas-busca");
    const selectEnf = document.getElementById("etiquetas-filtro-enfermaria");
    const selectCat = document.getElementById("etiquetas-filtro-categoria");
    const selectDisp = document.getElementById("etiquetas-filtro-dispositivo");
    const selectTurno = document.getElementById("etiquetas-filtro-turno");

    if (inputBusca) inputBusca.value = "";
    if (selectEnf) selectEnf.value = "TODAS";
    if (selectCat) selectCat.value = "TODAS";
    if (selectDisp) selectDisp.value = "TODOS";
    if (selectTurno) selectTurno.value = "TODOS";

    EtiquetasModule.filtroTexto = "";
    EtiquetasModule.filtroEnfermaria = "TODAS";
    EtiquetasModule.filtroCategoria = "TODAS";
    EtiquetasModule.filtroDispositivo = "TODOS";
    EtiquetasModule.filtroTurno = "TODOS";

    this.renderizarEtiquetas();
    this.mostrarToast("Filtros de etiquetas redefinidos!", "info");
  },

  // 5. Renderiza Relatório de Compras e Pedido Oficial
  renderizarCompras() {
    const ativos = CensoModule.getPacientesAtivos();
    if (typeof ComprasModule !== "undefined") {
      ComprasModule.renderizarAba(ativos, this.dietasCatalogo);
    }
  },

  // =========================================================================
  // GESTÃO DO(A) NUTRICIONISTA RESPONSÁVEL (CONFIGURAÇÕES e IMPRESSÃO A4)
  // =========================================================================

  carregarDadosNutricionista() {
    const salvo = localStorage.getItem("lactario_nutricionista_config");
    let dados = { nome: "", crn: "", setor: "", ramal: "" };
    if (salvo) {
      try {
        dados = JSON.parse(salvo);
      } catch (e) {
        dados = { nome: "", crn: "", setor: "", ramal: "" };
      }
    }

    const inputNome = document.getElementById("config-nutri-nome");
    const inputCrn = document.getElementById("config-nutri-crn");
    const inputSetor = document.getElementById("config-nutri-setor");
    const inputRamal = document.getElementById("config-nutri-ramal");
    const preview = document.getElementById("config-nutri-preview");

    if (inputNome) inputNome.value = dados.nome || "";
    if (inputCrn) inputCrn.value = dados.crn || "";
    if (inputSetor) inputSetor.value = dados.setor || "";
    if (inputRamal) inputRamal.value = dados.ramal || "";

    if (preview) {
      if (dados.nome) {
        preview.innerHTML = `<strong>${escapeHtml(dados.nome)}</strong> • ${escapeHtml(dados.crn || 'Sem CRN')}${dados.setor ? ` (${escapeHtml(dados.setor)})` : ''}`;
      } else {
        preview.innerText = "Nutricionista Responsável: Não configurado";
      }
    }
  },

  salvarDadosNutricionista() {
    const nome = document.getElementById("config-nutri-nome")?.value.trim() || "";
    const crn = document.getElementById("config-nutri-crn")?.value.trim() || "";
    const setor = document.getElementById("config-nutri-setor")?.value.trim() || "";
    const ramal = document.getElementById("config-nutri-ramal")?.value.trim() || "";

    if (!nome) {
      this.mostrarToast("Informe o Nome Completo do(a) Nutricionista Responsável.", "warning");
      return;
    }

    const antigo = this.obterDadosNutricionista();
    const dados = { nome, crn, setor, ramal, atualizadoEm: new Date().toISOString() };
    localStorage.setItem("lactario_nutricionista_config", JSON.stringify(dados));
    localStorage.setItem("lac_nutri_config", JSON.stringify(dados));

    if (typeof AuditLogModule !== "undefined") {
      const alteracoes = [];
      if (antigo.nome !== nome) alteracoes.push({ campo: "Nome do Nutricionista", de: antigo.nome || "(vazio)", para: nome });
      if (antigo.crn !== crn) alteracoes.push({ campo: "CRN", de: antigo.crn || "(vazio)", para: crn });
      if (antigo.setor !== setor) alteracoes.push({ campo: "Setor", de: antigo.setor || "(vazio)", para: setor });
      if (antigo.ramal !== ramal) alteracoes.push({ campo: "Ramal", de: antigo.ramal || "(vazio)", para: ramal });

      AuditLogModule.registrar(
        "NUTRICIONISTA",
        "EDICAO",
        `Dados do Nutricionista Responsável atualizados: ${nome}`,
        alteracoes,
        { responsavel: `${nome} (${crn || "CRN"})` }
      );
    }

    this.carregarDadosNutricionista();
    this.mostrarToast("Dados do(a) Nutricionista Responsável salvos com sucesso!", "success");
  },

  limparDadosNutricionista() {
    const antigo = this.obterDadosNutricionista();
    localStorage.removeItem("lactario_nutricionista_config");
    localStorage.removeItem("lac_nutri_config");

    if (typeof AuditLogModule !== "undefined" && antigo.nome) {
      AuditLogModule.registrar(
        "NUTRICIONISTA",
        "EXCLUSAO",
        `Dados do Nutricionista Responsável foram limpos: ${antigo.nome}`,
        [{ campo: "Nutricionista", de: antigo.nome, para: "(não configurado)" }],
        {}
      );
    }

    this.carregarDadosNutricionista();
    this.mostrarToast("Dados do Nutricionista removidos.", "info");
  },

  obterDadosNutricionista() {
    const salvo = localStorage.getItem("lactario_nutricionista_config") || localStorage.getItem("lac_nutri_config");
    if (salvo) {
      try {
        return JSON.parse(salvo);
      } catch (e) {
        return { nome: "", crn: "", setor: "", ramal: "" };
      }
    }
    return { nome: "", crn: "", setor: "", ramal: "" };
  },

  // =========================================================================
  // GESTÃO DOS CATÁLOGOS E LISTAS MESTRES (CONFIGURAÇÕES)
  // =========================================================================

  // 6. Renderiza Configurações e Catálogo
  renderizarConfiguracoes() {
    const inputUrl = document.getElementById("config-api-url");
    if (inputUrl) {
      inputUrl.value = ApiService.getApiUrl();
    }

    this.carregarDadosNutricionista();
    this.alternarSubAbaConfig(this.subAbaConfigAtiva || "enfermarias");
  },

  // Alterna entre as 8 sub-abas de catálogos, auditoria e integração
  alternarSubAbaConfig(abaId) {
    this.subAbaConfigAtiva = abaId;

    const abas = ["enfermarias", "formulas", "intervalos", "vias", "dispositivos", "versoes", "auditoria", "sheets"];
    abas.forEach(id => {
      const btn = document.getElementById(`subtab-btn-${id}`);
      const painel = document.getElementById(`config-painel-${id}`);

      if (id === abaId) {
        if (btn) {
          btn.className = "px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-xs border border-purple-500 flex items-center gap-1.5";
        }
        if (painel) painel.classList.remove("hidden");
      } else {
        if (btn) {
          btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-purple-50/70 hover:bg-purple-100 text-purple-950 border border-purple-200/80 hover:border-purple-300 flex items-center gap-1.5";
        }
        if (painel) painel.classList.add("hidden");
      }
    });

    if (abaId === "enfermarias") this.filtrarEnfermarias();
    else if (abaId === "formulas") this.filtrarCatalogo();
    else if (abaId === "intervalos") this.filtrarIntervalos();
    else if (abaId === "vias") this.filtrarVias();
    else if (abaId === "dispositivos") this.filtrarDispositivos();
    else if (abaId === "versoes") this.renderizarVersoes();
    else if (abaId === "auditoria") this.renderizarAuditoria();
    else if (abaId === "sheets") {
      const inputUrl = document.getElementById("config-api-url");
      if (inputUrl) inputUrl.value = ApiService.getApiUrl();
    }
  },

  // -------------------------------------------------------------------------
  // 1. ENFERMARIAS e UNIDADES
  // -------------------------------------------------------------------------

  filtrarEnfermarias() {
    const termo = (document.getElementById("config-busca-enfermaria")?.value || "").toLowerCase().trim();
    let lista = this.enfermariasCatalogo;

    if (termo) {
      lista = lista.filter(e => 
        (e.nome && e.nome.toLowerCase().includes(termo)) ||
        (e.sigla && e.sigla.toLowerCase().includes(termo)) ||
        (e.andar && e.andar.toLowerCase().includes(termo)) ||
        (e.faixa && e.faixa.toLowerCase().includes(termo)) ||
        (e.id && e.id.toLowerCase().includes(termo))
      );
    }

    this.renderizarTabelaEnfermarias(lista);
  },

  renderizarTabelaEnfermarias(lista) {
    const tbody = document.getElementById("tabela-config-enfermarias-corpo");
    const contador = document.getElementById("config-contador-enfermarias");
    if (contador) {
      contador.innerText = `${lista.length} unidades ${lista.length !== this.enfermariasCatalogo.length ? 'filtradas' : 'ativas'}`;
    }

    if (!tbody) return;

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-6 text-center text-slate-400 font-medium text-xs">
            Nenhuma enfermaria encontrada com o filtro informado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = lista.map(e => {
      const qtdLeitos = Array.isArray(e.leitos) ? e.leitos.length : (e.faixa ? "Faixa ativa" : "-");
      const faixaStr = e.faixa || (Array.isArray(e.leitos) && e.leitos.length > 0 ? `${e.leitos[0]} a ${e.leitos[e.leitos.length - 1]}` : "-");

      return `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-200">
          <td class="py-2.5 px-3">
            <span class="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs bg-sky-50 text-sky-900 border border-sky-200">
              ${escapeHtml(e.sigla || e.id)}
            </span>
          </td>
          <td class="py-2.5 px-3 font-bold text-slate-950">
            ${escapeHtml(e.nome)}
          </td>
          <td class="py-2.5 px-3 text-slate-700 text-xs font-medium">
            ${escapeHtml(e.andar || "Setor Hospitalar")}
          </td>
          <td class="py-2.5 px-3 font-mono text-xs text-slate-800">
            ${escapeHtml(faixaStr)}
          </td>
          <td class="py-2.5 px-2.5 text-center font-mono font-bold text-slate-900">
            ${qtdLeitos}
          </td>
          <td class="py-2.5 px-3 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-1">
              <button 
                onclick="App.abrirModalEnfermaria('${e.id}')"
                class="p-1.5 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                title="Editar esta enfermaria"
              >
                ✏️
              </button>
              <button 
                onclick="App.excluirEnfermaria('${e.id}')"
                class="p-1.5 rounded-lg text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Remover enfermaria"
              >
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  aoMudarFaixaLeitosModalEnf() {
    const ini = document.getElementById("modal-enf-leito-inicial")?.value.trim().toUpperCase() || "";
    const fim = document.getElementById("modal-enf-leito-final")?.value.trim().toUpperCase() || "";
    const inputFaixa = document.getElementById("modal-enf-leitos");
    if (inputFaixa && ini && fim) {
      inputFaixa.value = `${ini} a ${fim}`;
    }
  },

  abrirModalEnfermaria(id) {
    const modal = document.getElementById("modal-config-enfermaria");
    const titulo = document.getElementById("modal-enfermaria-titulo");
    if (!modal) return;

    if (id) {
      const enf = this.enfermariasCatalogo.find(e => e.id === id);
      if (!enf) return;

      if (titulo) titulo.innerHTML = `<span>🏥</span> <span>Editar Enfermaria: ${escapeHtml(enf.nome)}</span>`;
      document.getElementById("modal-enf-id").value = enf.id;
      document.getElementById("modal-enf-nome").value = enf.nome || "";
      document.getElementById("modal-enf-sigla").value = enf.sigla || "";
      document.getElementById("modal-enf-andar").value = enf.andar || "";
      
      let ini = enf.leitoInicial || "";
      let fim = enf.leitoFinal || "";
      if ((!ini || !fim) && enf.faixa && enf.faixa.includes(" a ")) {
        const parts = enf.faixa.split(/ a /i);
        ini = parts[0].trim();
        fim = parts[1].trim();
      }

      document.getElementById("modal-enf-leito-inicial").value = ini;
      document.getElementById("modal-enf-leito-final").value = fim;
      document.getElementById("modal-enf-leitos").value = enf.faixa || (ini && fim ? `${ini} a ${fim}` : (Array.isArray(enf.leitos) ? enf.leitos.join(", ") : ""));
    } else {
      if (titulo) titulo.innerHTML = `<span>➕</span> <span>Nova Enfermaria</span>`;
      document.getElementById("modal-enf-id").value = "";
      document.getElementById("modal-enf-nome").value = "";
      document.getElementById("modal-enf-sigla").value = "";
      document.getElementById("modal-enf-andar").value = "";
      document.getElementById("modal-enf-leito-inicial").value = "";
      document.getElementById("modal-enf-leito-final").value = "";
      document.getElementById("modal-enf-leitos").value = "";
    }

    modal.classList.remove("hidden");
  },

  fecharModalEnfermaria() {
    const modal = document.getElementById("modal-config-enfermaria");
    if (modal) modal.classList.add("hidden");
  },

  salvarModalEnfermaria(event) {
    event.preventDefault();

    const id = document.getElementById("modal-enf-id").value;
    const nome = document.getElementById("modal-enf-nome").value.trim().toUpperCase();
    const sigla = document.getElementById("modal-enf-sigla").value.trim().toUpperCase();
    const andar = document.getElementById("modal-enf-andar").value.trim();
    const leitoInicial = document.getElementById("modal-enf-leito-inicial")?.value.trim().toUpperCase() || "";
    const leitoFinal = document.getElementById("modal-enf-leito-final")?.value.trim().toUpperCase() || "";
    let leitosInput = document.getElementById("modal-enf-leitos").value.trim();

    if (!nome || !sigla) {
      this.mostrarToast("Informe o Nome e a Sigla da Enfermaria.", "warning");
      return;
    }

    if (!leitosInput && leitoInicial && leitoFinal) {
      leitosInput = `${leitoInicial} a ${leitoFinal}`;
    }

    // Processa leitos
    let leitosArray = [];
    if (leitoInicial && leitoFinal && typeof window.gerarLeitosDaFaixa === "function") {
      leitosArray = window.gerarLeitosDaFaixa(leitoInicial, leitoFinal);
    } else if (leitosInput.includes(" a ") || leitosInput.includes(" A ")) {
      const parts = leitosInput.split(/ a /i);
      const start = parts[0].trim();
      const end = parts[1].trim();
      if (typeof window.gerarLeitosDaFaixa === "function") {
        leitosArray = window.gerarLeitosDaFaixa(start, end);
      } else {
        leitosArray = [start, end];
      }
    } else if (leitosInput.includes(",")) {
      leitosArray = leitosInput.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
    } else if (leitosInput) {
      leitosArray = [leitosInput.toUpperCase()];
    }

    const faixaFinal = (leitoInicial && leitoFinal) ? `${leitoInicial} a ${leitoFinal}` : (leitosInput || "-");

    // 1. Gera Ponto de Restauração Automático antes da modificação
    if (typeof VersionamentoModule !== "undefined") {
      VersionamentoModule.criarSnapshot(
        "AUTOMATICO", 
        id ? `Alteração nos dados da enfermaria "${nome}" (${sigla})` : `Cadastro de nova enfermaria "${nome}" (${sigla})`
      );
    }

    let alteracoes = [];
    if (id) {
      const idx = this.enfermariasCatalogo.findIndex(e => e.id === id);
      if (idx !== -1) {
        const antigo = this.enfermariasCatalogo[idx];
        if (antigo.nome !== nome) alteracoes.push({ campo: "Nome", de: antigo.nome, para: nome });
        if (antigo.sigla !== sigla) alteracoes.push({ campo: "Sigla", de: antigo.sigla, para: sigla });
        if (antigo.andar !== andar) alteracoes.push({ campo: "Andar / Bloco", de: antigo.andar || "-", para: andar || "-" });
        if (antigo.faixa !== faixaFinal) alteracoes.push({ campo: "Faixa de Leitos", de: antigo.faixa || "-", para: faixaFinal });

        this.enfermariasCatalogo[idx] = {
          ...this.enfermariasCatalogo[idx],
          nome,
          sigla,
          andar,
          leitoInicial: leitoInicial || this.enfermariasCatalogo[idx].leitoInicial,
          leitoFinal: leitoFinal || this.enfermariasCatalogo[idx].leitoFinal,
          faixa: faixaFinal,
          leitos: leitosArray.length > 0 ? leitosArray : this.enfermariasCatalogo[idx].leitos
        };
      }
    } else {
      const novoId = "ENF_" + sigla.replace(/[^A-Z0-9]/g, "_") + "_" + Date.now().toString().slice(-4);
      alteracoes = [
        { campo: "Nome", de: "-", para: nome },
        { campo: "Sigla", de: "-", para: sigla },
        { campo: "Localização", de: "-", para: andar || "-" },
        { campo: "Faixa de Leitos", de: "-", para: faixaFinal }
      ];

      this.enfermariasCatalogo.push({
        id: novoId,
        nome,
        sigla,
        andar,
        leitoInicial,
        leitoFinal,
        faixa: faixaFinal,
        leitos: leitosArray
      });
    }

    localStorage.setItem("lactario_config_enfermarias", JSON.stringify(this.enfermariasCatalogo));
    localStorage.setItem("lac_custom_enfermarias", JSON.stringify(this.enfermariasCatalogo));

    // 2. Registra no Log de Auditoria
    if (typeof AuditLogModule !== "undefined") {
      AuditLogModule.registrar(
        "CATALOGO_ENFERMARIAS",
        id ? "EDICAO" : "CRIACAO",
        id ? `Enfermaria "${nome}" (${sigla}) atualizada` : `Nova enfermaria "${nome}" (${sigla}) cadastrada`,
        alteracoes,
        { enfermariaId: id, nome, sigla }
      );
    }

    this.fecharModalEnfermaria();
    this.filtrarEnfermarias();
    this.popularSelects();
    this.atualizarDatalistsAutocompletar();
    this.mostrarToast(`Enfermaria "${nome}" salva com sucesso!`, "success");
  },

  excluirEnfermaria(id) {
    const enf = this.enfermariasCatalogo.find(e => e.id === id);
    if (!enf) return;

    if (confirm(`Deseja remover a enfermaria "${enf.nome}" (${enf.sigla}) do sistema?`)) {
      if (typeof VersionamentoModule !== "undefined") {
        VersionamentoModule.criarSnapshot("AUTOMATICO", `Exclusão da enfermaria "${enf.nome}" (${enf.sigla})`);
      }

      this.enfermariasCatalogo = this.enfermariasCatalogo.filter(e => e.id !== id);
      localStorage.setItem("lactario_config_enfermarias", JSON.stringify(this.enfermariasCatalogo));
      localStorage.setItem("lac_custom_enfermarias", JSON.stringify(this.enfermariasCatalogo));

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "CATALOGO_ENFERMARIAS",
          "EXCLUSAO",
          `Enfermaria "${enf.nome}" (${enf.sigla}) removida`,
          [{ campo: "Status", de: "Ativa", para: "Excluída" }],
          { enfermariaId: id, nome: enf.nome, sigla: enf.sigla }
        );
      }

      this.filtrarEnfermarias();
      this.popularSelects();
      this.atualizarDatalistsAutocompletar();
      this.mostrarToast(`Enfermaria "${enf.nome}" removida.`, "warning");
    }
  },

  restaurarEnfermariasPadrao() {
    if (confirm("Deseja restaurar as 47 Enfermarias e Unidades para o padrão oficial da planilha 'Config'?")) {
      if (typeof VersionamentoModule !== "undefined") {
        VersionamentoModule.criarSnapshot("AUTOMATICO", "Backup de segurança antes de restaurar as 47 enfermarias padrão");
      }

      const padrao = (typeof ENFERMARIAS_SPDM !== "undefined" && ENFERMARIAS_SPDM.length > 0)
        ? ENFERMARIAS_SPDM
        : ENFERMARIAS_HSP;
      this.enfermariasCatalogo = JSON.parse(JSON.stringify(padrao));
      localStorage.setItem("lactario_config_enfermarias", JSON.stringify(this.enfermariasCatalogo));
      localStorage.setItem("lac_custom_enfermarias", JSON.stringify(this.enfermariasCatalogo));

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "CATALOGO_ENFERMARIAS",
          "RESTAURACAO",
          "Lista de enfermarias restaurada para o padrão oficial HSP (47 unidades)",
          [{ campo: "Total de Unidades", de: "Customizado", para: "47 unidades padrão" }],
          {}
        );
      }

      this.filtrarEnfermarias();
      this.popularSelects();
      this.atualizarDatalistsAutocompletar();
      this.mostrarToast("Todas as 47 enfermarias restauradas com sucesso!", "success");
    }
  },

  // -------------------------------------------------------------------------
  // 2. DIETAS e FÓRMULAS PRESCRITAS (CONCENTRAÇÕES E MEDIDAS)
  // -------------------------------------------------------------------------

  filtrarCatalogo() {
    const termo = (document.getElementById("config-busca-formula")?.value || "").toLowerCase().trim();
    const categoria = document.getElementById("config-filtro-categoria-formula")?.value || "TODAS";

    let lista = this.dietasCatalogo;

    if (categoria !== "TODAS") {
      lista = lista.filter(d => d.categoria === categoria);
    }

    if (termo) {
      lista = lista.filter(d => 
        (d.nome && d.nome.toLowerCase().includes(termo)) ||
        (d.produtoExcel && d.produtoExcel.toLowerCase().includes(termo)) ||
        (d.categoriaNome && d.categoriaNome.toLowerCase().includes(termo)) ||
        (d.densidade_padrao && d.densidade_padrao.toLowerCase().includes(termo)) ||
        (d.porcentagem && d.porcentagem.toLowerCase().includes(termo))
      );
    }

    this.renderizarTabelaConcentracoes(lista);
  },

  renderizarTabelaConcentracoes(lista) {
    const tbody = document.getElementById("tabela-config-dietas-corpo");
    const contador = document.getElementById("config-contador-formulas");
    if (contador) {
      contador.innerText = `${lista.length} fórmulas ${lista.length !== this.dietasCatalogo.length ? 'filtradas' : 'ativas'}`;
    }

    if (!tbody) return;

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="py-6 text-center text-slate-400 font-medium text-xs">
            Nenhuma fórmula encontrada com os filtros selecionados.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = lista.map(d => {
      let badgeCat = "bg-slate-100 text-slate-700 border-slate-300";
      if (d.categoria === "AUTOCLAVADA_P1") badgeCat = "bg-blue-50 text-blue-900 border-blue-200";
      else if (d.categoria === "AUTOCLAVADA_P2") badgeCat = "bg-indigo-50 text-indigo-900 border-indigo-200";
      else if (d.categoria === "NAO_AUTOCLAVADA") badgeCat = "bg-purple-50 text-purple-900 border-purple-200";
      else if (d.categoria === "ESPECIAIS") badgeCat = "bg-amber-50 text-amber-900 border-amber-200";
      else if (d.categoria === "JEJUM") badgeCat = "bg-cyan-50 text-cyan-900 border-cyan-200";

      const pct = d.porcentagem || (d.g_po_100ml ? `${d.g_po_100ml}%` : "-");
      const colher = d.colher_medida_g ? `${d.colher_medida_g} g` : "-";

      return `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-200">
          <td class="py-2.5 px-3">
            <div class="font-black text-slate-950">${escapeHtml(d.nome)}</div>
            ${d.produtoExcel && d.produtoExcel !== d.nome ? `<div class="text-[10px] text-slate-500 font-mono">Ref Excel: ${escapeHtml(d.produtoExcel)}</div>` : ''}
          </td>
          <td class="py-2.5 px-2.5 text-center">
            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badgeCat}">
              ${escapeHtml(d.categoriaNome || d.categoria)}
            </span>
          </td>
          <td class="py-2.5 px-2.5 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
            ${escapeHtml(pct)}
          </td>
          <td class="py-2.5 px-2.5 text-center font-mono font-black text-emerald-950 bg-emerald-50/40">
            ${d.g_po_100ml !== undefined ? `${d.g_po_100ml} g` : "-"}
          </td>
          <td class="py-2.5 px-2.5 text-center font-mono font-black text-sky-950 bg-sky-50/40">
            ${d.ml_agua_100ml !== undefined ? `${d.ml_agua_100ml} ml` : "-"}
          </td>
          <td class="py-2.5 px-2.5 text-center font-mono font-bold text-slate-700">
            ${escapeHtml(colher)}
          </td>
          <td class="py-2.5 px-2.5 text-center font-mono text-slate-800">
            ${d.peso_lata_g ? `${d.peso_lata_g} g` : "-"}
          </td>
          <td class="py-2.5 px-3 text-xs text-slate-700">
            <div class="font-medium">${escapeHtml(d.temperatura_preparo || "Bancada estéril")}</div>
            ${d.instrucoes ? `<div class="text-[10px] text-slate-500 line-clamp-1" title="${escapeHtml(d.instrucoes)}">${escapeHtml(d.instrucoes)}</div>` : ''}
          </td>
          <td class="py-2.5 px-3 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-1">
              <button 
                onclick="App.abrirModalFormula('${d.id}')"
                class="p-1.5 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                title="Editar parâmetros desta fórmula"
              >
                ✏️
              </button>
              <button 
                onclick="App.excluirFormulaCatalogo('${d.id}')"
                class="p-1.5 rounded-lg text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Remover fórmula do catálogo"
              >
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  abrirModalFormula(formulaId) {
    const modal = document.getElementById("modal-formula");
    const titulo = document.getElementById("modal-formula-titulo");
    if (!modal) return;

    if (formulaId) {
      const formula = this.dietasCatalogo.find(d => d.id === formulaId);
      if (!formula) return;

      if (titulo) titulo.innerHTML = `<span>⚖️</span> <span>Editar Parâmetros: ${escapeHtml(formula.nome)}</span>`;
      document.getElementById("modal-formula-id").value = formula.id;
      document.getElementById("modal-formula-nome").value = formula.nome || "";
      document.getElementById("modal-formula-categoria").value = formula.categoria || "AUTOCLAVADA_P1";
      document.getElementById("modal-formula-porcentagem").value = formula.porcentagem || "";
      document.getElementById("modal-formula-po").value = formula.g_po_100ml !== undefined ? formula.g_po_100ml : "";
      document.getElementById("modal-formula-agua").value = formula.ml_agua_100ml !== undefined ? formula.ml_agua_100ml : 90;
      document.getElementById("modal-formula-colher").value = formula.colher_medida_g || "";
      document.getElementById("modal-formula-lata").value = formula.peso_lata_g || 400;
      document.getElementById("modal-formula-preparo").value = formula.temperatura_preparo || "";
      document.getElementById("modal-formula-instrucoes").value = formula.instrucoes || "";
    } else {
      if (titulo) titulo.innerHTML = `<span>➕</span> <span>Nova Fórmula / Diluição de Bancada</span>`;
      document.getElementById("modal-formula-id").value = "";
      document.getElementById("modal-formula-nome").value = "";
      document.getElementById("modal-formula-categoria").value = "AUTOCLAVADA_P1";
      document.getElementById("modal-formula-porcentagem").value = "";
      document.getElementById("modal-formula-po").value = "";
      document.getElementById("modal-formula-agua").value = 90.0;
      document.getElementById("modal-formula-colher").value = "";
      document.getElementById("modal-formula-lata").value = 400;
      document.getElementById("modal-formula-preparo").value = "Autoclave a quente";
      document.getElementById("modal-formula-instrucoes").value = "";
    }

    modal.classList.remove("hidden");
  },

  fecharModalFormula() {
    const modal = document.getElementById("modal-formula");
    if (modal) modal.classList.add("hidden");
  },

  async salvarFormulaModal(event) {
    event.preventDefault();

    const id = document.getElementById("modal-formula-id").value;
    const nome = document.getElementById("modal-formula-nome").value.trim();
    const categoria = document.getElementById("modal-formula-categoria").value;
    const porcentagem = document.getElementById("modal-formula-porcentagem").value.trim();
    const g_po_100ml = parseFloat(document.getElementById("modal-formula-po").value) || 0;
    const ml_agua_100ml = parseFloat(document.getElementById("modal-formula-agua").value) || 0;
    const colherVal = document.getElementById("modal-formula-colher").value;
    const colher_medida_g = colherVal ? parseFloat(colherVal) : null;
    const peso_lata_g = parseInt(document.getElementById("modal-formula-lata").value, 10) || 400;
    const temperatura_preparo = document.getElementById("modal-formula-preparo").value.trim();
    const instrucoes = document.getElementById("modal-formula-instrucoes").value.trim();

    if (!nome) {
      this.mostrarToast("Informe o nome da fórmula.", "warning");
      return;
    }

    const mapaCategorias = {
      "AUTOCLAVADA_P1": "Autoclavadas - Preparo 1",
      "AUTOCLAVADA_P2": "Autoclavadas - Preparo 2",
      "NAO_AUTOCLAVADA": "Não Autoclavadas",
      "ESPECIAIS": "Dieta Especial",
      "JEJUM": "Abreviação de Jejum"
    };

    // 1. Gera Snapshot Automático de Segurança
    if (typeof VersionamentoModule !== "undefined") {
      VersionamentoModule.criarSnapshot(
        "AUTOMATICO", 
        id ? `Alteração dos parâmetros da fórmula "${nome}"` : `Cadastro de nova fórmula "${nome}"`
      );
    }

    let alteracoes = [];
    if (id) {
      const index = this.dietasCatalogo.findIndex(d => d.id === id);
      if (index !== -1) {
        const antigo = this.dietasCatalogo[index];
        if (antigo.nome !== nome) alteracoes.push({ campo: "Nome da Fórmula", de: antigo.nome, para: nome });
        if (antigo.categoria !== categoria) alteracoes.push({ campo: "Categoria", de: antigo.categoriaNome || antigo.categoria, para: mapaCategorias[categoria] || categoria });
        if (antigo.g_po_100ml !== g_po_100ml) alteracoes.push({ campo: "Pó (g) / 100ml", de: `${antigo.g_po_100ml} g`, para: `${g_po_100ml} g` });
        if (antigo.ml_agua_100ml !== ml_agua_100ml) alteracoes.push({ campo: "Água (ml) / 100ml", de: `${antigo.ml_agua_100ml} ml`, para: `${ml_agua_100ml} ml` });
        if (antigo.colher_medida_g !== colher_medida_g) alteracoes.push({ campo: "Colher Medida (g)", de: `${antigo.colher_medida_g || '-'} g`, para: `${colher_medida_g || '-'} g` });
        if (antigo.peso_lata_g !== peso_lata_g) alteracoes.push({ campo: "Lata (g)", de: `${antigo.peso_lata_g || '-'} g`, para: `${peso_lata_g} g` });

        this.dietasCatalogo[index] = {
          ...this.dietasCatalogo[index],
          nome,
          categoria,
          categoriaNome: mapaCategorias[categoria] || categoria,
          porcentagem: porcentagem || `${g_po_100ml}%`,
          g_po_100ml,
          ml_agua_100ml,
          colher_medida_g,
          peso_lata_g,
          temperatura_preparo,
          instrucoes
        };
      }
    } else {
      const novoId = "formula_" + Date.now();
      alteracoes = [
        { campo: "Nome da Fórmula", de: "-", para: nome },
        { campo: "Categoria", de: "-", para: mapaCategorias[categoria] || categoria },
        { campo: "Pó (g) / 100ml", de: "-", para: `${g_po_100ml} g` },
        { campo: "Água (ml) / 100ml", de: "-", para: `${ml_agua_100ml} ml` },
        { campo: "Colher Medida (g)", de: "-", para: colher_medida_g ? `${colher_medida_g} g` : "-" },
        { campo: "Lata (g)", de: "-", para: `${peso_lata_g} g` }
      ];

      this.dietasCatalogo.push({
        id: novoId,
        nome,
        produtoExcel: nome,
        categoria,
        categoriaNome: mapaCategorias[categoria] || categoria,
        porcentagem: porcentagem || `${g_po_100ml}%`,
        g_po_100ml,
        ml_agua_100ml,
        colher_medida_g,
        peso_lata_g,
        temperatura_preparo,
        instrucoes
      });
    }

    await ApiService.saveDietas(this.dietasCatalogo);
    localStorage.setItem("lac_custom_dietas_v2", JSON.stringify(this.dietasCatalogo));

    // 2. Registra no Log de Auditoria
    if (typeof AuditLogModule !== "undefined") {
      AuditLogModule.registrar(
        "CATALOGO_FORMULAS",
        id ? "EDICAO" : "CRIACAO",
        id ? `Fórmula "${nome}" atualizada no catálogo` : `Nova fórmula "${nome}" cadastrada`,
        alteracoes,
        { formulaId: id, nome }
      );
    }

    this.fecharModalFormula();
    this.filtrarCatalogo();
    this.popularSelects();
    this.mostrarToast(`Fórmula "${nome}" salva com sucesso!`, "success");
  },

  async excluirFormulaCatalogo(id) {
    const formula = this.dietasCatalogo.find(d => d.id === id);
    if (!formula) return;

    if (confirm(`Tem certeza que deseja remover a fórmula "${formula.nome}" do catálogo?`)) {
      if (typeof VersionamentoModule !== "undefined") {
        VersionamentoModule.criarSnapshot("AUTOMATICO", `Exclusão da fórmula "${formula.nome}" do catálogo`);
      }

      this.dietasCatalogo = this.dietasCatalogo.filter(d => d.id !== id);
      await ApiService.saveDietas(this.dietasCatalogo);
      localStorage.setItem("lac_custom_dietas_v2", JSON.stringify(this.dietasCatalogo));

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "CATALOGO_FORMULAS",
          "EXCLUSAO",
          `Fórmula "${formula.nome}" removida do catálogo`,
          [{ campo: "Status", de: "Ativa", para: "Removida" }],
          { formulaId: id, nome: formula.nome }
        );
      }

      this.filtrarCatalogo();
      this.popularSelects();
      this.mostrarToast(`Fórmula "${formula.nome}" removida do catálogo.`, "warning");
    }
  },

  async restaurarCatalogoPadrao() {
    if (confirm("Deseja restaurar a tabela oficial de Concentrações e Medidas do Hospital São Paulo? Todas as edições manuais serão redefinidas para o padrão oficial.")) {
      if (typeof VersionamentoModule !== "undefined") {
        VersionamentoModule.criarSnapshot("AUTOMATICO", "Backup automático antes de restaurar o catálogo de fórmulas oficial (Excel)");
      }

      this.dietasCatalogo = JSON.parse(JSON.stringify(DIETAS_PADRAO));
      await ApiService.saveDietas(this.dietasCatalogo);
      localStorage.setItem("lac_custom_dietas_v2", JSON.stringify(this.dietasCatalogo));

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "CATALOGO_FORMULAS",
          "RESTAURACAO",
          "Catálogo de fórmulas restaurado para o padrão oficial de fábrica (Excel HSP)",
          [{ campo: "Total de Fórmulas", de: "Customizado", para: `${DIETAS_PADRAO.length} fórmulas oficiais` }],
          {}
        );
      }

      this.filtrarCatalogo();
      this.popularSelects();
      this.mostrarToast("Tabela de Concentrações e Medidas restaurada com sucesso!", "success");
    }
  },

  // -------------------------------------------------------------------------
  // 3. INTERVALOS ENTRE DIETAS
  // -------------------------------------------------------------------------

  filtrarIntervalos() {
    const termo = (document.getElementById("config-busca-intervalo")?.value || "").toLowerCase().trim();
    let lista = this.intervalosCatalogo;

    if (termo) {
      lista = lista.filter(i => 
        (i.label && i.label.toLowerCase().includes(termo)) ||
        (i.horas && String(i.horas).includes(termo)) ||
        (i.refeicoes && String(i.refeicoes).includes(termo))
      );
    }

    this.renderizarTabelaIntervalos(lista);
  },

  renderizarTabelaIntervalos(lista) {
    const tbody = document.getElementById("tabela-config-intervalos-corpo");
    const contador = document.getElementById("config-contador-intervalos");
    if (contador) {
      contador.innerText = `${lista.length} intervalos ${lista.length !== this.intervalosCatalogo.length ? 'filtrados' : 'ativos'}`;
    }

    if (!tbody) return;

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-6 text-center text-slate-400 font-medium text-xs">
            Nenhum intervalo encontrado com o filtro informado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = lista.map(item => {
      // Gera exemplo de horários
      let exHorarios = [];
      const horasInt = parseInt(item.horas, 10) || 3;
      let h = 6;
      for (let i = 0; i < (item.refeicoes || 8); i++) {
        exHorarios.push(String(h % 24).padStart(2, "0") + ":00");
        h += horasInt;
      }
      const exStr = exHorarios.slice(0, 6).join(", ") + (exHorarios.length > 6 ? "..." : "");

      return `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-200">
          <td class="py-2.5 px-3 text-center">
            <span class="inline-block px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-indigo-50 text-indigo-900 border border-indigo-200">
              ${item.horas} em ${item.horas} horas
            </span>
          </td>
          <td class="py-2.5 px-3 font-bold text-slate-950">
            ${escapeHtml(item.label)}
          </td>
          <td class="py-2.5 px-3 text-center font-mono font-black text-slate-900">
            ${item.refeicoes || Math.floor(24 / item.horas)}x / dia
          </td>
          <td class="py-2.5 px-3 font-mono text-xs text-slate-600">
            ${escapeHtml(exStr)}
          </td>
          <td class="py-2.5 px-3 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-1">
              <button 
                onclick="App.abrirModalIntervalo('${item.id || item.horas}')"
                class="p-1.5 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                title="Editar este intervalo"
              >
                ✏️
              </button>
              <button 
                onclick="App.excluirIntervalo('${item.id || item.horas}')"
                class="p-1.5 rounded-lg text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Remover intervalo"
              >
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  abrirModalIntervalo(id) {
    const modal = document.getElementById("modal-config-intervalo");
    const titulo = document.getElementById("modal-intervalo-titulo");
    if (!modal) return;

    if (id) {
      const item = this.intervalosCatalogo.find(i => String(i.id || i.horas) === String(id));
      if (!item) return;

      if (titulo) titulo.innerHTML = `<span>⏰</span> <span>Editar Intervalo: ${item.horas}h</span>`;
      document.getElementById("modal-int-id").value = item.id || item.horas;
      document.getElementById("modal-int-horas").value = item.horas;
      document.getElementById("modal-int-refeicoes").value = item.refeicoes || Math.floor(24 / item.horas);
      document.getElementById("modal-int-label").value = item.label || `De ${item.horas} em ${item.horas} horas`;
    } else {
      if (titulo) titulo.innerHTML = `<span>➕</span> <span>Novo Intervalo de Dieta</span>`;
      document.getElementById("modal-int-id").value = "";
      document.getElementById("modal-int-horas").value = "3";
      document.getElementById("modal-int-refeicoes").value = "8";
      document.getElementById("modal-int-label").value = "De 3 em 3 horas (8 horários)";
    }

    modal.classList.remove("hidden");
  },

  fecharModalIntervalo() {
    const modal = document.getElementById("modal-config-intervalo");
    if (modal) modal.classList.add("hidden");
  },

  salvarModalIntervalo(event) {
    event.preventDefault();

    const id = document.getElementById("modal-int-id").value;
    const horas = parseInt(document.getElementById("modal-int-horas").value, 10) || 3;
    const refeicoes = parseInt(document.getElementById("modal-int-refeicoes").value, 10) || Math.floor(24 / horas);
    const label = document.getElementById("modal-int-label").value.trim();

    if (!label) {
      this.mostrarToast("Informe a descrição do intervalo.", "warning");
      return;
    }

    if (typeof VersionamentoModule !== "undefined") {
      VersionamentoModule.criarSnapshot("AUTOMATICO", id ? `Alteração no intervalo "${label}"` : `Cadastro de novo intervalo "${label}"`);
    }

    let alteracoes = [];
    if (id) {
      const idx = this.intervalosCatalogo.findIndex(i => String(i.id || i.horas) === String(id));
      if (idx !== -1) {
        const antigo = this.intervalosCatalogo[idx];
        if (antigo.horas !== horas) alteracoes.push({ campo: "Horas de Intervalo", de: `${antigo.horas}h`, para: `${horas}h` });
        if (antigo.refeicoes !== refeicoes) alteracoes.push({ campo: "Refeições/Dia", de: `${antigo.refeicoes}x`, para: `${refeicoes}x` });
        if (antigo.label !== label) alteracoes.push({ campo: "Descrição", de: antigo.label, para: label });

        this.intervalosCatalogo[idx] = {
          id: String(horas),
          horas,
          refeicoes,
          label
        };
      }
    } else {
      alteracoes = [
        { campo: "Horas de Intervalo", de: "-", para: `${horas}h` },
        { campo: "Refeições/Dia", de: "-", para: `${refeicoes}x` },
        { campo: "Descrição", de: "-", para: label }
      ];

      this.intervalosCatalogo.push({
        id: String(horas),
        horas,
        refeicoes,
        label
      });
    }

    localStorage.setItem("lactario_config_intervalos", JSON.stringify(this.intervalosCatalogo));
    localStorage.setItem("lac_custom_intervalos", JSON.stringify(this.intervalosCatalogo));

    if (typeof AuditLogModule !== "undefined") {
      AuditLogModule.registrar(
        "CATALOGO_INTERVALOS",
        id ? "EDICAO" : "CRIACAO",
        id ? `Intervalo "${label}" atualizado` : `Novo intervalo "${label}" cadastrado`,
        alteracoes,
        { intervaloId: id, label, horas }
      );
    }

    this.fecharModalIntervalo();
    this.filtrarIntervalos();
    this.popularSelects();
    this.mostrarToast(`Intervalo "${label}" salvo com sucesso!`, "success");
  },

  excluirIntervalo(id) {
    const item = this.intervalosCatalogo.find(i => String(i.id || i.horas) === String(id));
    if (!item) return;

    if (confirm(`Deseja remover o intervalo "${item.label}"?`)) {
      if (typeof VersionamentoModule !== "undefined") {
        VersionamentoModule.criarSnapshot("AUTOMATICO", `Exclusão do intervalo "${item.label}"`);
      }

      this.intervalosCatalogo = this.intervalosCatalogo.filter(i => String(i.id || i.horas) !== String(id));
      localStorage.setItem("lactario_config_intervalos", JSON.stringify(this.intervalosCatalogo));
      localStorage.setItem("lac_custom_intervalos", JSON.stringify(this.intervalosCatalogo));

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "CATALOGO_INTERVALOS",
          "EXCLUSAO",
          `Intervalo "${item.label}" removido do sistema`,
          [{ campo: "Status", de: "Ativo", para: "Excluído" }],
          { intervaloId: id, label: item.label }
        );
      }

      this.filtrarIntervalos();
      this.popularSelects();
      this.mostrarToast(`Intervalo "${item.label}" removido.`, "warning");
    }
  },

  restaurarIntervalosPadrao() {
    if (confirm("Deseja restaurar os intervalos padrão de prescrição?")) {
      if (typeof VersionamentoModule !== "undefined") {
        VersionamentoModule.criarSnapshot("AUTOMATICO", "Backup automático antes de restaurar os intervalos padrão");
      }

      this.intervalosCatalogo = [
        { id: "3", horas: 3, label: "De 3 em 3 horas (Padrão - 8 horários)", refeicoes: 8 },
        { id: "2", horas: 2, label: "De 2 em 2 horas (12 horários)", refeicoes: 12 },
        { id: "4", horas: 4, label: "De 4 em 4 horas (6 horários)", refeicoes: 6 }
      ];
      localStorage.setItem("lactario_config_intervalos", JSON.stringify(this.intervalosCatalogo));
      localStorage.setItem("lac_custom_intervalos", JSON.stringify(this.intervalosCatalogo));

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "CATALOGO_INTERVALOS",
          "RESTAURACAO",
          "Intervalos de dietas restaurados para o padrão oficial HSP",
          [{ campo: "Intervalos", de: "Customizados", para: "3h, 2h e 4h padrão" }],
          {}
        );
      }

      this.filtrarIntervalos();
      this.popularSelects();
      this.mostrarToast("Intervalos restaurados para o padrão com sucesso!", "success");
    }
  },

  // -------------------------------------------------------------------------
  // 4. VIAS DE ADMINISTRAÇÃO
  // -------------------------------------------------------------------------

  filtrarVias() {
    const termo = (document.getElementById("config-busca-via")?.value || "").toLowerCase().trim();
    let lista = this.viasCatalogo;

    if (termo) {
      lista = lista.filter(v => {
        const nome = typeof v === "string" ? v : (v.nome || "");
        const desc = typeof v === "object" ? (v.descricao || "") : "";
        return nome.toLowerCase().includes(termo) || desc.toLowerCase().includes(termo);
      });
    }

    this.renderizarTabelaVias(lista);
  },

  renderizarTabelaVias(lista) {
    const tbody = document.getElementById("tabela-config-vias-corpo");
    const contador = document.getElementById("config-contador-vias");
    if (contador) {
      contador.innerText = `${lista.length} vias ${lista.length !== this.viasCatalogo.length ? 'filtradas' : 'ativas'}`;
    }

    if (!tbody) return;

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="py-6 text-center text-slate-400 font-medium text-xs">
            Nenhuma via encontrada com o filtro informado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = lista.map(v => {
      const nome = typeof v === "string" ? v : (v.nome || v.id);
      const desc = typeof v === "object" ? (v.descricao || "Via clínica padrão") : "Via clínica padrão";

      return `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-200">
          <td class="py-2.5 px-3 font-black text-slate-950">
            <span class="inline-block px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-teal-50 text-teal-950 border border-teal-200 mr-2">
              ${escapeHtml(nome)}
            </span>
          </td>
          <td class="py-2.5 px-3 text-xs text-slate-700 font-medium">
            ${escapeHtml(desc)}
          </td>
          <td class="py-2.5 px-3 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-1">
              <button 
                onclick="App.abrirModalVia('${escapeHtml(nome)}')"
                class="p-1.5 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                title="Editar esta via"
              >
                ✏️
              </button>
              <button 
                onclick="App.excluirVia('${escapeHtml(nome)}')"
                class="p-1.5 rounded-lg text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Remover via"
              >
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  abrirModalVia(nomeVia) {
    const modal = document.getElementById("modal-config-via");
    const titulo = document.getElementById("modal-via-titulo");
    if (!modal) return;

    if (nomeVia) {
      const item = this.viasCatalogo.find(v => (typeof v === "string" ? v : v.nome) === nomeVia);
      if (titulo) titulo.innerHTML = `<span>💉</span> <span>Editar Via: ${escapeHtml(nomeVia)}</span>`;
      document.getElementById("modal-via-id-original").value = nomeVia;
      document.getElementById("modal-via-nome").value = nomeVia;
      document.getElementById("modal-via-descricao").value = (typeof item === "object" && item.descricao) ? item.descricao : "";
    } else {
      if (titulo) titulo.innerHTML = `<span>➕</span> <span>Nova Via de Administração</span>`;
      document.getElementById("modal-via-id-original").value = "";
      document.getElementById("modal-via-nome").value = "";
      document.getElementById("modal-via-descricao").value = "";
    }

    modal.classList.remove("hidden");
  },

  fecharModalVia() {
    const modal = document.getElementById("modal-config-via");
    if (modal) modal.classList.add("hidden");
  },

  salvarModalVia(event) {
    event.preventDefault();

    const idOriginal = document.getElementById("modal-via-id-original").value;
    const nome = document.getElementById("modal-via-nome").value.trim().toUpperCase();
    const descricao = document.getElementById("modal-via-descricao").value.trim();

    if (!nome) {
      this.mostrarToast("Informe o nome da via de administração.", "warning");
      return;
    }

    if (typeof VersionamentoModule !== "undefined") {
      VersionamentoModule.criarSnapshot("AUTOMATICO", idOriginal ? `Alteração na via "${nome}"` : `Cadastro de nova via "${nome}"`);
    }

    let alteracoes = [];
    if (idOriginal) {
      const idx = this.viasCatalogo.findIndex(v => (typeof v === "string" ? v : v.nome) === idOriginal);
      if (idx !== -1) {
        const antigo = this.viasCatalogo[idx];
        const nomeAntigo = typeof antigo === "string" ? antigo : antigo.nome;
        const descAntiga = typeof antigo === "object" ? (antigo.descricao || "") : "";
        if (nomeAntigo !== nome) alteracoes.push({ campo: "Nome da Via", de: nomeAntigo, para: nome });
        if (descAntiga !== descricao) alteracoes.push({ campo: "Descrição", de: descAntiga || "-", para: descricao || "-" });

        this.viasCatalogo[idx] = { id: nome, nome, descricao: descricao || "Via clínica do protocolo" };
      }
    } else {
      alteracoes = [
        { campo: "Nome da Via", de: "-", para: nome },
        { campo: "Descrição", de: "-", para: descricao || "Via clínica do protocolo" }
      ];
      this.viasCatalogo.push({ id: nome, nome, descricao: descricao || "Via clínica do protocolo" });
    }

    localStorage.setItem("lactario_config_vias", JSON.stringify(this.viasCatalogo));
    localStorage.setItem("lac_custom_vias", JSON.stringify(this.viasCatalogo));

    if (typeof AuditLogModule !== "undefined") {
      AuditLogModule.registrar(
        "CATALOGO_VIAS",
        idOriginal ? "EDICAO" : "CRIACAO",
        idOriginal ? `Via "${nome}" atualizada` : `Nova via "${nome}" cadastrada`,
        alteracoes,
        { viaNome: nome }
      );
    }

    this.fecharModalVia();
    this.filtrarVias();
    this.popularSelects();
    this.mostrarToast(`Via "${nome}" salva com sucesso!`, "success");
  },

  excluirVia(nomeVia) {
    if (confirm(`Deseja remover a via "${nomeVia}" do sistema?`)) {
      if (typeof VersionamentoModule !== "undefined") {
        VersionamentoModule.criarSnapshot("AUTOMATICO", `Exclusão da via "${nomeVia}"`);
      }

      this.viasCatalogo = this.viasCatalogo.filter(v => (typeof v === "string" ? v : v.nome) !== nomeVia);
      localStorage.setItem("lactario_config_vias", JSON.stringify(this.viasCatalogo));
      localStorage.setItem("lac_custom_vias", JSON.stringify(this.viasCatalogo));

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "CATALOGO_VIAS",
          "EXCLUSAO",
          `Via "${nomeVia}" removida do sistema`,
          [{ campo: "Status", de: "Ativa", para: "Excluída" }],
          { viaNome: nomeVia }
        );
      }

      this.filtrarVias();
      this.popularSelects();
      this.mostrarToast(`Via "${nomeVia}" removida.`, "warning");
    }
  },

  restaurarViasPadrao() {
    if (confirm("Deseja restaurar as vias de administração para o padrão oficial?")) {
      if (typeof VersionamentoModule !== "undefined") {
        VersionamentoModule.criarSnapshot("AUTOMATICO", "Backup automático antes de restaurar as vias padrão");
      }

      this.viasCatalogo = [
        { id: "ORAL", nome: "ORAL", descricao: "Via oral (mamadeira / copo)" },
        { id: "ENTERAL", nome: "ENTERAL", descricao: "Nutrição enteral geral" },
        { id: "SONDA NASOGÁSTRICA (SNG)", nome: "SONDA NASOGÁSTRICA (SNG)", descricao: "Sonda gástrica" },
        { id: "SONDA NASOENTERAL (SNE)", nome: "SONDA NASOENTERAL (SNE)", descricao: "Sonda enteral pós-pilórica" },
        { id: "GASTROSTOMIA (GTT)", nome: "GASTROSTOMIA (GTT)", descricao: "Estomia gástrica" },
        { id: "JEJUNOSTOMIA", nome: "JEJUNOSTOMIA", descricao: "Estomia jejunal" }
      ];
      localStorage.setItem("lactario_config_vias", JSON.stringify(this.viasCatalogo));
      localStorage.setItem("lac_custom_vias", JSON.stringify(this.viasCatalogo));

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "CATALOGO_VIAS",
          "RESTAURACAO",
          "Vias de administração restauradas para o padrão oficial HSP",
          [{ campo: "Vias", de: "Customizadas", para: "6 vias oficiais padrão" }],
          {}
        );
      }

      this.filtrarVias();
      this.popularSelects();
      this.mostrarToast("Vias de administração restauradas com sucesso!", "success");
    }
  },

  // -------------------------------------------------------------------------
  // 5. DISPOSITIVOS DE ENVASE
  // -------------------------------------------------------------------------

  filtrarDispositivos() {
    const termo = (document.getElementById("config-busca-dispositivo")?.value || "").toLowerCase().trim();
    let lista = this.dispositivosCatalogo;

    if (termo) {
      lista = lista.filter(d => {
        const nome = typeof d === "string" ? d : (d.nome || "");
        const desc = typeof d === "object" ? (d.descricao || "") : "";
        return nome.toLowerCase().includes(termo) || desc.toLowerCase().includes(termo);
      });
    }

    this.renderizarTabelaDispositivos(lista);
  },

  renderizarTabelaDispositivos(lista) {
    const tbody = document.getElementById("tabela-config-dispositivos-corpo");
    const contador = document.getElementById("config-contador-dispositivos");
    if (contador) {
      contador.innerText = `${lista.length} dispositivos ${lista.length !== this.dispositivosCatalogo.length ? 'filtrados' : 'ativas'}`;
    }

    if (!tbody) return;

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="py-6 text-center text-slate-400 font-medium text-xs">
            Nenhum dispositivo encontrado com o filtro informado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = lista.map(d => {
      const nome = typeof d === "string" ? d : (d.nome || d.id);
      const desc = typeof d === "object" ? (d.descricao || "Material de bancada padrão") : "Material de bancada padrão";

      return `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-200">
          <td class="py-2.5 px-3 font-black text-slate-950">
            <span class="inline-block px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-pink-50 text-pink-950 border border-pink-200 mr-2">
              ${escapeHtml(nome)}
            </span>
          </td>
          <td class="py-2.5 px-3 text-xs text-slate-700 font-medium">
            ${escapeHtml(desc)}
          </td>
          <td class="py-2.5 px-3 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-1">
              <button 
                onclick="App.abrirModalDispositivo('${escapeHtml(nome)}')"
                class="p-1.5 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                title="Editar este dispositivo"
              >
                ✏️
              </button>
              <button 
                onclick="App.excluirDispositivo('${escapeHtml(nome)}')"
                class="p-1.5 rounded-lg text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Remover dispositivo"
              >
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  abrirModalDispositivo(nomeDisp) {
    const modal = document.getElementById("modal-config-dispositivo");
    const titulo = document.getElementById("modal-dispositivo-titulo");
    if (!modal) return;

    if (nomeDisp) {
      const item = this.dispositivosCatalogo.find(d => (typeof d === "string" ? d : d.nome) === nomeDisp);
      if (titulo) titulo.innerHTML = `<span>🍼</span> <span>Editar Dispositivo: ${escapeHtml(nomeDisp)}</span>`;
      document.getElementById("modal-disp-id-original").value = nomeDisp;
      document.getElementById("modal-disp-nome").value = nomeDisp;
      document.getElementById("modal-disp-descricao").value = (typeof item === "object" && item.descricao) ? item.descricao : "";
    } else {
      if (titulo) titulo.innerHTML = `<span>➕</span> <span>Novo Dispositivo de Envase</span>`;
      document.getElementById("modal-disp-id-original").value = "";
      document.getElementById("modal-disp-nome").value = "";
      document.getElementById("modal-disp-descricao").value = "";
    }

    modal.classList.remove("hidden");
  },

  fecharModalDispositivo() {
    const modal = document.getElementById("modal-config-dispositivo");
    if (modal) modal.classList.add("hidden");
  },

  salvarModalDispositivo(event) {
    event.preventDefault();

    const idOriginal = document.getElementById("modal-disp-id-original").value;
    const nome = document.getElementById("modal-disp-nome").value.trim();
    const descricao = document.getElementById("modal-disp-descricao").value.trim();

    if (!nome) {
      this.mostrarToast("Informe o nome do dispositivo.", "warning");
      return;
    }

    if (typeof VersionamentoModule !== "undefined") {
      VersionamentoModule.criarSnapshot("AUTOMATICO", idOriginal ? `Alteração no dispositivo "${nome}"` : `Cadastro de novo dispositivo "${nome}"`);
    }

    let alteracoes = [];
    if (idOriginal) {
      const idx = this.dispositivosCatalogo.findIndex(d => (typeof d === "string" ? d : d.nome) === idOriginal);
      if (idx !== -1) {
        const antigo = this.dispositivosCatalogo[idx];
        const nomeAntigo = typeof antigo === "string" ? antigo : antigo.nome;
        const descAntiga = typeof antigo === "object" ? (antigo.descricao || "") : "";
        if (nomeAntigo !== nome) alteracoes.push({ campo: "Nome do Dispositivo", de: nomeAntigo, para: nome });
        if (descAntiga !== descricao) alteracoes.push({ campo: "Descrição", de: descAntiga || "-", para: descricao || "-" });

        this.dispositivosCatalogo[idx] = { id: nome, nome, descricao: descricao || "Envase do lactário" };
      }
    } else {
      alteracoes = [
        { campo: "Nome do Dispositivo", de: "-", para: nome },
        { campo: "Descrição", de: "-", para: descricao || "Envase do lactário" }
      ];
      this.dispositivosCatalogo.push({ id: nome, nome, descricao: descricao || "Envase do lactário" });
    }

    localStorage.setItem("lactario_config_dispositivos", JSON.stringify(this.dispositivosCatalogo));
    localStorage.setItem("lac_custom_dispositivos", JSON.stringify(this.dispositivosCatalogo));

    if (typeof AuditLogModule !== "undefined") {
      AuditLogModule.registrar(
        "CATALOGO_DISPOSITIVOS",
        idOriginal ? "EDICAO" : "CRIACAO",
        idOriginal ? `Dispositivo "${nome}" atualizado` : `Novo dispositivo "${nome}" cadastrado`,
        alteracoes,
        { dispositivoNome: nome }
      );
    }

    this.fecharModalDispositivo();
    this.filtrarDispositivos();
    this.popularSelects();
    this.mostrarToast(`Dispositivo "${nome}" salvo com sucesso!`, "success");
  },

  excluirDispositivo(nomeDisp) {
    if (confirm(`Deseja remover o dispositivo "${nomeDisp}" do sistema?`)) {
      if (typeof VersionamentoModule !== "undefined") {
        VersionamentoModule.criarSnapshot("AUTOMATICO", `Exclusão do dispositivo "${nomeDisp}"`);
      }

      this.dispositivosCatalogo = this.dispositivosCatalogo.filter(d => (typeof d === "string" ? d : d.nome) !== nomeDisp);
      localStorage.setItem("lactario_config_dispositivos", JSON.stringify(this.dispositivosCatalogo));
      localStorage.setItem("lac_custom_dispositivos", JSON.stringify(this.dispositivosCatalogo));

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "CATALOGO_DISPOSITIVOS",
          "EXCLUSAO",
          `Dispositivo "${nomeDisp}" removido do sistema`,
          [{ campo: "Status", de: "Ativo", para: "Excluído" }],
          { dispositivoNome: nomeDisp }
        );
      }

      this.filtrarDispositivos();
      this.popularSelects();
      this.mostrarToast(`Dispositivo "${nomeDisp}" removido.`, "warning");
    }
  },

  restaurarDispositivosPadrao() {
    if (confirm("Deseja restaurar os dispositivos de envase para o padrão oficial?")) {
      if (typeof VersionamentoModule !== "undefined") {
        VersionamentoModule.criarSnapshot("AUTOMATICO", "Backup automático antes de restaurar os dispositivos padrão");
      }

      this.dispositivosCatalogo = [
        { id: "Mamadeira", nome: "Mamadeira", descricao: "Frasco graduado com bico" },
        { id: "Frasco Enteral", nome: "Frasco Enteral", descricao: "Frasco para bomba ou gravidade" },
        { id: "Frasco V.O.", nome: "Frasco V.O.", descricao: "Frasco para via oral" },
        { id: "Chuca sem bico", nome: "Chuca sem bico", descricao: "Chuca descartável" },
        { id: "Copo", nome: "Copo", descricao: "Copo dosador" },
        { id: "Seringa", nome: "Seringa", descricao: "Seringa enteral graduada" },
        { id: "Equipo Roxo", nome: "Equipo Roxo", descricao: "Linha de infusão enteral" }
      ];
      localStorage.setItem("lactario_config_dispositivos", JSON.stringify(this.dispositivosCatalogo));
      localStorage.setItem("lac_custom_dispositivos", JSON.stringify(this.dispositivosCatalogo));

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "CATALOGO_DISPOSITIVOS",
          "RESTAURACAO",
          "Dispositivos de envase restaurados para o padrão oficial HSP",
          [{ campo: "Dispositivos", de: "Customizados", para: "7 dispositivos padrão" }],
          {}
        );
      }

      this.filtrarDispositivos();
      this.popularSelects();
      this.mostrarToast("Dispositivos de envase restaurados com sucesso!", "success");
    }
  },

  // =========================================================================
  // GESTÃO INTERATIVA DE HORÁRIOS NO MODAL DE PACIENTE (COM ALFINETES 📌)
  // =========================================================================
  
  // Regenera a grade de horários teóricos com base na 1ª refeição e intervalo
  regenerarGradeHorariosModal() {
    const hInicio = document.getElementById("modal-horario")?.value || "06:00";
    const intervalo = parseInt(document.getElementById("modal-intervalo")?.value, 10) || 3;

    const horasTeoricas = CensoModule.gerarHorariosTeoricos(hInicio, intervalo);
    
    // Mapeia preservando o estado anterior se a hora já existia, ou ativa por padrão
    const mapaAtual = new Map(this.gradeHorariosModal.map(item => [item.hora, item.ativo]));
    
    this.gradeHorariosModal = horasTeoricas.map(hora => ({
      hora,
      ativo: mapaAtual.has(hora) ? mapaAtual.get(hora) : true
    }));

    this.renderizarGradeBotoesModal();
  },

  // Alterna o estado (ligado / desligado) de um botão de horário na grade
  toggleHorarioModal(horaStr) {
    const item = this.gradeHorariosModal.find(h => h.hora === horaStr);
    if (item) {
      item.ativo = !item.ativo;
      this.renderizarGradeBotoesModal();
    }
  },

  // Renderiza os botões interativos de horário com a animação e alfinetes sem sobreposição
  renderizarGradeBotoesModal() {
    const container = document.getElementById("modal-grade-horarios-botoes");
    const contador = document.getElementById("modal-contagem-refeicoes");
    if (!container) return;

    const totalAtivos = this.gradeHorariosModal.filter(h => h.ativo).length;
    if (contador) {
      contador.innerText = `${totalAtivos}x / dia`;
    }

    container.innerHTML = this.gradeHorariosModal.map(item => {
      if (item.ativo) {
        return `
          <button 
            type="button" 
            onclick="App.toggleHorarioModal('${item.hora}')"
            title="Horário Ativo (Clique para remover)"
            class="flex flex-col items-center justify-center p-2 rounded-xl border border-purple-400 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-xs font-black cursor-pointer transform active:scale-95 transition-all"
          >
            <span class="text-base leading-none mb-1">📌</span>
            <span class="font-mono font-black text-xs">${item.hora}</span>
          </button>
        `;
      } else {
        return `
          <button 
            type="button" 
            onclick="App.toggleHorarioModal('${item.hora}')"
            title="Sem Dieta neste horário (Clique para incluir)"
            class="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-purple-300 bg-purple-50/40 text-purple-400 opacity-60 cursor-pointer hover:opacity-100 hover:bg-purple-100/60 transition-all transform active:scale-95"
          >
            <span class="text-base leading-none mb-1">⚪</span>
            <span class="font-mono font-semibold text-xs line-through">${item.hora}</span>
          </button>
        `;
      }
    }).join("");
  },

  // Configuração Global de Eventos
  configurarEventos() {
    const inputBusca = document.getElementById("censo-busca");
    if (inputBusca) {
      inputBusca.addEventListener("input", (e) => {
        CensoModule.filtroTexto = e.target.value;
        this.renderizarCenso();
      });
    }

    const selectEnf = document.getElementById("filtro-enfermaria");
    if (selectEnf) {
      selectEnf.addEventListener("change", (e) => {
        CensoModule.filtroEnfermaria = e.target.value;
        this.renderizarCenso();
      });
    }

    const selectStatus = document.getElementById("filtro-status");
    if (selectStatus) {
      selectStatus.addEventListener("change", (e) => {
        CensoModule.filtroStatus = e.target.value;
        this.renderizarCenso();
      });
    }

    const inputEtqBusca = document.getElementById("etiquetas-busca");
    if (inputEtqBusca) {
      inputEtqBusca.addEventListener("input", (e) => {
        EtiquetasModule.filtroTexto = e.target.value;
        this.renderizarEtiquetas();
      });
    }

    const selectEtqTurno = document.getElementById("etiquetas-filtro-turno");
    if (selectEtqTurno) {
      selectEtqTurno.addEventListener("change", (e) => {
        EtiquetasModule.filtroTurno = e.target.value;
        this.renderizarEtiquetas();
      });
    }

    const selectEtqEnf = document.getElementById("etiquetas-filtro-enfermaria");
    if (selectEtqEnf) {
      selectEtqEnf.addEventListener("change", (e) => {
        EtiquetasModule.filtroEnfermaria = e.target.value;
        this.renderizarEtiquetas();
      });
    }

    const selectEtqCat = document.getElementById("etiquetas-filtro-categoria");
    if (selectEtqCat) {
      selectEtqCat.addEventListener("change", (e) => {
        EtiquetasModule.filtroCategoria = e.target.value;
        this.renderizarEtiquetas();
      });
    }

    const selectEtqDisp = document.getElementById("etiquetas-filtro-dispositivo");
    if (selectEtqDisp) {
      selectEtqDisp.addEventListener("change", (e) => {
        EtiquetasModule.filtroDispositivo = e.target.value;
        this.renderizarEtiquetas();
      });
    }

    const checkMultiplicador = document.getElementById("etiquetas-multiplicador-frascos");
    if (checkMultiplicador) {
      checkMultiplicador.addEventListener("change", (e) => {
        EtiquetasModule.multiplicadorPorVezes = e.target.checked;
      });
    }

    const modalEnf = document.getElementById("modal-enfermaria");
    if (modalEnf) {
      modalEnf.addEventListener("change", (e) => {
        this.atualizarOpcoesLeitoModal(e.target.value);
      });
    }

    const modalDieta = document.getElementById("modal-dieta");
    if (modalDieta) {
      modalDieta.addEventListener("change", () => {
        this.atualizarVisibilidadeDietaEspecialModal();
      });
    }

    const modalRH = document.getElementById("modal-rh");
    if (modalRH) {
      modalRH.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        if (val.length >= 4) {
          const pacExistente = CensoModule.buscarPorRH(val);
          if (pacExistente && pacExistente.nome) {
            const inputNome = document.getElementById("modal-nome");
            if (inputNome && !inputNome.value) {
              inputNome.value = pacExistente.nome;
              this.mostrarToast(`Nome preenchido automaticamente: ${pacExistente.nome}`, "info");
            }
          }
        }
      });
    }

    const modalNome = document.getElementById("modal-nome");
    if (modalNome) {
      modalNome.addEventListener("input", (e) => {
        const val = e.target.value.trim().toUpperCase();
        if (val.length >= 6) {
          const pacExistente = CensoModule.buscarPorNome(val);
          if (pacExistente && pacExistente.rh) {
            const inputRH = document.getElementById("modal-rh");
            if (inputRH && !inputRH.value) {
              inputRH.value = pacExistente.rh;
              this.mostrarToast(`Atendimento preenchido automaticamente: ${pacExistente.rh}`, "info");
            }
          }
        }
      });
    }

    const checkManter = document.getElementById("modal-manter-campos");
    if (checkManter) {
      checkManter.addEventListener("change", (e) => {
        localStorage.setItem("lactario_manter_campos_v1", e.target.checked ? "true" : "false");
      });
    }
  },

  // Atualiza a lista de leitos sugeridos no modal ao selecionar enfermaria
  atualizarOpcoesLeitoModal(enfermariaId) {
    const datalist = document.getElementById("leitos-sugestoes");
    if (!datalist) return;

    const enf = ENFERMARIAS_HSP.find(e => e.id === enfermariaId);
    if (enf && enf.leitos) {
      datalist.innerHTML = enf.leitos.map(l => `<option value="${l}">`).join("");
    } else {
      datalist.innerHTML = "";
    }
  },

  // Atualiza a visibilidade do botão Global Desfazer
  atualizarBotaoUndo() {
    const btnUndo = document.getElementById("btn-global-undo");
    if (btnUndo) {
      if (CensoModule.historicoUndo.length > 0) {
        btnUndo.classList.remove("hidden");
      } else {
        btnUndo.classList.add("hidden");
      }
    }
  },

  // Executa o Desfazer (Undo) com confirmação detalhada da ação a ser desfeita
  async desfazerAcao() {
    const ultimaAcao = CensoModule.obterUltimaAcaoDescricao();
    if (!ultimaAcao) {
      this.mostrarToast("Não há ações recentes para desfazer.", "info");
      return;
    }

    const confirmar = confirm(
      `↺ CONFIRMAÇÃO PARA DESFAZER ALTERAÇÃO\n\n` +
      `Deseja realmente desfazer a seguinte alteração?\n\n` +
      `• Ação: ${ultimaAcao}\n\n` +
      `Clique em "OK" para desfazer ou "Cancelar" para manter.`
    );

    if (!confirmar) return;

    const resultado = await CensoModule.desfazerUltimaAcao();
    if (resultado) {
      this.mostrarToast(resultado.msg, "success");
      this.renderizarTudo();
    }
    this.atualizarBotaoUndo();
  },

  // Abrir Modal de Alta
  abrirModalAlta(pacienteId) {
    if (typeof LoteEsteiraModule !== "undefined") {
      LoteEsteiraModule.abrirModalAltaIndividual(pacienteId);
    }
  },

  // Fechar Modal de Alta
  fecharModalAlta() {
    if (typeof LoteEsteiraModule !== "undefined") {
      LoteEsteiraModule.fecharModalAlta();
    }
  },

  // Confirmar Alta do Paciente
  async confirmarAltaPaciente(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (typeof LoteEsteiraModule !== "undefined") {
      await LoteEsteiraModule.confirmarAltaAtual();
    }
  },

  // Reinternar Paciente
  async reinternarPaciente(pacienteId) {
    const paciente = await CensoModule.reinternarPaciente(pacienteId);
    if (paciente) {
      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "PACIENTES",
          "REATIVACAO",
          `Paciente reinternado no censo: ${paciente.nome} (Leito: ${paciente.leito})`,
          [{ campo: "Status", de: "Histórico de Alta", para: "Internado Ativo" }],
          { pacienteId: paciente.id, leito: paciente.leito, nome: paciente.nome }
        );
      }

      this.mostrarToast(`Paciente ${paciente.nome} reinternado com sucesso no censo ativo!`, "success");
      this.renderizarTudo();
    }
  },

  // Alternar Suspensão
  async toggleSuspensao(pacienteId) {
    const paciente = await CensoModule.toggleSuspensao(pacienteId);
    if (paciente) {
      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "PACIENTES",
          paciente.suspenso ? "SUSPENSAO" : "REATIVACAO",
          paciente.suspenso ? `Dieta suspensa: ${paciente.nome} (Leito: ${paciente.leito})` : `Dieta reativada: ${paciente.nome} (Leito: ${paciente.leito})`,
          [{ campo: "Status da Dieta", de: paciente.suspenso ? "Ativa" : "Suspensa", para: paciente.suspenso ? "Suspensa" : "Ativa" }],
          { pacienteId: paciente.id, leito: paciente.leito, nome: paciente.nome }
        );
      }

      this.mostrarToast(
        paciente.suspenso 
          ? `Dieta de ${paciente.nome} suspensa (excluída da produção).`
          : `Dieta de ${paciente.nome} reativada no censo!`,
        paciente.suspenso ? "warning" : "success"
      );
      this.renderizarTudo();
    }
  },

  // Abrir Modal de Adicionar Paciente
  abrirModalNovoPaciente() {
    this.pacienteEdicaoId = null;
    document.getElementById("modal-paciente-titulo").innerText = "ADICIONAR NOVO PACIENTE";
    document.getElementById("modal-paciente-subtitulo").innerText = "Preencha os dados clínicos e defina o plano nutricional";
    
    const manterCampos = document.getElementById("modal-manter-campos")?.checked;
    const enfAnterior = this.ultimoEnfermariaSelecionada;
    const dietaAnterior = this.ultimoDietaSelecionada;

    document.getElementById("form-paciente").reset();
    this.carregarPreferenciasRetencao();

    if (manterCampos && enfAnterior) {
      document.getElementById("modal-enfermaria").value = enfAnterior;
      this.atualizarOpcoesLeitoModal(enfAnterior);
    } else {
      const primeiraEnf = ENFERMARIAS_HSP[0].id;
      document.getElementById("modal-enfermaria").value = primeiraEnf;
      this.atualizarOpcoesLeitoModal(primeiraEnf);
    }

    if (manterCampos && dietaAnterior) {
      document.getElementById("modal-dieta").value = dietaAnterior;
    }

    const inputDescEspecial = document.getElementById("modal-dieta-especial-desc");
    if (inputDescEspecial) inputDescEspecial.value = "";
    const inputQtdEspecial = document.getElementById("modal-dieta-especial-qtd");
    if (inputQtdEspecial) inputQtdEspecial.value = "";
    this.atualizarVisibilidadeDietaEspecialModal();

    document.getElementById("modal-horario").value = "06:00";
    document.getElementById("modal-intervalo").value = "3";
    
    // Inicializa a grade interativa de horários (todos ligados 📌 por padrão)
    this.gradeHorariosModal = [];
    this.regenerarGradeHorariosModal();

    document.getElementById("modal-paciente").classList.remove("hidden");
    setTimeout(() => {
      const inputRH = document.getElementById("modal-rh");
      if (inputRH) inputRH.focus();
    }, 100);
  },

  // Abrir Modal de Edição de Paciente
  abrirModalEdicao(pacienteId) {
    const paciente = CensoModule.obterPorId(pacienteId);
    if (!paciente) return;

    this.pacienteEdicaoId = pacienteId;
    document.getElementById("modal-paciente-titulo").innerText = "EDITAR PRESCRIÇÃO DO PACIENTE";
    document.getElementById("modal-paciente-subtitulo").innerText = "Revise e atualize os dados clínicos e o plano nutricional";

    document.getElementById("modal-rh").value = paciente.rh || "";
    document.getElementById("modal-nome").value = paciente.nome || "";
    document.getElementById("modal-enfermaria").value = paciente.enfermaria;
    this.atualizarOpcoesLeitoModal(paciente.enfermaria);
    document.getElementById("modal-leito").value = paciente.leito || "";
    document.getElementById("modal-dieta").value = paciente.dietaId;
    
    const inputDescEspecial = document.getElementById("modal-dieta-especial-desc");
    if (inputDescEspecial) {
      inputDescEspecial.value = paciente.dietaEspecialDesc || "";
    }
    const inputQtdEspecial = document.getElementById("modal-dieta-especial-qtd");
    if (inputQtdEspecial) {
      inputQtdEspecial.value = paciente.dietaEspecialQtd || "";
    }
    this.atualizarVisibilidadeDietaEspecialModal();

    document.getElementById("modal-horario").value = paciente.horarioInicio || "06:00";
    document.getElementById("modal-intervalo").value = String(paciente.intervaloHoras || (paciente.vezesDia === 12 ? 2 : 3));
    document.getElementById("modal-volume").value = paciente.volumeMl;
    document.getElementById("modal-via").value = paciente.via;
    document.getElementById("modal-dispositivo").value = paciente.dispositivo;
    document.getElementById("modal-espessante").value = paciente.espessanteObs || "";
    document.getElementById("modal-suspenso").checked = Boolean(paciente.suspenso);

    // Carregar horários ativos do paciente
    const horariosAtivos = CensoModule.obterHorariosAtivosPaciente(paciente);
    const intervalo = parseInt(document.getElementById("modal-intervalo").value, 10) || 3;
    const horasTeoricas = CensoModule.gerarHorariosTeoricos(paciente.horarioInicio || "06:00", intervalo);

    this.gradeHorariosModal = horasTeoricas.map(hora => ({
      hora,
      ativo: horariosAtivos.includes(hora)
    }));

    this.renderizarGradeBotoesModal();

    document.getElementById("modal-paciente").classList.remove("hidden");
  },

  // Fechar Modal de Paciente
  fecharModalPaciente() {
    document.getElementById("modal-paciente").classList.add("hidden");
    this.pacienteEdicaoId = null;
    if (typeof LoteEsteiraModule !== "undefined") {
      LoteEsteiraModule.removerControlesEsteiraModal();
    }
  },

  // Salvar e Adicionar Próximo
  async salvarEContinuarAdicionando(e) {
    e.preventDefault();
    await this.salvarFormularioPaciente(e, true);
  },

  // Salvar Formulário de Paciente
  async salvarFormularioPaciente(e, continuarAdicionando = false) {
    if (e && e.preventDefault) e.preventDefault();

    const form = document.getElementById("form-paciente");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const horariosAtivos = this.gradeHorariosModal.filter(h => h.ativo).map(h => h.hora);
    if (horariosAtivos.length === 0) {
      this.mostrarToast("Selecione pelo menos um horário de refeição ativo para o paciente!", "warning");
      return;
    }

    const enfermariaId = document.getElementById("modal-enfermaria").value;
    const enfObj = ENFERMARIAS_HSP.find(enf => enf.id === enfermariaId);
    const dietaId = document.getElementById("modal-dieta").value;
    const dietaObj = this.dietasCatalogo.find(d => d.id === dietaId);
    const manterCampos = document.getElementById("modal-manter-campos")?.checked;
    const intervaloHoras = parseInt(document.getElementById("modal-intervalo").value, 10) || 3;

    const dietaEspecialDesc = document.getElementById("modal-dieta-especial-desc")?.value.trim() || "";
    const dietaEspecialQtd = document.getElementById("modal-dieta-especial-qtd")?.value.trim() || "";
    if (dietaId === "dieta_especial" && !dietaEspecialDesc) {
      this.mostrarToast("Por favor, informe o tipo de Alimento / Dieta Especial (ex: Bolacha maizena)!", "warning");
      document.getElementById("modal-dieta-especial-desc")?.focus();
      return;
    }

    const dadosNovos = {
      rh: document.getElementById("modal-rh").value,
      nome: document.getElementById("modal-nome").value,
      enfermaria: enfermariaId,
      enfermariaNome: enfObj ? enfObj.nome : enfermariaId,
      leito: document.getElementById("modal-leito").value.toUpperCase(),
      dietaId: dietaId,
      dietaNome: dietaObj ? dietaObj.nome : dietaId,
      dietaEspecialDesc: dietaEspecialDesc,
      dietaEspecialQtd: dietaEspecialQtd,
      calCalorico: dietaObj ? `${dietaObj.kcal_100ml} kcal/100ml` : "67 kcal/100ml",
      horarioInicio: document.getElementById("modal-horario").value || "06:00",
      intervaloHoras: intervaloHoras,
      horariosAtivos: horariosAtivos,
      vezesDia: horariosAtivos.length,
      volumeMl: Number(document.getElementById("modal-volume").value),
      via: document.getElementById("modal-via").value,
      dispositivo: document.getElementById("modal-dispositivo").value,
      espessanteObs: document.getElementById("modal-espessante").value,
      suspenso: document.getElementById("modal-suspenso").checked
    };

    this.ultimoEnfermariaSelecionada = enfermariaId;
    this.ultimoDietaSelecionada = dietaId;

    if (this.pacienteEdicaoId) {
      const pacienteAntigo = CensoModule.obterPorId(this.pacienteEdicaoId);
      if (pacienteAntigo) {
        if (typeof LoteEsteiraModule !== "undefined" && LoteEsteiraModule.esteiraEdicao.ativa) {
          // Na esteira de edição, grava diretamente o paciente, calcula os diffs e avança para o próximo
          await CensoModule.atualizarPaciente(this.pacienteEdicaoId, dadosNovos);

          const alteracoes = [];
          if (pacienteAntigo.leito !== dadosNovos.leito) alteracoes.push({ campo: "Leito", de: pacienteAntigo.leito, para: dadosNovos.leito });
          if (pacienteAntigo.dietaNome !== dadosNovos.dietaNome) alteracoes.push({ campo: "Dieta", de: pacienteAntigo.dietaNome, para: dadosNovos.dietaNome });
          if ((pacienteAntigo.dietaEspecialDesc || "") !== (dadosNovos.dietaEspecialDesc || "")) alteracoes.push({ campo: "Especificação Dieta Especial", de: pacienteAntigo.dietaEspecialDesc || "-", para: dadosNovos.dietaEspecialDesc || "-" });
          if ((pacienteAntigo.horarioInicio || "06:00") !== dadosNovos.horarioInicio) alteracoes.push({ campo: "Horário 1ª Refeição", de: pacienteAntigo.horarioInicio || "06:00", para: dadosNovos.horarioInicio });
          if (pacienteAntigo.volumeMl !== dadosNovos.volumeMl) alteracoes.push({ campo: "Volume Unitário", de: `${pacienteAntigo.volumeMl} ml`, para: `${dadosNovos.volumeMl} ml` });
          if (pacienteAntigo.vezesDia !== dadosNovos.vezesDia) alteracoes.push({ campo: "Refeições no Dia", de: `${pacienteAntigo.vezesDia}x/dia`, para: `${dadosNovos.vezesDia}x/dia` });
          if (pacienteAntigo.via !== dadosNovos.via) alteracoes.push({ campo: "Via", de: pacienteAntigo.via, para: dadosNovos.via });
          if (pacienteAntigo.dispositivo !== dadosNovos.dispositivo) alteracoes.push({ campo: "Dispositivo", de: pacienteAntigo.dispositivo, para: dadosNovos.dispositivo });
          if ((pacienteAntigo.espessanteObs || "") !== (dadosNovos.espessanteObs || "")) alteracoes.push({ campo: "Observações", de: pacienteAntigo.espessanteObs || "-", para: dadosNovos.espessanteObs || "-" });
          if (Boolean(pacienteAntigo.suspenso) !== Boolean(dadosNovos.suspenso)) alteracoes.push({ campo: "Status", de: pacienteAntigo.suspenso ? "Suspenso" : "Ativo", para: dadosNovos.suspenso ? "Suspenso" : "Ativo" });

          if (typeof AuditLogModule !== "undefined") {
            AuditLogModule.registrar(
              "PACIENTES",
              "EDICAO",
              `Prescrição editada (Esteira): ${dadosNovos.nome} (Leito: ${dadosNovos.leito})`,
              alteracoes,
              { pacienteId: this.pacienteEdicaoId, leito: dadosNovos.leito, nome: dadosNovos.nome }
            );
          }

          LoteEsteiraModule.salvarAvancarEsteira(pacienteAntigo, dadosNovos, alteracoes);
          return;
        }

        this.edicaoPendente = {
          pacienteId: this.pacienteEdicaoId,
          dadosNovos,
          pacienteAntigo
        };
        this.abrirModalConfirmacaoEdicao(pacienteAntigo, dadosNovos);
        return;
      }
    }

    await CensoModule.adicionarPaciente(dadosNovos);
    
    if (typeof AuditLogModule !== "undefined") {
      AuditLogModule.registrar(
        "PACIENTES",
        "CRIACAO",
        `Novo paciente cadastrado: ${dadosNovos.nome} (Leito: ${dadosNovos.leito})`,
        [
          { campo: "Paciente", de: "-", para: dadosNovos.nome },
          { campo: "Leito", de: "-", para: dadosNovos.leito },
          { campo: "Enfermaria", de: "-", para: dadosNovos.enfermariaNome || dadosNovos.enfermaria },
          { campo: "Dieta", de: "-", para: dadosNovos.dietaNome },
          { campo: "Volume", de: "-", para: `${dadosNovos.volumeMl} ml` },
          { campo: "Refeições / Dia", de: "-", para: `${dadosNovos.vezesDia}x/dia` },
          { campo: "Via / Dispositivo", de: "-", para: `${dadosNovos.via || '-'} / ${dadosNovos.dispositivo || '-'}` }
        ],
        { pacienteId: dadosNovos.id, leito: dadosNovos.leito, nome: dadosNovos.nome }
      );
    }

    if (continuarAdicionando || manterCampos) {
      this.mostrarToast(`Paciente ${dadosNovos.nome} salvo! Pronto para o próximo leito.`, "success");
      
      document.getElementById("modal-rh").value = "";
      document.getElementById("modal-nome").value = "";
      document.getElementById("modal-leito").value = "";
      document.getElementById("modal-volume").value = "";
      document.getElementById("modal-espessante").value = "";
      const inputDesc = document.getElementById("modal-dieta-especial-desc");
      if (inputDesc) inputDesc.value = "";
      this.atualizarVisibilidadeDietaEspecialModal();
      document.getElementById("modal-suspenso").checked = false;

      // Reseta os botões de horário para todos ativos
      this.regenerarGradeHorariosModal();

      setTimeout(() => {
        const inputLeito = document.getElementById("modal-leito");
        if (inputLeito) inputLeito.focus();
      }, 50);
    } else {
      this.mostrarToast(`Paciente ${dadosNovos.nome} cadastrado no censo!`, "success");
      this.fecharModalPaciente();
    }

    this.renderizarTudo();
  },

  // Modal de Confirmação de Edição
  abrirModalConfirmacaoEdicao(antigo, novo) {
    const diffContainer = document.getElementById("confirm-edicao-diff-list");
    const nomeContainer = document.getElementById("confirm-edicao-paciente-nome");
    if (!diffContainer) return;

    nomeContainer.innerHTML = `Paciente: <strong>${escapeHtml(antigo.nome)}</strong> (Leito atual: <code>${escapeHtml(antigo.leito)}</code>)`;

    const diffs = [];
    if (antigo.leito !== novo.leito) diffs.push({ campo: "Leito", de: antigo.leito, para: novo.leito });
    if (antigo.dietaNome !== novo.dietaNome) diffs.push({ campo: "Dieta", de: antigo.dietaNome, para: novo.dietaNome });
    if ((antigo.dietaEspecialDesc || "") !== (novo.dietaEspecialDesc || "")) diffs.push({ campo: "Especificação Dieta Especial", de: antigo.dietaEspecialDesc || "Nenhuma", para: novo.dietaEspecialDesc || "Nenhuma" });
    if ((antigo.horarioInicio || "06:00") !== novo.horarioInicio) diffs.push({ campo: "Horário 1ª Refeição", de: antigo.horarioInicio || "06:00", para: novo.horarioInicio });
    if (antigo.volumeMl !== novo.volumeMl) diffs.push({ campo: "Volume Unitário", de: `${antigo.volumeMl} ml`, para: `${novo.volumeMl} ml` });
    if (antigo.vezesDia !== novo.vezesDia) diffs.push({ campo: "Refeições no Dia", de: `${antigo.vezesDia}x/dia`, para: `${novo.vezesDia}x/dia` });
    if (antigo.via !== novo.via) diffs.push({ campo: "Via", de: antigo.via, para: novo.via });
    if (antigo.dispositivo !== novo.dispositivo) diffs.push({ campo: "Dispositivo", de: antigo.dispositivo, para: novo.dispositivo });
    if ((antigo.espessanteObs || "") !== (novo.espessanteObs || "")) diffs.push({ campo: "Observações", de: antigo.espessanteObs || "Sem observações", para: novo.espessanteObs || "Sem observações" });
    if (Boolean(antigo.suspenso) !== Boolean(novo.suspenso)) diffs.push({ campo: "Status", de: antigo.suspenso ? "Suspenso" : "Ativo", para: novo.suspenso ? "Suspenso" : "Ativo" });

    if (diffs.length === 0) {
      diffContainer.innerHTML = `<div class="text-slate-500 italic">Nenhum valor alterado.</div>`;
    } else {
      diffContainer.innerHTML = diffs.map(d => `
        <div class="flex justify-between items-center p-2 rounded bg-white border border-slate-200">
          <span class="font-bold text-slate-700">${d.campo}:</span>
          <div class="flex items-center gap-2">
            <span class="line-through text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">${escapeHtml(String(d.de))}</span>
            <span class="text-slate-400">➔</span>
            <strong class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">${escapeHtml(String(d.para))}</strong>
          </div>
        </div>
      `).join("");
    }

    document.getElementById("modal-confirmar-edicao").classList.remove("hidden");
  },

  cancelarConfirmacaoEdicao() {
    document.getElementById("modal-confirmar-edicao").classList.add("hidden");
    this.edicaoPendente = null;
  },

  async executarGravacaoEdicaoConfirmada() {
    if (!this.edicaoPendente) return;

    const { pacienteId, dadosNovos, pacienteAntigo } = this.edicaoPendente;
    await CensoModule.atualizarPaciente(pacienteId, dadosNovos);
    
    const alteracoes = [];
    if (pacienteAntigo) {
      if (pacienteAntigo.leito !== dadosNovos.leito) alteracoes.push({ campo: "Leito", de: pacienteAntigo.leito, para: dadosNovos.leito });
      if (pacienteAntigo.dietaNome !== dadosNovos.dietaNome) alteracoes.push({ campo: "Dieta", de: pacienteAntigo.dietaNome, para: dadosNovos.dietaNome });
      if ((pacienteAntigo.dietaEspecialDesc || "") !== (dadosNovos.dietaEspecialDesc || "")) alteracoes.push({ campo: "Especificação Dieta Especial", de: pacienteAntigo.dietaEspecialDesc || "-", para: dadosNovos.dietaEspecialDesc || "-" });
      if ((pacienteAntigo.horarioInicio || "06:00") !== dadosNovos.horarioInicio) alteracoes.push({ campo: "Horário 1ª Refeição", de: pacienteAntigo.horarioInicio || "06:00", para: dadosNovos.horarioInicio });
      if (pacienteAntigo.volumeMl !== dadosNovos.volumeMl) alteracoes.push({ campo: "Volume Unitário", de: `${pacienteAntigo.volumeMl} ml`, para: `${dadosNovos.volumeMl} ml` });
      if (pacienteAntigo.vezesDia !== dadosNovos.vezesDia) alteracoes.push({ campo: "Refeições no Dia", de: `${pacienteAntigo.vezesDia}x/dia`, para: `${dadosNovos.vezesDia}x/dia` });
      if (pacienteAntigo.via !== dadosNovos.via) alteracoes.push({ campo: "Via", de: pacienteAntigo.via, para: dadosNovos.via });
      if (pacienteAntigo.dispositivo !== dadosNovos.dispositivo) alteracoes.push({ campo: "Dispositivo", de: pacienteAntigo.dispositivo, para: dadosNovos.dispositivo });
      if ((pacienteAntigo.espessanteObs || "") !== (dadosNovos.espessanteObs || "")) alteracoes.push({ campo: "Observações", de: pacienteAntigo.espessanteObs || "-", para: dadosNovos.espessanteObs || "-" });
      if (Boolean(pacienteAntigo.suspenso) !== Boolean(dadosNovos.suspenso)) alteracoes.push({ campo: "Status", de: pacienteAntigo.suspenso ? "Suspenso" : "Ativo", para: dadosNovos.suspenso ? "Suspenso" : "Ativo" });

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "PACIENTES",
          "EDICAO",
          `Prescrição editada: ${dadosNovos.nome} (Leito: ${dadosNovos.leito})`,
          alteracoes,
          { pacienteId, leito: dadosNovos.leito, nome: dadosNovos.nome }
        );
      }
    }

    document.getElementById("modal-confirmar-edicao").classList.add("hidden");
    this.edicaoPendente = null;

    if (typeof LoteEsteiraModule !== "undefined" && LoteEsteiraModule.esteiraEdicao.ativa) {
      LoteEsteiraModule.salvarAvancarEsteira(pacienteAntigo, dadosNovos, alteracoes);
      return;
    }

    this.fecharModalPaciente();
    this.mostrarToast(`Alterações em ${dadosNovos.nome} gravadas com sucesso!`, "success");
    this.renderizarTudo();
  },

  // Excluir Paciente
  async excluirPaciente(pacienteId) {
    const paciente = CensoModule.obterPorId(pacienteId);
    if (!paciente) return;

    const confirmacao = confirm(
      `⚠️ CONFIRMAÇÃO DE EXCLUSÃO\n\n` +
      `Deseja realmente remover do censo o paciente:\n` +
      `• Nome: ${paciente.nome}\n` +
      `• Leito: ${paciente.leito}\n` +
      `• Enfermaria: ${paciente.enfermariaNome || paciente.enfermaria}\n\n` +
      `Esta ação poderá ser desfeita a qualquer momento pelo botão "Desfazer".`
    );

    if (confirmacao) {
      await CensoModule.removerPaciente(pacienteId);

      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.registrar(
          "PACIENTES",
          "EXCLUSAO",
          `Paciente removido do censo: ${paciente.nome} (Leito: ${paciente.leito})`,
          [{ campo: "Status", de: "Ativo no Censo", para: "Excluído" }],
          { pacienteId: paciente.id, leito: paciente.leito, nome: paciente.nome }
        );
      }

      this.mostrarToast(`Paciente ${paciente.nome} removido do censo. (Clique em Desfazer para restaurar)`, "warning");
      this.renderizarTudo();
    }
  },

  // Impressão da Planilha de Censo Selecionada (Autoclavada, Não Autoclavada, Dieta Especial ou Todas as Planilhas)
  imprimirPlanilhaCensoA4() {
    const visao = (typeof PlanilhasCensoModule !== "undefined") ? PlanilhasCensoModule.visaoAtiva : "autoclavada";
    const lista = CensoModule.getPacientesInternados();
    
    if (typeof PlanilhasCensoModule !== "undefined") {
      PlanilhasCensoModule.imprimirA4(visao, lista);
    }
  },

  // Impressão da Visualização Atual da Produção (Mapa de Bancada ou Somas)
  imprimirBancadaAtual() {
    const visao = (typeof BancadaModule !== "undefined") ? BancadaModule.visaoAtiva : "bancada";
    if (visao === "bancada") {
      const ativos = CensoModule.getPacientesAtivos();
      const calculo = BancadaModule.calcularProducao(ativos, this.dietasCatalogo);
      BancadaModule.imprimirFolhaBancada(calculo);
    } else {
      BancadaModule.imprimirFolhaSoma(visao);
    }
  },

  // Impressão da Folha de Produção / Bancada A4 (Compatibilidade)
  imprimirFolhaBancada() {
    this.imprimirBancadaAtual();
  },

  // Impressão de Etiqueta Individual (SOMENTE A DESTE PACIENTE)
  imprimirEtiquetaIndividual(pacienteId) {
    const paciente = CensoModule.obterPorId(pacienteId);
    if (!paciente) return;
    if (paciente.suspenso || paciente.alta) {
      this.mostrarToast("Não é possível imprimir etiqueta de paciente suspenso ou com alta!", "warning");
      return;
    }
    EtiquetasModule.imprimirUnica(paciente, "TODOS", this.nutricionista);
  },

  // Seleção Master no Cabeçalho da Coluna SEL
  alternarMarcarTodasEtiquetasHeader(marcar) {
    document.querySelectorAll(".checkbox-etiqueta").forEach(cb => {
      cb.checked = marcar;
    });
    this.atualizarContadorEtiquetas();
  },

  // Seleção e Impressão em Lote de Etiquetas
  alternarSelecionarTodasEtiquetas(marcar) {
    document.querySelectorAll(".checkbox-etiqueta").forEach(cb => {
      cb.checked = marcar;
    });
    this.atualizarContadorEtiquetas();
  },

  atualizarSelecaoEtiquetas() {
    this.atualizarContadorEtiquetas();
  },

  atualizarContadorEtiquetas() {
    const todos = Array.from(document.querySelectorAll(".checkbox-etiqueta"));
    const marcados = todos.filter(cb => cb.checked).map(cb => cb.value);
    
    const contador = document.getElementById("etiquetas-contador-selecionadas");
    if (contador) {
      contador.innerText = `${marcados.length} selecionadas`;
    }

    const headerCheck = document.getElementById("etiquetas-check-todos-header");
    if (headerCheck) {
      if (todos.length === 0) {
        headerCheck.checked = false;
        headerCheck.indeterminate = false;
      } else if (marcados.length === todos.length) {
        headerCheck.checked = true;
        headerCheck.indeterminate = false;
      } else if (marcados.length === 0) {
        headerCheck.checked = false;
        headerCheck.indeterminate = false;
      } else {
        headerCheck.checked = false;
        headerCheck.indeterminate = true;
      }
    }
  },

  // Dispara Impressão das Etiquetas Selecionadas (Motor Inteligente ZPL / Fallback HTML)
  imprimirEtiquetasSelecionadas() {
    const idsMarcados = Array.from(document.querySelectorAll(".checkbox-etiqueta:checked")).map(cb => cb.value);
    if (idsMarcados.length === 0) {
      this.mostrarToast("Selecione pelo menos um paciente para imprimir etiquetas.", "warning");
      return;
    }

    const multiplicador = document.getElementById("etiquetas-multiplicador-frascos")?.checked ?? true;
    EtiquetasModule.multiplicadorPorVezes = multiplicador;

    const pacientesParaImprimir = idsMarcados
      .map(id => CensoModule.obterPorId(id))
      .filter(p => p && !p.suspenso && !p.alta);

    const turnoSelect = document.getElementById("etiquetas-filtro-turno");
    const turno = turnoSelect ? turnoSelect.value : "TODOS";

    EtiquetasModule.imprimirLote(pacientesParaImprimir, turno, this.nutricionista);
  },

  imprimirLoteSelecionado() {
    this.imprimirEtiquetasSelecionadas();
  },

  // Dispara Impressão de Teste ZPL para Calibrar Sensor de GAP na Zebra ZD230
  async imprimirTesteZebra() {
    this.mostrarToast("Enviando etiqueta de teste ZPL (100×45mm) para a Zebra ZD230...", "info");
    try {
      await EtiquetasModule.imprimirTesteZpl(this.nutricionista);
      this.mostrarToast("⚡ Etiqueta de teste enviada com sucesso para a Zebra ZD230!", "success");
      this.atualizarStatusImpressoraZebra();
    } catch (err) {
      this.mostrarToast(`Comunicação ZPL direta indisponível: ${err.message}. Certifique-se de que o Zebra Browser Print está aberto.`, "warning");
      this.atualizarStatusImpressoraZebra();
    }
  },

  // Atualiza o Indicador Visual de Conexão com a Impressora Térmica
  async atualizarStatusImpressoraZebra() {
    const statusEl = document.getElementById("etiquetas-status-impressora");
    const dotEl = document.getElementById("etiquetas-status-dot");
    const txtEl = document.getElementById("etiquetas-status-txt");
    if (!statusEl || !txtEl) return;

    const res = await EtiquetasModule.verificarConexaoZebra();
    if (res.sucesso) {
      statusEl.className = "px-2.5 py-0.5 text-xs font-black bg-emerald-950/80 text-emerald-300 rounded-full border border-emerald-500/50 inline-flex items-center gap-1 font-mono";
      if (dotEl) dotEl.innerText = "⚡";
      txtEl.innerText = `Zebra ZD230 Online (ZPL)`;
    } else {
      statusEl.className = "px-2.5 py-0.5 text-xs font-black bg-purple-900/70 text-purple-200 rounded-full border border-purple-400/40 inline-flex items-center gap-1 font-mono";
      if (dotEl) dotEl.innerText = "🌐";
      txtEl.innerText = `Modo Navegador (HTML)`;
    }
  },

  // Salvar URL da API do Google Apps Script
  salvarConfigApi() {
    const url = document.getElementById("config-api-url").value;
    ApiService.setApiUrl(url);
    this.atualizarStatusConexao();
    this.mostrarToast("Configuração de API salva com sucesso!", "success");
  },

  // Testar Conexão com o Google Sheets
  async testarConexaoApi() {
    const url = document.getElementById("config-api-url").value;
    if (!url) {
      this.mostrarToast("Informe a URL do Google Apps Script.", "warning");
      return;
    }

    this.mostrarToast("Testando conexão com Google Sheets...", "info");
    try {
      const res = await fetch(`${url.trim()}?action=ping`);
      const data = await res.json();
      if (data.status === "success") {
        this.mostrarToast("Conexão com Google Apps Script estabelecida!", "success");
        ApiService.setApiUrl(url);
        this.atualizarStatusConexao();
      } else {
        this.mostrarToast("Resposta inesperada do servidor.", "error");
      }
    } catch (e) {
      this.mostrarToast("Falha na conexão. Verifique se o Apps Script foi implantado como 'Qualquer pessoa'.", "error");
    }
  },

  // Sincronizar Agora com Google Sheets
  async sincronizarAgora() {
    this.mostrarToast("Sincronizando dados com o Google Sheets...", "info");
    const res = await ApiService.saveCenso(CensoModule.pacientes);
    if (res.synced) {
      this.mostrarToast("Sincronização com Google Sheets concluída!", "success");
    } else {
      this.mostrarToast("Dados salvos localmente (Google Sheets offline).", "warning");
    }
    this.renderizarTudo();
  },

  // Restaurar Censo Demonstrativo
  restaurarDemonstrativo() {
    if (confirm("Deseja recarregar os dados do censo oficial do Lactário HSP?")) {
      ApiService.resetToMock();
      CensoModule.init().then(() => {
        this.renderizarTudo();
        this.mostrarToast("Dados oficiais do HSP restaurados com sucesso!", "info");
      });
    }
  },

  // Atualiza Indicador Visual de Conexão no Header
  atualizarStatusConexao() {
    const badge = document.getElementById("conexao-status-badge");
    const apiUrl = ApiService.getApiUrl();

    if (badge) {
      if (apiUrl) {
        badge.innerHTML = `
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
          <span class="text-xs font-black text-emerald-950">Google Sheets Conectado</span>
        `;
        badge.className = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300";
      } else {
        badge.innerHTML = `
          <span class="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
          <span class="text-xs font-black text-sky-950">Modo Local / Offline</span>
        `;
        badge.className = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-100 border border-sky-300";
      }
    }
  },

  // =========================================================================
  // GESTÃO DE PONTOS DE RESTAURAÇÃO E VERSIONAMENTO DE CATÁLOGOS
  // =========================================================================

  renderizarVersoes() {
    if (typeof VersionamentoModule !== "undefined") {
      VersionamentoModule.renderizarTabela();
    }
  },

  abrirModalNovoSnapshot() {
    const modal = document.getElementById("modal-novo-snapshot");
    if (!modal) return;

    const inputNome = document.getElementById("modal-snapshot-nome");
    const inputMotivo = document.getElementById("modal-snapshot-motivo");

    if (inputNome) {
      inputNome.value = (typeof VersionamentoModule !== "undefined") 
        ? VersionamentoModule.gerarNomePadrao() 
        : `Valores_Catálogo_${Date.now()}`;
    }
    if (inputMotivo) inputMotivo.value = "";

    modal.classList.remove("hidden");
  },

  fecharModalNovoSnapshot() {
    const modal = document.getElementById("modal-novo-snapshot");
    if (modal) modal.classList.add("hidden");
  },

  salvarNovoSnapshotManual(event) {
    if (event && event.preventDefault) event.preventDefault();

    const nome = document.getElementById("modal-snapshot-nome")?.value.trim() || "";
    const motivo = document.getElementById("modal-snapshot-motivo")?.value.trim() || "Ponto de restauração manual criado pelo nutricionista";

    if (!nome) {
      this.mostrarToast("Informe o nome do ponto de restauração.", "warning");
      return;
    }

    if (typeof VersionamentoModule !== "undefined") {
      const snap = VersionamentoModule.criarSnapshot("MANUAL", motivo, nome);
      this.fecharModalNovoSnapshot();
      this.renderizarVersoes();
      this.mostrarToast(`Ponto de restauração "${snap.nome}" criado com sucesso!`, "success");
    }
  },

  abrirComparativoSnapshot(snapshotId) {
    if (typeof VersionamentoModule === "undefined") return;

    const diffs = VersionamentoModule.compararComAtual(snapshotId);
    if (!diffs) {
      this.mostrarToast("Versão não encontrada.", "warning");
      return;
    }

    const modal = document.getElementById("modal-diff-snapshot");
    const tituloEl = document.getElementById("modal-diff-titulo");
    const infoEl = document.getElementById("modal-diff-info-versao");
    const conteudoEl = document.getElementById("modal-diff-conteudo");
    const btnRestaurar = document.getElementById("btn-confirmar-restaurar-diff");

    if (tituloEl) tituloEl.innerText = `Comparativo: ${diffs.snapshot.nome}`;
    if (infoEl) {
      infoEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="font-bold text-slate-900">${escapeHtml(diffs.snapshot.nome)}</div>
            <div class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(diffs.snapshot.motivo || '-')} • Autor: <strong>${escapeHtml(diffs.snapshot.responsavel || '-')}</strong></div>
          </div>
          <span class="px-2 py-1 rounded-full text-xs font-mono font-bold ${diffs.totalModificacoes > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'}">
            ${diffs.totalModificacoes} diferença(s) encontrada(s)
          </span>
        </div>
      `;
    }

    if (conteudoEl) {
      if (diffs.totalModificacoes === 0) {
        conteudoEl.innerHTML = `
          <div class="p-6 text-center text-slate-400 bg-purple-50/30 rounded-xl border border-purple-100">
            <div class="text-3xl mb-1.5">✨</div>
            <div class="font-bold text-xs text-slate-700">Esta versão é idêntica ao estado atual dos catálogos!</div>
            <p class="text-[11px] text-slate-400 mt-1">Nenhuma fórmula, enfermaria, via ou parâmetro foi modificado desde este ponto.</p>
          </div>
        `;
      } else {
        let htmlDiff = "";

        // Fórmulas
        if (diffs.formulas.modificados.length > 0 || diffs.formulas.adicionados.length > 0 || diffs.formulas.removidos.length > 0) {
          htmlDiff += `
            <div class="border border-purple-200 rounded-xl overflow-hidden shadow-2xs">
              <div class="bg-purple-100/80 px-3 py-2 text-xs font-black text-purple-950 flex items-center justify-between border-b border-purple-200">
                <span>🧪 Fórmulas e Concentrações</span>
                <span class="font-mono text-[10.5px]">${diffs.formulas.modificados.length + diffs.formulas.adicionados.length + diffs.formulas.removidos.length} alteração(ões)</span>
              </div>
              <div class="p-3 bg-white space-y-2 text-xs">
                ${diffs.formulas.modificados.map(m => `
                  <div class="p-2 rounded-lg bg-purple-50/50 border border-purple-100">
                    <div class="font-bold text-slate-900 mb-1">${escapeHtml(m.nome)}</div>
                    ${m.campos.map(c => `
                      <div class="text-[11px] flex items-center gap-1.5 ml-2">
                        <span class="font-semibold text-slate-600">${escapeHtml(c.campo)}:</span>
                        <span class="line-through text-rose-600 bg-rose-50 px-1 rounded">${escapeHtml(c.valorAtual || '(vazio)')}</span>
                        <span class="text-slate-400">➔</span>
                        <span class="font-bold text-emerald-700 bg-emerald-50 px-1 rounded">${escapeHtml(c.valorVersao || '(vazio)')}</span>
                      </div>
                    `).join("")}
                  </div>
                `).join("")}
                ${diffs.formulas.adicionados.map(a => `
                  <div class="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                    <span>➕ <strong>${escapeHtml(a.nome)}</strong> (Será restaurada)</span>
                    <span class="text-[10px] font-mono font-bold">${a.porcentagem || a.g_po_100ml + '%'}</span>
                  </div>
                `).join("")}
                ${diffs.formulas.removidos.map(r => `
                  <div class="p-2 rounded-lg bg-rose-50/60 border border-rose-200 text-rose-950 flex items-center justify-between">
                    <span>🗑️ <strong>${escapeHtml(r.nome)}</strong> (Não existe nesta versão)</span>
                  </div>
                `).join("")}
              </div>
            </div>
          `;
        }

        // Enfermarias
        if (diffs.enfermarias.modificados.length > 0 || diffs.enfermarias.adicionados.length > 0 || diffs.enfermarias.removidos.length > 0) {
          htmlDiff += `
            <div class="border border-blue-200 rounded-xl overflow-hidden shadow-2xs">
              <div class="bg-blue-100/80 px-3 py-2 text-xs font-black text-blue-950 flex items-center justify-between border-b border-blue-200">
                <span>🏥 Enfermarias e Unidades</span>
                <span class="font-mono text-[10.5px]">${diffs.enfermarias.modificados.length + diffs.enfermarias.adicionados.length + diffs.enfermarias.removidos.length} alteração(ões)</span>
              </div>
              <div class="p-3 bg-white space-y-2 text-xs">
                ${diffs.enfermarias.modificados.map(m => `
                  <div class="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                    <div class="font-bold text-slate-900 mb-1">${escapeHtml(m.nome)}</div>
                    ${m.campos.map(c => `
                      <div class="text-[11px] flex items-center gap-1.5 ml-2">
                        <span class="font-semibold text-slate-600">${escapeHtml(c.campo)}:</span>
                        <span class="line-through text-rose-600 bg-rose-50 px-1 rounded">${escapeHtml(c.valorAtual || '(vazio)')}</span>
                        <span class="text-slate-400">➔</span>
                        <span class="font-bold text-emerald-700 bg-emerald-50 px-1 rounded">${escapeHtml(c.valorVersao || '(vazio)')}</span>
                      </div>
                    `).join("")}
                  </div>
                `).join("")}
              </div>
            </div>
          `;
        }

        conteudoEl.innerHTML = htmlDiff;
      }
    }

    if (btnRestaurar) {
      btnRestaurar.onclick = () => {
        this.fecharModalDiffSnapshot();
        this.restaurarVersaoSnapshot(snapshotId);
      };
    }

    if (modal) modal.classList.remove("hidden");
  },

  fecharModalDiffSnapshot() {
    const modal = document.getElementById("modal-diff-snapshot");
    if (modal) modal.classList.add("hidden");
  },

  restaurarVersaoSnapshot(snapshotId) {
    if (typeof VersionamentoModule === "undefined") return;

    const snap = VersionamentoModule.obterPorId(snapshotId);
    if (!snap) return;

    const confirmacao = confirm(
      `⚠️ CONFIRMAÇÃO DE RESTAURAÇÃO DE CATÁLOGO\n\n` +
      `Deseja realmente reverter todos os catálogos para a versão:\n` +
      `• "${snap.nome}"\n` +
      `• Data: ${snap.dataHoraFormatada}\n` +
      `• Autor: ${snap.responsavel}\n\n` +
      `Um backup de segurança do estado atual será criado automaticamente antes da restauração.`
    );

    if (confirmacao) {
      const ok = VersionamentoModule.restaurarVersao(snapshotId);
      if (ok) {
        this.renderizarVersoes();
        this.mostrarToast(`Catálogos restaurados para a versão "${snap.nome}" com sucesso!`, "success");
      }
    }
  },

  exportarVersaoSnapshot(snapshotId) {
    if (typeof VersionamentoModule !== "undefined") {
      VersionamentoModule.exportarVersaoJSON(snapshotId);
      this.mostrarToast("Arquivo JSON da versão baixado com sucesso!", "info");
    }
  },

  importarVersaoSnapshotArquivo(event) {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const conteudo = e.target.result;
        const snap = VersionamentoModule.importarVersaoJSON(conteudo);
        this.renderizarVersoes();
        this.mostrarToast(`Versão "${snap.nome}" importada com sucesso!`, "success");
      } catch (err) {
        alert("Erro ao importar arquivo JSON: " + (err.message || "Arquivo corrompido ou formato inválido"));
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  },

  // =========================================================================
  // GESTÃO DO LOG DE AUDITORIA E HISTÓRICO DE MODIFICAÇÕES
  // =========================================================================

  renderizarAuditoria() {
    if (typeof AuditLogModule !== "undefined") {
      const filtros = this.obterFiltrosAuditoria();
      AuditLogModule.renderizarTabela(filtros);
    }
  },

  obterFiltrosAuditoria() {
    return {
      termoBusca: document.getElementById("config-busca-auditoria")?.value || "",
      modulo: document.getElementById("config-filtro-auditoria-modulo")?.value || "TODOS",
      acao: document.getElementById("config-filtro-auditoria-acao")?.value || "TODAS"
    };
  },

  filtrarLogsAuditoria() {
    this.renderizarAuditoria();
  },

  exportarLogsAuditoriaCSV() {
    if (typeof AuditLogModule !== "undefined") {
      const filtros = this.obterFiltrosAuditoria();
      AuditLogModule.exportarCSV(filtros);
      this.mostrarToast("Arquivo CSV de auditoria exportado com sucesso!", "info");
    }
  },

  limparLogsAuditoria() {
    if (confirm("⚠️ Tem certeza que deseja limpar todo o histórico de auditoria? Esta ação não pode ser desfeita.")) {
      if (typeof AuditLogModule !== "undefined") {
        AuditLogModule.limparLogs();
        this.renderizarAuditoria();
        this.mostrarToast("Histórico de auditoria limpo com sucesso.", "warning");
      }
    }
  },

  verDetalhesLogAuditoria(logId) {
    if (typeof AuditLogModule === "undefined") return;

    const log = AuditLogModule.obterPorId(logId);
    if (!log) return;

    const modal = document.getElementById("modal-detalhes-auditoria");
    const headerEl = document.getElementById("modal-detalhes-auditoria-header");
    const listaEl = document.getElementById("modal-detalhes-auditoria-lista");

    if (headerEl) {
      const mod = AuditLogModule.MODULOS[log.modulo] || { label: log.modulo };
      const acao = AuditLogModule.ACOES[log.acao] || { label: log.acao };

      headerEl.innerHTML = `
        <div class="space-y-1">
          <div class="font-black text-slate-950 text-sm">${escapeHtml(log.titulo || '-')}</div>
          <div class="text-[11px] text-slate-600 flex flex-wrap gap-2 items-center">
            <span>📅 <strong>${log.dataHoraFormatada}</strong></span>
            <span>•</span>
            <span>👤 <strong>${escapeHtml(log.responsavel || '-')}</strong></span>
            <span>•</span>
            <span class="font-bold text-purple-900">[${mod.label} • ${acao.label}]</span>
          </div>
          ${log.metadata && log.metadata.motivo ? `
            <div class="text-[11px] text-purple-900 bg-purple-100/60 p-2 rounded-lg mt-1 italic">
              <strong>Motivo:</strong> ${escapeHtml(log.metadata.motivo)}
            </div>
          ` : ''}
        </div>
      `;
    }

    if (listaEl) {
      if (!log.alteracoes || log.alteracoes.length === 0) {
        listaEl.innerHTML = `
          <tr>
            <td colspan="3" class="py-4 text-center text-slate-400 text-xs">Nenhum campo específico registrado.</td>
          </tr>
        `;
      } else {
        listaEl.innerHTML = log.alteracoes.map(a => `
          <tr class="hover:bg-purple-50/40 transition-colors">
            <td class="py-2 px-3 font-bold text-slate-900">${escapeHtml(a.campo)}</td>
            <td class="py-2 px-3 text-rose-700 bg-rose-50/40 line-through font-mono text-[11px]">${escapeHtml(a.de || '(vazio)')}</td>
            <td class="py-2 px-3 text-emerald-800 bg-emerald-50/40 font-bold font-mono text-[11px]">${escapeHtml(a.para || '(vazio)')}</td>
          </tr>
        `).join("");
      }
    }

    if (modal) modal.classList.remove("hidden");
  },

  fecharModalDetalhesAuditoria() {
    const modal = document.getElementById("modal-detalhes-auditoria");
    if (modal) modal.classList.add("hidden");
  },

  // Exibir Toast
  mostrarToast(mensagem, tipo = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    let bgClass = "bg-slate-950 text-white border-slate-700";
    let icon = "ℹ️";

    if (tipo === "success") {
      bgClass = "bg-emerald-900 text-white border-emerald-700";
      icon = "✅";
    } else if (tipo === "warning") {
      bgClass = "bg-amber-900 text-white border-amber-700";
      icon = "⚠️";
    } else if (tipo === "error") {
      bgClass = "bg-rose-900 text-white border-rose-700";
      icon = "❌";
    }

    toast.className = `toast px-4 py-3 rounded-xl shadow-xl border text-xs font-black flex items-center gap-2.5 ${bgClass}`;
    toast.innerHTML = `<span>${icon}</span><span>${mensagem}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

// Inicialização Global
window.addEventListener("DOMContentLoaded", () => {
  App.init();
});

if (typeof window !== "undefined") {
  window.App = App;
}
