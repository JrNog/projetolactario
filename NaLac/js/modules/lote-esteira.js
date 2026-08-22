/**
 * ============================================================================
 * LACTÁRIO DIGITAL - HOSPITAL SÃO PAULO (UNIFESP-EPM)
 * Módulo de Ações em Lote e Esteira Guiada com Auditoria Visual "De ➔ Para"
 * ============================================================================
 */

const LoteEsteiraModule = {
  // Conjunto de IDs de pacientes selecionados (preserva ordem de inserção)
  selecionados: new Set(),
  
  // Estado da Esteira de Edição
  esteiraEdicao: {
    ativa: false,
    filaIds: [],
    indiceAtual: 0,
    alteracoesSessao: [] // Buffer com todas as alterações capturadas na sessão
  },

  // Estado da Esteira de Alta
  esteiraAlta: {
    ativa: false,
    filaIds: [],
    indiceAtual: 0,
    altasRealizadas: []
  },

  // -------------------------------------------------------------------------
  // 1. GERENCIAMENTO DE SELEÇÃO MÚLTIPLA
  // -------------------------------------------------------------------------

  toggleSelecao(pacienteId) {
    if (!pacienteId) return;
    const idStr = String(pacienteId);
    if (this.selecionados.has(idStr)) {
      this.selecionados.delete(idStr);
    } else {
      this.selecionados.add(idStr);
    }
    this.atualizarBarraAcoesFlutuante();
    this.sincronizarCheckboxesVisual();
  },

  selecionarTodos(marcar) {
    const lista = (typeof CensoModule !== "undefined" && typeof CensoModule.getPacientesInternados === "function")
      ? CensoModule.getPacientesInternados()
      : (typeof CensoModule !== "undefined" && Array.isArray(CensoModule.pacientes) ? CensoModule.pacientes : []);

    this.selecionados.clear();
    if (marcar) {
      lista.forEach(p => {
        if (!p.alta) this.selecionados.add(String(p.id));
      });
    }
    this.atualizarBarraAcoesFlutuante();
    this.sincronizarCheckboxesVisual();
  },

  limparSelecao() {
    this.selecionados.clear();
    this.atualizarBarraAcoesFlutuante();
    this.sincronizarCheckboxesVisual();
  },

  estaSelecionado(pacienteId) {
    return this.selecionados.has(String(pacienteId));
  },

  getIdsSelecionados() {
    return Array.from(this.selecionados);
  },

  getPacientesSelecionados() {
    const ids = this.getIdsSelecionados();
    return ids.map(id => {
      if (typeof CensoModule !== "undefined") {
        return CensoModule.obterPorId(id) || CensoModule.getPacientePorId(id);
      }
      return null;
    }).filter(Boolean);
  },

  atualizarBarraAcoesFlutuante() {
    const barra = document.getElementById("censo-batch-action-bar");
    const contador = document.getElementById("censo-batch-contador");
    const total = this.selecionados.size;

    if (!barra) return;

    if (total > 0) {
      barra.classList.remove("hidden");
      if (contador) {
        contador.textContent = `${total} paciente${total > 1 ? "s" : ""} selecionado${total > 1 ? "s" : ""}`;
      }
    } else {
      barra.classList.add("hidden");
    }
  },

  sincronizarCheckboxesVisual() {
    const checkboxes = document.querySelectorAll(".censo-paciente-checkbox");
    checkboxes.forEach(cb => {
      const id = cb.getAttribute("data-paciente-id");
      cb.checked = this.selecionados.has(String(id));
    });

    const masterCbs = [
      document.getElementById("censo-select-all-checkbox"),
      document.getElementById("censo-select-all-checkbox-especial")
    ];

    masterCbs.forEach(masterCb => {
      if (masterCb) {
        const totalVisiveis = checkboxes.length;
        if (totalVisiveis === 0) {
          masterCb.checked = false;
          masterCb.indeterminate = false;
        } else {
          const totalMarcados = this.selecionados.size;
          masterCb.checked = totalMarcados === totalVisiveis && totalVisiveis > 0;
          masterCb.indeterminate = totalMarcados > 0 && totalMarcados < totalVisiveis;
        }
      }
    });
  },

  // -------------------------------------------------------------------------
  // 2. EXCLUSÃO EM LOTE COM SEGURANÇA
  // -------------------------------------------------------------------------

  abrirModalExclusaoLote() {
    const ids = this.getIdsSelecionados();
    if (ids.length === 0) {
      if (typeof App !== "undefined" && typeof App.mostrarToast === "function") {
        App.mostrarToast("Nenhum paciente selecionado para exclusão.", "warning");
      }
      return;
    }

    const modal = document.getElementById("modal-lote-exclusao");
    const listaEl = document.getElementById("lote-exclusao-lista-pacientes");
    const countEl = document.getElementById("lote-exclusao-total");

    if (!modal) return;

    const listaPacientes = this.getPacientesSelecionados();

    if (countEl) countEl.textContent = `${listaPacientes.length}`;

    if (listaEl) {
      listaEl.innerHTML = listaPacientes.map(p => `
        <div class="p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg flex items-center justify-between text-xs">
          <div>
            <strong class="text-rose-950 font-bold">${escapeHtml(p.nome)}</strong>
            <div class="text-[11px] text-rose-800 font-medium">
              Leito: <span class="font-bold">${escapeHtml(p.leito || "-")}</span> | Enferm: <span class="font-bold">${escapeHtml(p.enfermariaNome || p.enfermaria || "-")}</span> | Dieta: <span class="font-bold">${escapeHtml(p.dietaNome || "-")}</span>
            </div>
          </div>
          <span class="text-xs bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded font-mono">RH: ${escapeHtml(p.rh || "-")}</span>
        </div>
      `).join("");
    }

    modal.classList.remove("hidden");
  },

  fecharModalExclusaoLote() {
    const modal = document.getElementById("modal-lote-exclusao");
    if (modal) modal.classList.add("hidden");
  },

  async confirmarExclusaoLote() {
    const ids = this.getIdsSelecionados();
    if (ids.length === 0) return;

    let totalExcluidos = 0;
    for (const id of ids) {
      const p = (typeof CensoModule !== "undefined") ? CensoModule.obterPorId(id) : null;
      if (p) {
        if (typeof CensoModule !== "undefined" && typeof CensoModule.removerPaciente === "function") {
          await CensoModule.removerPaciente(id);
        }
        totalExcluidos++;

        if (typeof AuditLogModule !== "undefined") {
          AuditLogModule.registrar(
            "PACIENTES",
            "EXCLUSAO",
            `Paciente ${p.nome} excluído em lote`,
            [{ campo: "Status", de: "Ativo no Censo", para: "Excluído em Lote" }],
            { id: p.id, rh: p.rh, leito: p.leito, enfermaria: p.enfermaria }
          );
        }
      }
    }

    this.fecharModalExclusaoLote();
    this.limparSelecao();
    if (typeof App !== "undefined") {
      App.renderizarTudo();
      App.mostrarToast(`${totalExcluidos} paciente(s) excluído(s) em lote com sucesso!`, "info");
    }
  },

  // -------------------------------------------------------------------------
  // 3. ESTEIRA GUIADA DE EDIÇÃO EM LOTE COM AUDITORIA "DE ➔ PARA"
  // -------------------------------------------------------------------------

  iniciarEsteiraEdicao() {
    const ids = this.getIdsSelecionados();
    if (ids.length === 0) {
      if (typeof App !== "undefined" && typeof App.mostrarToast === "function") {
        App.mostrarToast("Selecione pelo menos um paciente para iniciar a esteira de edição.", "warning");
      }
      return;
    }

    this.esteiraEdicao = {
      ativa: true,
      filaIds: [...ids],
      indiceAtual: 0,
      alteracoesSessao: []
    };

    this.abrirProximoPacienteEsteira();
  },

  abrirProximoPacienteEsteira() {
    const { filaIds, indiceAtual } = this.esteiraEdicao;

    if (indiceAtual >= filaIds.length) {
      this.finalizarEsteiraEdicao();
      return;
    }

    const pacienteId = filaIds[indiceAtual];
    const paciente = (typeof CensoModule !== "undefined")
      ? (CensoModule.obterPorId(pacienteId) || CensoModule.getPacientePorId(pacienteId))
      : null;

    if (!paciente) {
      // Se não encontrou, pula para o próximo
      this.esteiraEdicao.indiceAtual++;
      this.abrirProximoPacienteEsteira();
      return;
    }

    // Abre o formulário do paciente
    if (typeof App !== "undefined" && typeof App.abrirModalEdicao === "function") {
      App.abrirModalEdicao(pacienteId);
    }

    // Injeta banner da esteira no modal
    this.injetarBannerEsteiraNoModal(indiceAtual + 1, filaIds.length, paciente);
  },

  injetarBannerEsteiraNoModal(passoAtual, totalPassos, paciente) {
    const tituloEl = document.getElementById("modal-paciente-titulo");
    const subtituloEl = document.getElementById("modal-paciente-subtitulo");
    const btnSalvar = document.getElementById("btn-salvar-paciente");
    const btnSalvarOutro = document.getElementById("btn-salvar-adicionar-outro");

    if (btnSalvarOutro) {
      btnSalvarOutro.classList.add("hidden");
    }

    if (tituloEl) {
      tituloEl.innerHTML = `
        <div class="flex items-center justify-center gap-2">
          <span class="px-2.5 py-0.5 bg-fuchsia-600 text-white rounded-full text-xs font-black shadow-xs">
            [ ${passoAtual} de ${totalPassos} ]
          </span>
          <span>ESTEIRA DE EDIÇÃO EM LOTE</span>
        </div>
      `;
    }

    if (subtituloEl) {
      subtituloEl.innerHTML = `Editando: <strong class="text-white">${escapeHtml(paciente.nome)}</strong> (Leito: <span class="text-pink-300 font-bold">${escapeHtml(paciente.leito || "-")}</span> | Enferm: <span class="text-pink-300 font-bold">${escapeHtml(paciente.enfermariaNome || paciente.enfermaria || "-")}</span>)`;
    }

    if (btnSalvar) {
      btnSalvar.innerHTML = `
        <span>💾</span>
        <span>Salvar e Próximo ➔</span>
      `;
    }

    // Injeta botões de controle da esteira (Pular e Encerrar)
    let containerBotoes = document.getElementById("modal-paciente-esteira-controles");
    if (!containerBotoes) {
      const footerActions = document.getElementById("modal-paciente-footer-actions") || document.querySelector("#form-paciente .border-t");
      if (footerActions) {
        containerBotoes = document.createElement("div");
        containerBotoes.id = "modal-paciente-esteira-controles";
        containerBotoes.className = "flex items-center gap-2 w-full mt-2 pt-2 border-t border-purple-100 justify-between";
        footerActions.parentNode.appendChild(containerBotoes);
      }
    }

    if (containerBotoes) {
      containerBotoes.innerHTML = `
        <button 
          type="button" 
          onclick="LoteEsteiraModule.pularPacienteEsteira()"
          class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          title="Pular este leito sem fazer alterações"
        >
          <span>⏩</span>
          <span>Pular Paciente</span>
        </button>

        <button 
          type="button" 
          onclick="LoteEsteiraModule.interromperEsteiraEdicao()"
          class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          title="Encerrar esteira agora mantendo as alterações já salvas"
        >
          <span>🛑</span>
          <span>Encerrar Esteira / Sair</span>
        </button>
      `;
    }
  },

  removerControlesEsteiraModal() {
    const containerBotoes = document.getElementById("modal-paciente-esteira-controles");
    if (containerBotoes) containerBotoes.remove();

    const btnSalvar = document.getElementById("btn-salvar-paciente");
    if (btnSalvar) {
      btnSalvar.innerHTML = `
        <span>💾</span>
        <span>Salvar Paciente</span>
      `;
    }

    const btnSalvarOutro = document.getElementById("btn-salvar-adicionar-outro");
    if (btnSalvarOutro) {
      btnSalvarOutro.classList.remove("hidden");
    }
  },

  pularPacienteEsteira() {
    if (typeof App !== "undefined" && typeof App.fecharModalPaciente === "function") {
      App.fecharModalPaciente();
    }
    this.esteiraEdicao.indiceAtual++;
    this.abrirProximoPacienteEsteira();
  },

  salvarAvancarEsteira(pacienteAntes, pacienteDepois, diffs) {
    if (diffs && diffs.length > 0) {
      this.esteiraEdicao.alteracoesSessao.push({
        pacienteId: pacienteDepois.id,
        nome: pacienteDepois.nome,
        leito: pacienteDepois.leito,
        enfermaria: pacienteDepois.enfermariaNome || pacienteDepois.enfermaria,
        rh: pacienteDepois.rh,
        diffs: diffs
      });
    }

    if (typeof App !== "undefined" && typeof App.fecharModalPaciente === "function") {
      App.fecharModalPaciente();
    }
    this.esteiraEdicao.indiceAtual++;
    this.abrirProximoPacienteEsteira();
  },

  interromperEsteiraEdicao() {
    if (typeof App !== "undefined" && typeof App.fecharModalPaciente === "function") {
      App.fecharModalPaciente();
    }
    this.finalizarEsteiraEdicao();
  },

  finalizarEsteiraEdicao() {
    const sessaoGravada = [...this.esteiraEdicao.alteracoesSessao];
    this.esteiraEdicao.ativa = false;
    this.removerControlesEsteiraModal();
    this.limparSelecao();
    
    if (typeof App !== "undefined") {
      App.renderizarTudo();
    }

    // Abre o modal de auditoria visual com o resumo comparativo "De ➔ Para"
    this.exibirModalResumoDePara(sessaoGravada);
  },

  // -------------------------------------------------------------------------
  // 4. MODAL DE FECHAMENTO E AUDITORIA VISUAL "DE ➔ PARA"
  // -------------------------------------------------------------------------

  exibirModalResumoDePara(alteracoes) {
    const modal = document.getElementById("modal-resumo-de-para");
    const tabelaCorpo = document.getElementById("tabela-resumo-de-para-corpo");
    const countEl = document.getElementById("resumo-de-para-total-modificados");

    if (!modal) return;

    if (!alteracoes || alteracoes.length === 0) {
      if (typeof App !== "undefined" && typeof App.mostrarToast === "function") {
        App.mostrarToast("Esteira de edição encerrada sem alterações de dados.", "info");
      }
      return;
    }

    if (countEl) countEl.textContent = `${alteracoes.length} paciente(s) alterado(s)`;

    if (tabelaCorpo) {
      let html = "";
      alteracoes.forEach(item => {
        const totalDiffs = item.diffs.length;
        item.diffs.forEach((diff, idx) => {
          html += `
            <tr class="hover:bg-purple-50/40 transition-colors ${idx === 0 ? 'border-t-2 border-purple-200' : ''}">
              ${idx === 0 ? `
                <td rowspan="${totalDiffs}" class="py-2.5 px-3 align-top font-bold text-purple-950 bg-purple-50/20 border-r border-purple-100">
                  <div class="text-xs font-black text-slate-900">${escapeHtml(item.nome)}</div>
                  <div class="text-[10.5px] text-purple-800 font-medium mt-0.5">
                    Leito: <strong class="text-slate-800 font-mono">${escapeHtml(item.leito || "-")}</strong> | Enferm: <strong class="text-slate-800">${escapeHtml(item.enfermaria || "-")}</strong>
                  </div>
                  <div class="text-[10px] text-slate-500 font-mono">RH: ${escapeHtml(item.rh || "-")}</div>
                </td>
              ` : ''}
              <td class="py-2 px-3 font-semibold text-slate-800 border-r border-purple-100 text-xs">
                <span class="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[11px] font-bold">
                  ${escapeHtml(diff.campo)}
                </span>
              </td>
              <td class="py-2 px-3 text-rose-700 bg-rose-50/40 border-r border-purple-100 font-medium line-through text-xs">
                ${escapeHtml(String(diff.de || "(Vazio)"))}
              </td>
              <td class="py-2 px-3 text-emerald-800 bg-emerald-50/50 font-bold text-xs">
                ➔ ${escapeHtml(String(diff.para || "(Vazio)"))}
              </td>
            </tr>
          `;
        });
      });
      tabelaCorpo.innerHTML = html;
    }

    modal.classList.remove("hidden");
  },

  fecharModalResumoDePara() {
    const modal = document.getElementById("modal-resumo-de-para");
    if (modal) modal.classList.add("hidden");
  },

  // -------------------------------------------------------------------------
  // 5. FLUXO DE ALTA HOSPITALAR COM LOG E OBSERVAÇÃO OPCIONAL
  // -------------------------------------------------------------------------

  abrirModalAltaIndividual(pacienteId) {
    const paciente = (typeof CensoModule !== "undefined")
      ? (CensoModule.obterPorId(pacienteId) || CensoModule.getPacientePorId(pacienteId))
      : null;

    if (!paciente) {
      console.warn("Paciente não encontrado para alta:", pacienteId);
      return;
    }

    this.esteiraAlta = {
      ativa: false,
      filaIds: [String(pacienteId)],
      indiceAtual: 0,
      altasRealizadas: []
    };

    this.renderizarModalAlta(paciente, 1, 1);
  },

  iniciarEsteiraAlta() {
    const ids = this.getIdsSelecionados();
    if (ids.length === 0) {
      if (typeof App !== "undefined" && typeof App.mostrarToast === "function") {
        App.mostrarToast("Selecione pelo menos um paciente para dar alta.", "warning");
      }
      return;
    }

    this.esteiraAlta = {
      ativa: true,
      filaIds: [...ids],
      indiceAtual: 0,
      altasRealizadas: []
    };

    this.abrirProximoPacienteAlta();
  },

  abrirProximoPacienteAlta() {
    const { filaIds, indiceAtual } = this.esteiraAlta;

    if (indiceAtual >= filaIds.length) {
      this.finalizarEsteiraAlta();
      return;
    }

    const pacienteId = filaIds[indiceAtual];
    const paciente = (typeof CensoModule !== "undefined")
      ? (CensoModule.obterPorId(pacienteId) || CensoModule.getPacientePorId(pacienteId))
      : null;

    if (!paciente) {
      this.esteiraAlta.indiceAtual++;
      this.abrirProximoPacienteAlta();
      return;
    }

    this.renderizarModalAlta(paciente, indiceAtual + 1, filaIds.length);
  },

  renderizarModalAlta(paciente, passoAtual, totalPassos) {
    const modal = document.getElementById("modal-alta-paciente");
    if (!modal) return;

    this.pacienteAtualAltaId = String(paciente.id);

    const tituloEl = document.getElementById("modal-alta-titulo-progresso");
    const infoEl = document.getElementById("modal-alta-paciente-detalhes");
    const inputObs = document.getElementById("modal-alta-observacao");
    const btnConfirmar = document.getElementById("btn-confirmar-alta-paciente");

    if (tituloEl) {
      if (totalPassos > 1) {
        tituloEl.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-black">
              [ ${passoAtual} de ${totalPassos} ]
            </span>
            <span>ESTEIRA DE ALTA HOSPITALAR</span>
          </div>
        `;
      } else {
        tituloEl.innerHTML = `<span>REGISTRAR ALTA HOSPITALAR</span>`;
      }
    }

    if (infoEl) {
      infoEl.innerHTML = `
        <div class="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-1 text-xs">
          <div class="flex items-center justify-between">
            <strong class="text-sm font-black text-purple-950">${escapeHtml(paciente.nome)}</strong>
            <span class="px-2 py-0.5 bg-purple-200 text-purple-900 font-bold rounded text-[11px] font-mono">RH: ${escapeHtml(paciente.rh || "-")}</span>
          </div>
          <div class="text-slate-700 font-medium">
            Leito: <strong class="text-slate-900 font-mono">${escapeHtml(paciente.leito || "-")}</strong> | Enferm: <strong class="text-slate-900">${escapeHtml(paciente.enfermariaNome || paciente.enfermaria || "-")}</strong>
          </div>
          <div class="text-slate-600">
            Dieta: <strong class="text-purple-900">${escapeHtml(paciente.dietaNome || "-")}</strong> | Volume: <strong class="text-purple-900">${escapeHtml(String(paciente.volumeMl || "0"))} ml</strong> (${escapeHtml(String(paciente.vezesDia || "0"))}x/dia)
          </div>
        </div>
      `;
    }

    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.innerHTML = `
        <span>🏥</span>
        <span>Confirmar Alta</span>
      `;
      btnConfirmar.onclick = () => LoteEsteiraModule.confirmarAltaAtual(paciente.id);
    }

    if (inputObs) {
      inputObs.value = "";
      inputObs.onkeydown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          LoteEsteiraModule.confirmarAltaAtual(paciente.id);
        }
      };
      setTimeout(() => inputObs.focus(), 100);
    }

    modal.classList.remove("hidden");
  },

  async confirmarAltaAtual(pacienteId) {
    const btnConfirmar = document.getElementById("btn-confirmar-alta-paciente");
    try {
      const id = (typeof pacienteId === "string" && pacienteId) 
        ? pacienteId 
        : (this.pacienteAtualAltaId || (this.esteiraAlta && this.esteiraAlta.filaIds && this.esteiraAlta.filaIds[this.esteiraAlta.indiceAtual]));

      if (!id) {
        console.warn("Nenhum ID de paciente disponível para confirmar alta.");
        this.fecharModalAlta();
        return;
      }

      const paciente = (typeof CensoModule !== "undefined")
        ? (CensoModule.obterPorId(id) || CensoModule.getPacientePorId(id))
        : null;

      if (!paciente) {
        console.warn("Paciente não encontrado para confirmação de alta. ID:", id);
        this.fecharModalAlta();
        return;
      }

      if (btnConfirmar) {
        btnConfirmar.disabled = true;
        btnConfirmar.innerHTML = `<span>⏳</span><span>Gravando...</span>`;
      }

      const inputObs = document.getElementById("modal-alta-observacao");
      const observacao = inputObs ? inputObs.value.trim() : "";

      const dataHoraIso = new Date().toISOString();
      let dataHoraFmt = new Date().toLocaleString("pt-BR");
      if (typeof AuditLogModule !== "undefined" && typeof AuditLogModule.formatarDataHora === "function") {
        try {
          dataHoraFmt = AuditLogModule.formatarDataHora(new Date());
        } catch (e) {
          dataHoraFmt = new Date().toLocaleString("pt-BR");
        }
      }

      let responsavel = "Nutricionista Responsável";
      if (typeof AuditLogModule !== "undefined" && typeof AuditLogModule.getResponsavelAtual === "function") {
        try {
          responsavel = AuditLogModule.getResponsavelAtual();
        } catch (e) {
          responsavel = "Nutricionista Responsável";
        }
      } else {
        try {
          const nutriConfig = JSON.parse(localStorage.getItem("lac_nutri_config") || "{}");
          responsavel = nutriConfig.nome ? `${nutriConfig.nome} (${nutriConfig.crn || "CRN"})` : "Nutricionista Responsável";
        } catch (e) {
          responsavel = "Nutricionista Responsável";
        }
      }

      const registroAlta = {
        id: "ALTA_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        pacienteId: paciente.id,
        rh: paciente.rh || "",
        nome: paciente.nome,
        enfermaria: paciente.enfermaria || "",
        enfermariaNome: paciente.enfermariaNome || "",
        leito: paciente.leito || "",
        dietaId: paciente.dietaId || "",
        dietaNome: paciente.dietaNome || "",
        volumeMl: paciente.volumeMl || 0,
        vezesDia: paciente.vezesDia || 0,
        dataHoraIso: dataHoraIso,
        dataHoraFormatada: dataHoraFmt,
        responsavel: responsavel,
        motivoObservacao: observacao || "Alta Hospitalar Concedida"
      };

      // 1. Grava no armazenamento de Altas Local
      this.salvarRegistroAltaLocal(registroAlta);

      // 2. Registra a Alta no CensoModule imediatamente
      if (typeof CensoModule !== "undefined" && typeof CensoModule.darAltaPaciente === "function") {
        try {
          CensoModule.darAltaPaciente(paciente.id, "Alta Hospitalar", observacao || "Alta Hospitalar Concedida").catch(e => {
            console.warn("Aviso ao processar alta no censo:", e);
          });
        } catch (e) {
          console.warn("Aviso ao chamar darAltaPaciente:", e);
        }
      }

      // 3. Envia para Google Sheets (TB_LOG_ALTAS) em segundo plano (sem travar interface)
      if (typeof ApiService !== "undefined" && typeof ApiService.saveAlta === "function") {
        try {
          ApiService.saveAlta(registroAlta).catch(e => {
            console.warn("Aviso ao sincronizar alta com Google Sheets:", e);
          });
        } catch (e) {
          console.warn("Aviso ao despachar saveAlta:", e);
        }
      }

      // 4. Registra no Histórico de Auditoria Geral
      if (typeof AuditLogModule !== "undefined" && typeof AuditLogModule.registrar === "function") {
        try {
          AuditLogModule.registrar(
            "PACIENTES",
            "ALTA",
            `Alta hospitalar: ${paciente.nome} (Leito ${paciente.leito || "-"})`,
            [
              { campo: "Status", de: "Internado (Ativo no Censo)", para: "Alta Hospitalar" },
              { campo: "Observação de Alta", de: "-", para: observacao || "(Sem observação)" }
            ],
            { id: paciente.id, rh: paciente.rh, leito: paciente.leito, enfermaria: paciente.enfermaria, observacao: observacao }
          );
        } catch (e) {
          console.warn("Aviso ao registrar auditoria:", e);
        }
      }

      // Adiciona ao relatório da esteira se ativa
      if (this.esteiraAlta && Array.isArray(this.esteiraAlta.altasRealizadas)) {
        this.esteiraAlta.altasRealizadas.push(registroAlta);
      }

      // Fecha modal do paciente atual IMEDIATAMENTE
      this.fecharModalAlta();

      if (this.esteiraAlta && this.esteiraAlta.ativa) {
        this.esteiraAlta.indiceAtual++;
        this.abrirProximoPacienteAlta();
      } else {
        this.limparSelecao();
        if (typeof App !== "undefined") {
          App.renderizarTudo();
          App.mostrarToast(`Alta de ${paciente.nome} registrada com sucesso!`, "info");
        }
      }
    } catch (err) {
      console.error("Erro ao registrar alta:", err);
      this.fecharModalAlta();
      if (typeof App !== "undefined" && typeof App.mostrarToast === "function") {
        App.mostrarToast("Alta registrada com avisos.", "warning");
      }
    } finally {
      if (btnConfirmar) {
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = `<span>🏥</span><span>Confirmar Alta</span>`;
      }
    }
  },

  fecharModalAlta() {
    const modal = document.getElementById("modal-alta-paciente");
    if (modal) modal.classList.add("hidden");
  },

  interromperEsteiraAlta() {
    this.fecharModalAlta();
    this.finalizarEsteiraAlta();
  },

  finalizarEsteiraAlta() {
    const totalAltas = this.esteiraAlta.altasRealizadas.length;
    this.esteiraAlta.ativa = false;
    this.limparSelecao();
    
    if (typeof App !== "undefined") {
      App.renderizarTudo();
      if (totalAltas > 0) {
        App.mostrarToast(`${totalAltas} alta(s) registrada(s) com sucesso!`, "info");
      }
    }
  },

  salvarRegistroAltaLocal(registroAlta) {
    try {
      const KEY = "lactario_hsp_altas_v1";
      const salvas = JSON.parse(localStorage.getItem(KEY) || "[]");
      salvas.unshift(registroAlta);
      // Mantém histórico das últimas 1000 altas locais
      if (salvas.length > 1000) salvas.length = 1000;
      localStorage.setItem(KEY, JSON.stringify(salvas));
    } catch (e) {
      console.warn("Aviso ao salvar alta localmente:", e);
    }
  },

  getAltasLocais() {
    try {
      return JSON.parse(localStorage.getItem("lactario_hsp_altas_v1") || "[]");
    } catch (e) {
      return [];
    }
  }
};

if (typeof window !== "undefined") {
  window.LoteEsteiraModule = LoteEsteiraModule;
}
