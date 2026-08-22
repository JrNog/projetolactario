/**
 * Módulo de Gestão do Censo de Pacientes e Histórico de Altas
 * Lactário - Hospital São Paulo (UNIFESP-EPM)
 */

const CensoModule = {
  pacientes: [],
  filtroTexto: "",
  filtroEnfermaria: "TODAS",
  filtroStatus: "TODOS", // TODOS, ATIVOS, SUSPENSOS, ALTAS
  modoExibicao: "CENSO_ATIVO", // "CENSO_ATIVO" (apenas internados) ou "HISTORICO_GERAL" (inclui altas)
  colunaOrdenacao: "leito",
  direcaoOrdenacao: "asc", // "asc" ou "desc"

  // Pilha de Desfazer (Undo Stack)
  historicoUndo: [],

  // Inicializar dados do censo
  async init() {
    const res = await ApiService.getCenso();
    this.pacientes = res.data;
    return this.pacientes;
  },

  // Alternar ordenação por coluna
  alternarOrdenacao(coluna) {
    if (this.colunaOrdenacao === coluna) {
      this.direcaoOrdenacao = this.direcaoOrdenacao === "asc" ? "desc" : "asc";
    } else {
      this.colunaOrdenacao = coluna;
      this.direcaoOrdenacao = "asc";
    }
  },

  // Gerar grade de horários teóricos (para intervalos de 2h ou 3h)
  gerarHorariosTeoricos(horarioInicio = "06:00", intervaloHoras = 3) {
    const [hStr, mStr] = (horarioInicio || "06:00").split(":");
    const hInicio = parseInt(hStr, 10) || 6;
    const mInicio = parseInt(mStr, 10) || 0;
    const intervalo = parseInt(intervaloHoras, 10) === 2 ? 2 : 3;
    const totalSlots = Math.round(24 / intervalo); // 8 slots para 3h, 12 slots para 2h

    const lista = [];
    for (let i = 0; i < totalSlots; i++) {
      const minutosTotais = (hInicio * 60 + mInicio) + (i * intervalo * 60);
      const minutosDoDia = minutosTotais % (24 * 60);
      const h = Math.floor(minutosDoDia / 60);
      const m = minutosDoDia % 60;
      lista.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
    return lista;
  },

  // Obter horários ativos de um paciente (usa o array explícito de pins se existir, ou calcula o ciclo)
  obterHorariosAtivosPaciente(paciente) {
    if (!paciente) return ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "00:00", "03:00"];
    if (paciente.horariosAtivos && Array.isArray(paciente.horariosAtivos) && paciente.horariosAtivos.length > 0) {
      return paciente.horariosAtivos;
    }
    const intervalo = paciente.intervaloHoras || (Number(paciente.vezesDia) === 12 ? 2 : 3);
    const vezes = Number(paciente.vezesDia) || (intervalo === 2 ? 12 : 8);
    return this.calcularGradeHorarios(paciente.horarioInicio || "06:00", vezes);
  },

  // Calcular horários das refeições conforme vezes ao dia e horário de início
  calcularGradeHorarios(horarioInicio = "06:00", vezesDia = 8) {
    const [hStr, mStr] = (horarioInicio || "06:00").split(":");
    const hInicio = parseInt(hStr, 10) || 6;
    const mInicio = parseInt(mStr, 10) || 0;
    const totalVezes = Math.max(1, parseInt(vezesDia, 10) || 1);
    const intervaloHoras = 24 / totalVezes;

    const horasFormatadas = [];
    for (let i = 0; i < totalVezes; i++) {
      const minutosTotais = (hInicio * 60 + mInicio) + Math.round(i * intervaloHoras * 60);
      const minutosDoDia = minutosTotais % (24 * 60);
      const h = Math.floor(minutosDoDia / 60);
      const m = minutosDoDia % 60;
      horasFormatadas.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
    return horasFormatadas;
  },

  // Obter lista filtrada e ordenada de pacientes
  getPacientesFiltrados() {
    return this.pacientes.filter(p => {
      // 1. Filtro de Exibição de Altas
      if (this.modoExibicao === "CENSO_ATIVO") {
        if (p.alta) return false; // Oculta pacientes com alta no censo de rotina
      } else if (this.modoExibicao === "APENAS_ALTAS") {
        if (!p.alta) return false;
      }

      // 2. Filtro de Texto (RH, Nome, Leito, Dieta, Espessante)
      if (this.filtroTexto) {
        const termo = this.filtroTexto.toLowerCase().trim();
        const match = 
          (p.nome && p.nome.toLowerCase().includes(termo)) ||
          (p.rh && p.rh.toLowerCase().includes(termo)) ||
          (p.leito && p.leito.toLowerCase().includes(termo)) ||
          (p.dietaNome && p.dietaNome.toLowerCase().includes(termo)) ||
          (p.enfermariaNome && p.enfermariaNome.toLowerCase().includes(termo)) ||
          (p.espessanteObs && p.espessanteObs.toLowerCase().includes(termo));
        if (!match) return false;
      }

      // 3. Filtro por Enfermaria
      if (this.filtroEnfermaria !== "TODAS" && p.enfermaria !== this.filtroEnfermaria) {
        return false;
      }

      // 4. Filtro por Status
      if (this.filtroStatus === "ATIVOS" && (p.suspenso || p.alta)) return false;
      if (this.filtroStatus === "SUSPENSOS" && (!p.suspenso || p.alta)) return false;
      if (this.filtroStatus === "ALTAS" && !p.alta) return false;

      return true;
    }).sort((a, b) => {
      let valA, valB;
      const col = this.colunaOrdenacao;

      if (col === "leito") {
        valA = a.leito || "";
        valB = b.leito || "";
      } else if (col === "rh") {
        valA = a.rh || "";
        valB = b.rh || "";
      } else if (col === "nome") {
        valA = a.nome || "";
        valB = b.nome || "";
      } else if (col === "enfermaria") {
        valA = (a.enfermariaNome || a.enfermaria || "") + (a.leito || "");
        valB = (b.enfermariaNome || b.enfermaria || "") + (b.leito || "");
      } else if (col === "dieta") {
        valA = a.dietaNome || "";
        valB = b.dietaNome || "";
      } else if (col === "volume") {
        valA = Number(a.volumeMl) || 0;
        valB = Number(b.volumeMl) || 0;
      } else if (col === "vezes") {
        valA = Number(a.vezesDia) || 0;
        valB = Number(b.vezesDia) || 0;
      } else if (col === "horarios") {
        valA = a.horarioInicio || "06:00";
        valB = b.horarioInicio || "06:00";
      } else if (col === "via") {
        valA = a.via || "";
        valB = b.via || "";
      } else if (col === "dispositivo") {
        valA = a.dispositivo || "";
        valB = b.dispositivo || "";
      } else if (col === "espessante") {
        valA = a.espessanteObs || "";
        valB = b.espessanteObs || "";
      } else if (col === "status") {
        valA = a.alta ? 2 : (a.suspenso ? 1 : 0);
        valB = b.alta ? 2 : (b.suspenso ? 1 : 0);
      } else {
        valA = a.leito || "";
        valB = b.leito || "";
      }

      let res = 0;
      if (typeof valA === "string") {
        res = valA.localeCompare(valB, "pt-BR", { numeric: true });
      } else {
        res = valA > valB ? 1 : (valA < valB ? -1 : 0);
      }

      return this.direcaoOrdenacao === "desc" ? -res : res;
    });
  },

  // Obter todos os pacientes cadastrados
  getPacientes() {
    return this.pacientes || [];
  },

  // Obter todos os pacientes internados (Ativos + Suspensos, excluindo apenas Altas)
  getPacientesInternados() {
    return (this.pacientes || []).filter(p => !p.alta);
  },

  // Obter apenas pacientes com dieta ativa (em produção ativa, excluindo suspensos e altas)
  getPacientesAtivos() {
    return (this.pacientes || []).filter(p => !p.suspenso && !p.alta);
  },

  // Obter estatísticas do censo
  getEstatisticas() {
    const totalInternados = this.pacientes.filter(p => !p.alta).length;
    const ativos = this.pacientes.filter(p => !p.suspenso && !p.alta).length;
    const suspensos = this.pacientes.filter(p => p.suspenso && !p.alta).length;
    const altasTotal = this.pacientes.filter(p => p.alta).length;
    const volumeTotalDiario = this.pacientes
      .filter(p => !p.suspenso && !p.alta)
      .reduce((acc, p) => acc + (Number(p.volumeMl || 0) * Number(p.vezesDia || 0)), 0);

    return { total: totalInternados, ativos, suspensos, altasTotal, volumeTotalDiario };
  },

  // Obter histórico de RH e Nomes para Autocomplete
  getHistoricoRHeNomes() {
    const mapaRH = new Map();
    const mapaNomes = new Map();

    this.pacientes.forEach(p => {
      if (p.rh && p.nome) {
        const rhClean = p.rh.trim();
        const nomeClean = p.nome.trim().toUpperCase();
        if (!mapaRH.has(rhClean)) {
          mapaRH.set(rhClean, nomeClean);
        }
        if (!mapaNomes.has(nomeClean)) {
          mapaNomes.set(nomeClean, rhClean);
        }
      }
    });

    return {
      rhs: Array.from(mapaRH.keys()),
      nomes: Array.from(mapaNomes.keys()),
      mapaRH,
      mapaNomes
    };
  },

  // Buscar Paciente por RH existente
  buscarPorRH(rh) {
    if (!rh) return null;
    const termo = rh.trim().toLowerCase();
    return this.pacientes.find(p => p.rh && p.rh.trim().toLowerCase() === termo) || null;
  },

  // Buscar Paciente por Nome existente
  buscarPorNome(nome) {
    if (!nome) return null;
    const termo = nome.trim().toLowerCase();
    return this.pacientes.find(p => p.nome && p.nome.trim().toLowerCase() === termo) || null;
  },

  // Registrar ação no histórico de Undo
  registrarUndo(tipo, dadosAnteriores, dadosNovos, descricao) {
    this.historicoUndo.push({
      tipo,
      dadosAnteriores: JSON.parse(JSON.stringify(dadosAnteriores)),
      dadosNovos: dadosNovos ? JSON.parse(JSON.stringify(dadosNovos)) : null,
      descricao,
      timestamp: Date.now()
    });
    if (this.historicoUndo.length > 30) {
      this.historicoUndo.shift();
    }
  },

  // Obter descrição da última ação do histórico de desfazer
  obterUltimaAcaoDescricao() {
    if (this.historicoUndo.length === 0) return null;
    return this.historicoUndo[this.historicoUndo.length - 1].descricao || "Última alteração realizada";
  },

  // Desfazer última ação
  async desfazerUltimaAcao() {
    if (this.historicoUndo.length === 0) return null;
    const acao = this.historicoUndo.pop();

    if (acao.tipo === "EXCLUSAO") {
      this.pacientes.push(acao.dadosAnteriores);
      await ApiService.saveCenso(this.pacientes);
      return { msg: `Exclusão desfeita: Paciente ${acao.dadosAnteriores.nome} restaurado ao censo!` };
    } 
    else if (acao.tipo === "EDICAO") {
      const index = this.pacientes.findIndex(p => p.id === acao.dadosAnteriores.id);
      if (index !== -1) {
        this.pacientes[index] = acao.dadosAnteriores;
        await ApiService.saveCenso(this.pacientes);
        return { msg: `Edição desfeita: Dados anteriores de ${acao.dadosAnteriores.nome} restaurados!` };
      }
    }
    else if (acao.tipo === "INCLUSAO") {
      this.pacientes = this.pacientes.filter(p => p.id !== acao.dadosNovos.id);
      await ApiService.saveCenso(this.pacientes);
      return { msg: `Inclusão desfeita: Paciente ${acao.dadosNovos.nome} removido.` };
    }
    else if (acao.tipo === "SUSPENSAO") {
      const pac = this.pacientes.find(p => p.id === acao.dadosAnteriores.id);
      if (pac) {
        pac.suspenso = acao.dadosAnteriores.suspenso;
        await ApiService.saveCenso(this.pacientes);
        return { msg: `Status de suspensão de ${pac.nome} revertido!` };
      }
    }
    else if (acao.tipo === "ALTA") {
      const pac = this.pacientes.find(p => p.id === acao.dadosAnteriores.id);
      if (pac) {
        pac.alta = false;
        pac.motivoAlta = null;
        pac.dataAlta = null;
        await ApiService.saveCenso(this.pacientes);
        return { msg: `Alta desfeita: Paciente ${pac.nome} reincorporado ao censo ativo!` };
      }
    }

    return null;
  },

  // Dar Alta ao Paciente
  async darAltaPaciente(pacienteId, motivo, observacao = "") {
    const paciente = this.pacientes.find(p => p.id === pacienteId);
    if (!paciente) return null;

    const estadoAnterior = { ...paciente };
    paciente.alta = true;
    paciente.motivoAlta = motivo || "Alta Hospitalar";
    paciente.obsAlta = observacao;
    paciente.dataAlta = new Date().toISOString();
    paciente.updatedAt = new Date().toISOString();

    this.registrarUndo("ALTA", estadoAnterior, paciente, `Alta de ${paciente.nome} (${motivo})`);
    await ApiService.saveCenso(this.pacientes);
    return paciente;
  },

  // Reativar Paciente que teve alta (Reinternação)
  async reinternarPaciente(pacienteId) {
    const paciente = this.pacientes.find(p => p.id === pacienteId);
    if (!paciente) return null;

    const estadoAnterior = { ...paciente };
    paciente.alta = false;
    paciente.motivoAlta = null;
    paciente.obsAlta = null;
    paciente.dataAlta = null;
    paciente.updatedAt = new Date().toISOString();

    this.registrarUndo("EDICAO", estadoAnterior, paciente, `Reinternação de ${paciente.nome}`);
    await ApiService.saveCenso(this.pacientes);
    return paciente;
  },

  // Alternar status de suspensão com 1 clique ("S")
  async toggleSuspensao(pacienteId) {
    const paciente = this.pacientes.find(p => p.id === pacienteId);
    if (!paciente) return null;

    const estadoAnterior = { ...paciente };
    paciente.suspenso = !paciente.suspenso;
    paciente.updatedAt = new Date().toISOString();

    this.registrarUndo("SUSPENSAO", estadoAnterior, paciente, `Alternar suspensão de ${paciente.nome}`);
    await ApiService.saveCenso(this.pacientes);
    return paciente;
  },

  // Adicionar novo paciente ao censo
  async adicionarPaciente(dados) {
    const novoId = "PAC_" + Date.now().toString(36).toUpperCase() + "_" + Math.floor(Math.random()*1000);
    const novoPaciente = {
      id: novoId,
      rh: dados.rh ? dados.rh.trim() : "",
      nome: dados.nome ? dados.nome.trim().toUpperCase() : "SEM NOME",
      enfermaria: dados.enfermaria || "UI_PED_CLINICA",
      enfermariaNome: dados.enfermariaNome || "UI PEDIATRIA CLÍNICA",
      leito: dados.leito ? dados.leito.trim().toUpperCase() : "S/L",
      dietaId: dados.dietaId,
      dietaNome: dados.dietaNome,
      dietaEspecialDesc: dados.dietaEspecialDesc ? dados.dietaEspecialDesc.trim() : "",
      volumeMl: Number(dados.volumeMl) || 0,
      vezesDia: Number(dados.vezesDia) || 1,
      horarioInicio: dados.horarioInicio || "06:00",
      intervaloHoras: dados.intervaloHoras || 3,
      horariosAtivos: dados.horariosAtivos || [],
      via: dados.via || "ORAL",
      dispositivo: dados.dispositivo || "Mamadeira",
      espessanteObs: dados.espessanteObs ? dados.espessanteObs.trim() : "Sem espessante",
      calCalorico: dados.calCalorico || "67 kcal/100ml",
      suspenso: Boolean(dados.suspenso),
      alta: false,
      motivoAlta: null,
      dataAlta: null,
      updatedAt: new Date().toISOString()
    };

    this.pacientes.push(novoPaciente);
    this.registrarUndo("INCLUSAO", null, novoPaciente, `Inclusão de ${novoPaciente.nome}`);
    await ApiService.saveCenso(this.pacientes);
    return novoPaciente;
  },

  // Atualizar dados de paciente existente
  async atualizarPaciente(pacienteId, dados) {
    const index = this.pacientes.findIndex(p => p.id === pacienteId);
    if (index === -1) return null;

    const pacienteAnterior = { ...this.pacientes[index] };

    this.pacientes[index] = {
      ...this.pacientes[index],
      rh: dados.rh ? dados.rh.trim() : this.pacientes[index].rh,
      nome: dados.nome ? dados.nome.trim().toUpperCase() : this.pacientes[index].nome,
      enfermaria: dados.enfermaria || this.pacientes[index].enfermaria,
      enfermariaNome: dados.enfermariaNome || this.pacientes[index].enfermariaNome,
      leito: dados.leito ? dados.leito.trim().toUpperCase() : this.pacientes[index].leito,
      dietaId: dados.dietaId || this.pacientes[index].dietaId,
      dietaNome: dados.dietaNome || this.pacientes[index].dietaNome,
      dietaEspecialDesc: dados.dietaEspecialDesc !== undefined ? dados.dietaEspecialDesc.trim() : (this.pacientes[index].dietaEspecialDesc || ""),
      volumeMl: Number(dados.volumeMl) || this.pacientes[index].volumeMl,
      vezesDia: Number(dados.vezesDia) || this.pacientes[index].vezesDia,
      horarioInicio: dados.horarioInicio || this.pacientes[index].horarioInicio || "06:00",
      intervaloHoras: dados.intervaloHoras || this.pacientes[index].intervaloHoras || 3,
      horariosAtivos: dados.horariosAtivos || this.pacientes[index].horariosAtivos || [],
      via: dados.via || this.pacientes[index].via,
      dispositivo: dados.dispositivo || this.pacientes[index].dispositivo,
      espessanteObs: dados.espessanteObs !== undefined ? dados.espessanteObs.trim() : this.pacientes[index].espessanteObs,
      calCalorico: dados.calCalorico || this.pacientes[index].calCalorico,
      suspenso: dados.suspenso !== undefined ? Boolean(dados.suspenso) : this.pacientes[index].suspenso,
      updatedAt: new Date().toISOString()
    };

    this.registrarUndo("EDICAO", pacienteAnterior, this.pacientes[index], `Edição de ${this.pacientes[index].nome}`);
    await ApiService.saveCenso(this.pacientes);
    return this.pacientes[index];
  },

  // Remover paciente do censo
  async removerPaciente(pacienteId) {
    const index = this.pacientes.findIndex(p => p.id === pacienteId);
    if (index === -1) return false;

    const pacienteExcluido = { ...this.pacientes[index] };
    this.pacientes.splice(index, 1);
    this.registrarUndo("EXCLUSAO", pacienteExcluido, null, `Exclusão de ${pacienteExcluido.nome}`);
    await ApiService.saveCenso(this.pacientes);
    return true;
  },

  // Buscar paciente por ID
  obterPorId(pacienteId) {
    return this.pacientes.find(p => p.id === pacienteId) || null;
  },

  // Aliases de conveniência e compatibilidade
  getLista() {
    return this.pacientes || [];
  },

  getPacientePorId(pacienteId) {
    return this.obterPorId(pacienteId);
  }
};

if (typeof window !== "undefined") {
  window.CensoModule = CensoModule;
}
