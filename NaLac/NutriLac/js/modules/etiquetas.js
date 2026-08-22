/**
 * Módulo de Impressão de Etiquetas Térmicas Zebra (100mm × 45mm / 203 DPI)
 * Modelo Oficial - Hospital São Paulo (UNIFESP-EPM) - Nutrição e Lactário
 * Suporte Duplo: Motor ZPL II Nativo (1-Clique via Zebra Browser Print) e Fallback HTML/CSS (@media print)
 */

const EtiquetasModule = {
  selecionados: new Set(),
  multiplicadorPorVezes: true, // Padrão: 1 etiqueta por frasco do dia
  filtroTexto: "",
  filtroEnfermaria: "TODAS",
  filtroCategoria: "TODAS",
  filtroDispositivo: "TODOS",
  filtroTurno: "TODOS", // "TODOS", "MANHA", "NOITE"

  // Configuração do Motor de Impressão Térmica
  MODOS: {
    AUTO: "AUTO",       // Tenta ZPL direto; se indisponível, faz fallback automático para HTML
    ZPL: "ZPL",         // Força envio em código nativo ZPL II
    HTML: "HTML"        // Força diálogo de impressão do navegador (HTML / CSS)
  },
  modoImpressao: "AUTO",
  zebraEndpoint: "http://localhost:9100",
  impressoraDetectada: null,
  statusConexaoZebra: "DESCONHECIDO", // "CONECTADO", "DESCONECTADO", "DESCONHECIDO"

  // Utilitário para sanitização de caracteres em ZPL II
  sanitizarZpl(str) {
    if (!str) return "";
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos gráficos para máxima compatibilidade
      .replace(/[^\x20-\x7E]/g, " ")   // Mantém apenas caracteres ASCII imprimíveis
      .replace(/[\^~]/g, "")           // Remove caracteres de controle ZPL (^ e ~)
      .trim();
  },

  // Valida se um determinado horário pertence ao turno especificado
  // Turno Manhã/Tarde: 12:00 até 18:00
  // Turno Noite/Madrugada: 20:00 até 10:00 do dia seguinte
  pertenceAoTurno(hInicioStr, turno = "TODOS") {
    if (!turno || turno === "TODOS") return true;
    if (!hInicioStr) return false;

    const [h, m] = hInicioStr.split(":").map(Number);
    const minutos = h * 60 + (m || 0);

    if (turno === "MANHA") {
      // 12:00 (720 min) até 18:00 (1080 min)
      return minutos >= 720 && minutos <= 1080;
    }

    if (turno === "NOITE") {
      // 20:00 (1200 min) até 23:59 (1439 min) OU 00:00 (0 min) até 10:00 (600 min)
      return (minutos >= 1200 && minutos <= 1439) || (minutos >= 0 && minutos <= 600);
    }

    return true;
  },

  // Calcular grade de horários e datas para as mamadeiras/frascos do dia
  calcularHorariosFrascos(paciente, dataBase = new Date()) {
    if (!paciente) return [];

    const horariosAtivos = CensoModule.obterHorariosAtivosPaciente(paciente);
    const totalFrascos = horariosAtivos.length;

    const [hBaseStr, mBaseStr] = (paciente.horarioInicio || "06:00").split(":");
    const hBase = parseInt(hBaseStr, 10) || 6;
    const mBase = parseInt(mBaseStr, 10) || 0;
    const minutosBase = hBase * 60 + mBase;

    const lista = [];
    horariosAtivos.forEach((horaStr, index) => {
      const [h, m] = horaStr.split(":").map(Number);
      const minutosRefeicao = h * 60 + (m || 0);

      let diasExtras = 0;
      if (minutosRefeicao < minutosBase) {
        diasExtras = 1;
      }

      const dataInicio = new Date(dataBase.getTime());
      dataInicio.setDate(dataInicio.getDate() + diasExtras);
      dataInicio.setHours(h, m || 0, 0, 0);

      const dataTermino = new Date(dataInicio.getTime() + 2 * 60 * 60 * 1000);

      lista.push({
        frascoIndice: index + 1,
        totalFrascos: totalFrascos,
        hInicioStr: horaStr,
        hTerminoStr: `${String(dataTermino.getHours()).padStart(2, "0")}:${String(dataTermino.getMinutes()).padStart(2, "0")}`,
        dataInicioStr: `${String(dataInicio.getDate()).padStart(2, "0")}/${String(dataInicio.getMonth() + 1).padStart(2, "0")}/${dataInicio.getFullYear()}`,
        dataValidadeStr: `${String(dataTermino.getDate()).padStart(2, "0")}/${String(dataTermino.getMonth() + 1).padStart(2, "0")}/${dataTermino.getFullYear()}`,
        virouMadrugada: diasExtras > 0
      });
    });

    return lista;
  },

  // Filtra a lista de pacientes ativos para a central de etiquetas com filtros inteligentes
  getPacientesFiltrados(pacientesAtivos, dietasCatalogo) {
    const dietasMap = new Map();
    if (dietasCatalogo) {
      dietasCatalogo.forEach(d => dietasMap.set(d.id, d));
    }

    return (pacientesAtivos || []).filter(p => {
      // 0. Pacientes com dieta suspensa ou alta hospitalar NÃO entram na emissão de etiquetas
      if (p.suspenso || p.alta) return false;

      // 1. Filtro de Texto (Leito, Nome, RH, Dieta)
      if (this.filtroTexto) {
        const termo = this.filtroTexto.toLowerCase().trim();
        const match = 
          (p.nome && p.nome.toLowerCase().includes(termo)) ||
          (p.rh && p.rh.toLowerCase().includes(termo)) ||
          (p.leito && p.leito.toLowerCase().includes(termo)) ||
          (p.dietaNome && p.dietaNome.toLowerCase().includes(termo)) ||
          (p.enfermariaNome && p.enfermariaNome.toLowerCase().includes(termo));
        if (!match) return false;
      }

      // 2. Filtro por Enfermaria
      if (this.filtroEnfermaria !== "TODAS" && p.enfermaria !== this.filtroEnfermaria) {
        return false;
      }

      // 3. Filtro por Categoria de Dieta
      if (this.filtroCategoria !== "TODAS") {
        const dietaObj = dietasMap.get(p.dietaId);
        if (!dietaObj || dietaObj.categoria !== this.filtroCategoria) {
          return false;
        }
      }

      // 4. Filtro por Dispositivo
      if (this.filtroDispositivo !== "TODOS" && p.dispositivo !== this.filtroDispositivo) {
        return false;
      }

      // 5. Filtro por Turno
      if (this.filtroTurno !== "TODOS") {
        const horarios = this.calcularHorariosFrascos(p);
        const temHorarioNoTurno = horarios.some(h => this.pertenceAoTurno(h.hInicioStr, this.filtroTurno));
        if (!temHorarioNoTurno) return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.enfermaria === b.enfermaria) {
        return (a.leito || "").localeCompare(b.leito || "");
      }
      return (a.enfermaria || "").localeCompare(b.enfermaria || "");
    });
  },

  // =========================================================================
  // 🖨️ MOTOR ZPL II: GERAÇÃO VETORIAL NATIVA PARA ZEBRA ZD230 (100mm × 45mm)
  // =========================================================================

  /**
   * Gera o código ZPL II individual de uma etiqueta térmica (203 DPI / 800×360 dots)
   */
  gerarZplEtiqueta(paciente, infoHorario = null, dadosNutri = null) {
    if (!paciente) return "";
    const agora = new Date();

    if (!infoHorario) {
      const horarios = this.calcularHorariosFrascos(paciente, agora);
      infoHorario = horarios[0] || {
        frascoIndice: 1,
        totalFrascos: 1,
        hInicioStr: "06:00",
        hTerminoStr: "08:00",
        dataInicioStr: `${String(agora.getDate()).padStart(2, "0")}/${String(agora.getMonth() + 1).padStart(2, "0")}/${agora.getFullYear()}`,
        dataValidadeStr: `${String(agora.getDate()).padStart(2, "0")}/${String(agora.getMonth() + 1).padStart(2, "0")}/${agora.getFullYear()}`
      };
    }

    const safeNome = this.sanitizarZpl(paciente.nome || "SEM IDENTIFICACAO").toUpperCase();
    const safeLeito = this.sanitizarZpl(paciente.leito || "S/L").toUpperCase();
    const safeEnfermaria = this.sanitizarZpl(paciente.enfermariaNome || paciente.enfermaria || "").toUpperCase()
      .replace("UI ", "").replace("UTI ", "");
    const safeRh = this.sanitizarZpl(paciente.rh || "---");
    
    let safeDieta = this.sanitizarZpl(paciente.dietaNome || "FORMULA PADRAO").toUpperCase();
    if (paciente.dietaEspecialDesc) {
      safeDieta += ` (${this.sanitizarZpl(paciente.dietaEspecialDesc).toUpperCase()})`;
    }
    
    const safeVia = this.sanitizarZpl(paciente.via || "ENTERAL").toUpperCase();
    const safeDisp = this.sanitizarZpl(paciente.dispositivo || "MAMADEIRA").toUpperCase();
    const safeCal = this.sanitizarZpl(paciente.calCalorico || "67 kcal/100ml");
    const vol = Number(paciente.volumeMl) || 0;
    const vezes = Number(paciente.vezesDia) || infoHorario.totalFrascos || 1;

    const frascoTxt = infoHorario.totalFrascos > 1 
      ? `[FRASCO ${infoHorario.frascoIndice}/${infoHorario.totalFrascos}]` 
      : "";

    const temObs = paciente.espessanteObs && paciente.espessanteObs.trim() !== "" && paciente.espessanteObs !== "Sem espessante";
    const obsTxt = temObs ? ` - OBS: ${this.sanitizarZpl(paciente.espessanteObs).toUpperCase()}` : "";

    const nutriNome = this.sanitizarZpl(dadosNutri?.nome || "NUTRI PLANTAO").toUpperCase();

    // Montagem do Script ZPL II calibrado para 100mm (800 dots) × 45mm (360 dots)
    return `^XA
^PW800
^LL360
^MNY
^LH0,0
^CI28
^FO0,12^A0N,22,22^FB800,1,0,C^FDHOSPITAL SAO PAULO / UNIFESP-EPM - (NUTRICAO)^FS
^FO20,36^GB760,2,2^FS
^FO25,46^A0N,20,20^FDNumero de Atendimento: ${safeRh}^FS
^FO440,42^GB340,32,32,B,0^FS
^FO448,48^A0N,22,22^FR^FDLEITO: ${safeLeito} ${safeEnfermaria}^FS
^FO25,80^A0N,22,22^FDNome: ${safeNome.substring(0, 36)} ${frascoTxt}^FS
^FO20,106^GB760,2,2^FS
^FO20,114^GB760,34,34,B,0^FS
^FO28,120^A0N,22,22^FR^FDDieta/Prod: ${safeDieta.substring(0, 38)}${obsTxt}^FS
^FO620,121^A0N,20,20^FR^FD${safeCal}^FS
^FO25,156^A0N,19,19^FDVia: ${safeVia} (${safeDisp})   Freq: ${vezes}x/dia^FS
^FO20,180^GB760,70,1^FS
^FO28,188^A0N,18,18^FDVolume: ${vol}ml (${vol})   H. Inicio: ${infoHorario.hInicioStr}   H. Termino: ${infoHorario.hTerminoStr}   Data: ${infoHorario.dataInicioStr}^FS
^FO28,218^A0N,16,16^FDLote: ${infoHorario.dataInicioStr.replace(/\\//g, '')}   Gotas/Min: ---   Resp: ${nutriNome.substring(0, 24)}^FS
^FO20,258^GB760,2,2^FS
^FO25,268^A0N,20,20^FDPrazo de validade data: ${infoHorario.dataValidadeStr}   Hora: ${infoHorario.hTerminoStr}^FS
^XZ
`;
  },

  /**
   * Gera a sequência completa de etiquetas em código ZPL II para impressão em lote
   */
  gerarZplLote(pacientesLista, turno = "TODOS", dadosNutri = null) {
    let zplTotal = "";
    const agora = new Date();

    (pacientesLista || []).forEach(paciente => {
      if (paciente.suspenso || paciente.alta) return;

      if (this.multiplicadorPorVezes) {
        const todosHorarios = this.calcularHorariosFrascos(paciente, agora);
        const horariosTurno = (turno && turno !== "TODOS")
          ? todosHorarios.filter(h => this.pertenceAoTurno(h.hInicioStr, turno))
          : todosHorarios;

        horariosTurno.forEach(infoHorario => {
          zplTotal += this.gerarZplEtiqueta(paciente, infoHorario, dadosNutri);
        });
      } else {
        const todosHorarios = this.calcularHorariosFrascos(paciente, agora);
        const infoHorario = (turno && turno !== "TODOS")
          ? todosHorarios.find(h => this.pertenceAoTurno(h.hInicioStr, turno)) || todosHorarios[0]
          : todosHorarios[0];

        if (infoHorario) {
          zplTotal += this.gerarZplEtiqueta(paciente, infoHorario, dadosNutri);
        }
      }
    });

    return zplTotal;
  },

  // =========================================================================
  // 🔌 COMUNICAÇÃO ZEBRA BROWSER PRINT (USB / REDE LOCAL)
  // =========================================================================

  /**
   * Verifica assincronamente se o serviço Zebra Browser Print está ativo no computador
   */
  async verificarConexaoZebra() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${this.zebraEndpoint}/default?type=printer`, {
        method: "GET",
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const printer = await res.json();
        if (printer && printer.name) {
          this.impressoraDetectada = printer;
          this.statusConexaoZebra = "CONECTADO";
          return { sucesso: true, impressora: printer };
        }
      }
    } catch (e) {
      // Falha esperada quando o utilitário não estiver rodando na máquina
    }

    this.impressoraDetectada = null;
    this.statusConexaoZebra = "DESCONECTADO";
    return { sucesso: false };
  },

  /**
   * Envia a carga ZPL bruta diretamente para a porta da impressora Zebra ZD230
   */
  async enviarZplParaImpressora(zplString) {
    if (!zplString || zplString.trim() === "") {
      throw new Error("Conteúdo ZPL vazio.");
    }

    let printer = this.impressoraDetectada;
    if (!printer) {
      const status = await this.verificarConexaoZebra();
      if (status.sucesso) {
        printer = status.impressora;
      }
    }

    if (!printer) {
      throw new Error("Impressora Zebra não detectada no serviço local (Zebra Browser Print).");
    }

    const payload = JSON.stringify({
      device: printer,
      data: zplString
    });

    const res = await fetch(`${this.zebraEndpoint}/write`, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: payload
    });

    if (!res.ok) {
      throw new Error(`Erro ao transmitir para a Zebra (HTTP ${res.status}).`);
    }

    return true;
  },

  // =========================================================================
  // 🚀 DESPACHO INTELIGENTE: ZPL DIRETO COM FALLBACK AUTOMÁTICO PARA HTML
  // =========================================================================

  /**
   * Dispara impressão com estratégia inteligente: tenta ZPL direto; se offline, abre HTML no navegador
   */
  async imprimirEtiquetasInteligente(pacientesLista, turno = "TODOS", dadosNutri = null) {
    const totalPacientes = (pacientesLista || []).filter(p => !p.suspenso && !p.alta).length;
    if (totalPacientes === 0) {
      if (window.App && window.App.mostrarToast) {
        window.App.mostrarToast("Selecione pelo menos um paciente com dieta ativa para imprimir etiquetas.", "warning");
      }
      return;
    }

    // 1. Modo Forçado HTML (Diálogo do Navegador)
    if (this.modoImpressao === this.MODOS.HTML) {
      this.imprimirLoteHTML(pacientesLista, turno);
      return;
    }

    // 2. Modo ZPL Direto ou Modo AUTO Inteligente
    try {
      const zpl = this.gerarZplLote(pacientesLista, turno, dadosNutri);
      if (!zpl || zpl.trim() === "") {
        throw new Error("Nenhum dado gerado para o turno.");
      }

      await this.enviarZplParaImpressora(zpl);

      if (window.App && window.App.mostrarToast) {
        window.App.mostrarToast(`⚡ Lote ZPL enviado com sucesso para a impressora Zebra ZD230!`, "success");
      }
      return;
    } catch (err) {
      console.warn("Comunicação ZPL direta indisponível. Acionando fallback HTML:", err.message);

      if (this.modoImpressao === this.MODOS.ZPL) {
        if (window.App && window.App.mostrarToast) {
          window.App.mostrarToast(`Erro ao imprimir via ZPL: ${err.message}. Verifique se o Zebra Browser Print está aberto.`, "error");
        }
        return;
      }

      // Fallback suave para HTML / Diálogo do Navegador
      if (window.App && window.App.mostrarToast) {
        window.App.mostrarToast(`Zebra Browser Print offline. Abrindo diálogo nativo do navegador...`, "info");
      }
      this.imprimirLoteHTML(pacientesLista, turno);
    }
  },

  /**
   * Imprime uma etiqueta de teste para calibrar o sensor de GAP e testar a ZD230
   */
  async imprimirTesteZpl(dadosNutri = null) {
    const pacienteMock = {
      nome: "TESTE DE ALINHAMENTO ZEBRA ZD230",
      leito: "T01",
      enfermaria: "LACTARIO",
      rh: "99999999",
      dietaNome: "NAN 1 (1:30) CONCENTRADO",
      via: "ORAL",
      dispositivo: "Mamadeira",
      calCalorico: "67 kcal/100ml",
      volumeMl: 120,
      vezesDia: 8,
      horarioInicio: "06:00"
    };

    const zpl = this.gerarZplEtiqueta(pacienteMock, null, dadosNutri);
    return this.enviarZplParaImpressora(zpl);
  },

  // =========================================================================
  // 🖥️ RENDERIZAÇÃO HTML / PREVIEW E FALLBACK (@MEDIA PRINT)
  // =========================================================================

  // Gerar Preview em Tela (Proporção Exata 100mm × 45mm)
  gerarPreviewHTML(paciente) {
    const todosHorarios = this.calcularHorariosFrascos(paciente);
    const horariosTurno = this.filtroTurno !== "TODOS" 
      ? todosHorarios.filter(h => this.pertenceAoTurno(h.hInicioStr, this.filtroTurno))
      : todosHorarios;

    const infoHorario = horariosTurno[0] || todosHorarios[0] || null;
    return this.gerarHtmlEtiqueta(paciente, infoHorario, false);
  },

  // Gerar o HTML da Etiqueta
  gerarHtmlEtiqueta(paciente, infoHorario = null, isPrint = false) {
    const agora = new Date();
    
    if (!infoHorario) {
      const horarios = this.calcularHorariosFrascos(paciente, agora);
      infoHorario = horarios[0];
    }

    const classeContainer = isPrint ? "etiqueta-zebra-print" : "etiqueta-zebra-preview";
    const frascoBadge = (infoHorario && infoHorario.totalFrascos > 1) 
      ? `<span class="etiqueta-frasco-badge">FRASCO ${infoHorario.frascoIndice}/${infoHorario.totalFrascos}</span>` 
      : "";

    const safeNome = escapeHtml(paciente.nome || "SEM IDENTIFICAÇÃO");
    const safeLeito = escapeHtml(paciente.leito || "S/L");
    const safeEnfermaria = escapeHtml(paciente.enfermariaNome || paciente.enfermaria || "");
    const safeRh = escapeHtml(paciente.rh || "---");
    const safeDietaBase = escapeHtml(paciente.dietaNome || "Fórmula Padrão");
    const safeDieta = paciente.dietaEspecialDesc 
      ? `${safeDietaBase} (${escapeHtml(paciente.dietaEspecialDesc)})` 
      : safeDietaBase;
    const safeVia = escapeHtml(paciente.via || "ENTERAL");
    const safeDisp = escapeHtml(paciente.dispositivo || "Mamadeira");
    const safeCal = escapeHtml(paciente.calCalorico || "67 kcal/100ml");

    const temObs = paciente.espessanteObs && paciente.espessanteObs.trim() !== "" && paciente.espessanteObs !== "Sem espessante";
    const obsHtml = temObs
      ? `<span class="etiqueta-obs-badge">OBS: ${escapeHtml(paciente.espessanteObs)}</span>`
      : "";

    const vol = Number(paciente.volumeMl) || 0;

    const innerHtml = `
      <div class="${classeContainer}">
        
        <!-- 1. Cabeçalho Oficial HSP / UNIFESP -->
        <div class="etiqueta-header">
          HOSPITAL SAO PAULO / UNIFESP-EPM - (NUTRICAO)
        </div>

        <!-- 2. Número de Atendimento e Leito / Unidade -->
        <div class="etiqueta-row">
          <div class="etiqueta-rh-text">
            Número de Atendimento: <span class="etiqueta-rh-val">${safeRh}</span>
          </div>
          <div>
            <span class="etiqueta-leito-lbl">Leito:</span>
            <span class="etiqueta-leito-val">
              ${safeLeito} ${escapeHtml(safeEnfermaria.replace("UI ", "").replace("UTI ", ""))}
            </span>
          </div>
        </div>

        <!-- 3. Nome do Paciente -->
        <div class="etiqueta-row">
          <div class="etiqueta-nome-lbl">Nome:</div>
          <div class="etiqueta-nome-val">
            ${safeNome} ${frascoBadge}
          </div>
        </div>

        <!-- 4. Dieta / Produto -->
        <div class="etiqueta-dieta-box">
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            Dieta/Prod: <strong>${safeDieta}</strong> ${obsHtml}
          </div>
          <div class="etiqueta-cal-val">
            ${safeCal}
          </div>
        </div>

        <!-- 5. Linha Clínica: Kcal • Lote • Via • Dispositivo -->
        <div class="etiqueta-clinica">
          <span>Via: <strong style="color: #000000;">${safeVia}</strong> (${safeDisp})</span>
          <span>Freq: <strong style="color: #000000;">${Number(paciente.vezesDia) || (infoHorario ? infoHorario.totalFrascos : 1)}x/dia</strong></span>
        </div>

        <!-- 6. Grade de Horários e Volume (Conforme modelo físico do HSP) -->
        <div class="etiqueta-grade-grid">
          <div>
            <span class="etiqueta-grid-lbl">Volume</span>
            <strong class="etiqueta-grid-val">${vol}ml</strong>
            <span class="etiqueta-grid-lbl">(${vol})</span>
          </div>
          <div>
            <span class="etiqueta-grid-lbl">H. Início</span>
            <strong class="etiqueta-grid-val">${infoHorario.hInicioStr}</strong>
          </div>
          <div>
            <span class="etiqueta-grid-lbl">H. Término</span>
            <strong class="etiqueta-grid-val">${infoHorario.hTerminoStr}</strong>
          </div>
          <div>
            <span class="etiqueta-grid-lbl">Data</span>
            <strong class="etiqueta-grid-val">${infoHorario.dataInicioStr}</strong>
          </div>
        </div>

        <!-- 7. Rodapé Oficial: Prazo de Validade -->
        <div class="etiqueta-footer">
          <div>
            Prazo de validade data: <strong class="etiqueta-validade-val">${infoHorario.dataValidadeStr}</strong>
          </div>
          <div style="text-align: right;">
            Hora: <strong class="etiqueta-validade-val">${infoHorario.hTerminoStr}</strong>
          </div>
        </div>

      </div>
    `;

    if (isPrint) {
      return `<div class="etiqueta-print-sheet-wrapper">${innerHtml}</div>`;
    }
    return innerHtml;
  },

  // Gerar lote de etiquetas HTML
  gerarLoteImpressao(pacientesLista, isPrint = false, turno = "TODOS") {
    let htmlTotal = "";
    const agora = new Date();

    (pacientesLista || []).forEach(paciente => {
      if (paciente.suspenso || paciente.alta) return;

      if (this.multiplicadorPorVezes) {
        const todosHorarios = this.calcularHorariosFrascos(paciente, agora);
        const horariosDoTurno = (turno && turno !== "TODOS")
          ? todosHorarios.filter(h => this.pertenceAoTurno(h.hInicioStr, turno))
          : todosHorarios;

        horariosDoTurno.forEach(infoHorario => {
          htmlTotal += this.gerarHtmlEtiqueta(paciente, infoHorario, isPrint);
        });
      } else {
        const todosHorarios = this.calcularHorariosFrascos(paciente, agora);
        const infoHorario = (turno && turno !== "TODOS")
          ? todosHorarios.find(h => this.pertenceAoTurno(h.hInicioStr, turno)) || todosHorarios[0]
          : todosHorarios[0];

        if (infoHorario) {
          htmlTotal += this.gerarHtmlEtiqueta(paciente, infoHorario, isPrint);
        }
      }
    });

    return htmlTotal;
  },

  // Disparar impressão HTML (Diálogo do Navegador)
  imprimirLoteHTML(pacientesLista, turno = "TODOS") {
    const container = document.getElementById("print-area-zebra");
    if (!container) return;

    const html = this.gerarLoteImpressao(pacientesLista, true, turno);
    if (!html || html.trim() === "") {
      if (window.App && window.App.mostrarToast) {
        window.App.mostrarToast(`Nenhuma etiqueta encontrada para os pacientes selecionados no turno selecionado.`, "warning");
      }
      return;
    }

    container.innerHTML = html;
    document.body.classList.remove("print-bancada-active");
    document.body.classList.add("print-zebra-active");

    const limparImpressao = () => {
      document.body.classList.remove("print-zebra-active");
      document.body.classList.remove("print-bancada-active");
    };

    window.addEventListener("afterprint", limparImpressao, { once: true });
    window.print();
  },

  // Disparar impressão de lote de pacientes
  imprimirLote(pacientesLista, turno = "TODOS", dadosNutri = null) {
    return this.imprimirEtiquetasInteligente(pacientesLista, turno, dadosNutri);
  },

  // Disparar impressão de uma única etiqueta
  imprimirUnica(paciente, turno = "TODOS", dadosNutri = null) {
    return this.imprimirEtiquetasInteligente([paciente], turno, dadosNutri);
  }
};

if (typeof window !== "undefined") {
  window.EtiquetasModule = EtiquetasModule;
}
