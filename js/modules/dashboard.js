/**
 * ============================================================================
 * LACTÁRIO DIGITAL - HOSPITAL SÃO PAULO (UNIFESP-EPM)
 * Módulo de Dashboard Clínico Executivo e Intuitivo
 * ============================================================================
 */

const DashboardModule = {
  
  /**
   * Calcula as métricas consolidadas a partir da relação atual de pacientes
   */
  calcularMetricas() {
    const todos = typeof CensoModule !== "undefined" ? CensoModule.pacientes : [];
    const ativos = todos.filter(p => !p.suspenso);
    const suspensos = todos.filter(p => Boolean(p.suspenso));

    // Volume total 24h em ml e frascos
    let volumeTotalMl = 0;
    let totalFrascosDia = 0;
    const contagemDietas = {};
    const contagemCategorias = {
      AUTOCLAVADA_P1: { nome: "Autoclavadas - Preparo 1", ml: 0, count: 0, color: "bg-purple-600", text: "text-purple-600" },
      AUTOCLAVADA_P2: { nome: "Autoclavadas - Preparo 2", ml: 0, count: 0, color: "bg-fuchsia-600", text: "text-fuchsia-600" },
      NAO_AUTOCLAVADA: { nome: "Não Autoclavadas (Bancada Estéril)", ml: 0, count: 0, color: "bg-emerald-600", text: "text-emerald-600" },
      ESPECIAL: { nome: "Dietas e Alimentos Especiais", ml: 0, count: 0, color: "bg-pink-500", text: "text-pink-500" }
    };
    const contagemEnfermarias = {};
    const contagemVias = { ORAL: 0, ENTERAL: 0, PARENTERAL: 0, OUTRA: 0 };
    const contagemDispositivos = {};
    const demandaHorarios = {
      "06:00": { frascos: 0, ml: 0 },
      "09:00": { frascos: 0, ml: 0 },
      "12:00": { frascos: 0, ml: 0 },
      "15:00": { frascos: 0, ml: 0 },
      "18:00": { frascos: 0, ml: 0 },
      "21:00": { frascos: 0, ml: 0 },
      "00:00": { frascos: 0, ml: 0 },
      "03:00": { frascos: 0, ml: 0 }
    };

    ativos.forEach(p => {
      const vol = Number(p.volumeMl) || 0;
      const vezes = Number(p.vezesDia) || 8;
      const volDia = vol * vezes;
      volumeTotalMl += volDia;
      totalFrascosDia += vezes;

      // Dieta
      const dNome = p.dietaNome || "Dieta Padrão";
      if (!contagemDietas[dNome]) contagemDietas[dNome] = { nome: dNome, ml: 0, pacientes: 0 };
      contagemDietas[dNome].ml += volDia;
      contagemDietas[dNome].pacientes += 1;

      // Categoria da Dieta
      const dObj = typeof DIETAS_PADRAO !== "undefined" ? DIETAS_PADRAO.find(d => d.id === p.dietaId) : null;
      let catKey = "AUTOCLAVADA_P1";
      if (dObj && dObj.categoria) catKey = dObj.categoria;
      else if (p.dietaId && p.dietaId.includes("esp")) catKey = "ESPECIAL";
      
      if (!contagemCategorias[catKey]) {
        contagemCategorias[catKey] = { nome: "Outras Dietas", ml: 0, count: 0, color: "bg-purple-600", text: "text-purple-600" };
      }
      contagemCategorias[catKey].ml += volDia;
      contagemCategorias[catKey].count += 1;

      // Enfermaria
      const enfNome = p.enfermariaNome || p.enfermaria || "Outras";
      if (!contagemEnfermarias[enfNome]) contagemEnfermarias[enfNome] = { nome: enfNome, ml: 0, pacientes: 0 };
      contagemEnfermarias[enfNome].ml += volDia;
      contagemEnfermarias[enfNome].pacientes += 1;

      // Vias e Dispositivos
      const viaUpper = (p.via || "ORAL").toUpperCase();
      if (contagemVias[viaUpper] !== undefined) contagemVias[viaUpper] += 1;
      else contagemVias.ORAL += 1;

      const dispNome = p.dispositivo || "Mamadeira";
      contagemDispositivos[dispNome] = (contagemDispositivos[dispNome] || 0) + 1;

      // Horários ativos
      const horariosAtivos = typeof CensoModule !== "undefined" ? CensoModule.obterHorariosAtivosPaciente(p) : [];
      horariosAtivos.forEach(h => {
        if (demandaHorarios[h]) {
          demandaHorarios[h].frascos += 1;
          demandaHorarios[h].ml += vol;
        }
      });
    });

    // Encontrar Dieta Top 1
    const dietasArray = Object.values(contagemDietas).sort((a, b) => b.ml - a.ml);
    const topDieta = dietasArray.length > 0 ? dietasArray[0] : { nome: "Nenhuma", ml: 0, pacientes: 0 };

    // Encontrar Enfermaria Top 1
    const enfArray = Object.values(contagemEnfermarias).sort((a, b) => b.ml - a.ml);
    const topEnfermaria = enfArray.length > 0 ? enfArray[0] : { nome: "Nenhuma", ml: 0, pacientes: 0 };

    // Encontrar Horário de Pico
    const horariosArray = Object.entries(demandaHorarios).map(([hora, val]) => ({ hora, ...val })).sort((a, b) => b.frascos - a.frascos);
    const topHorario = horariosArray.length > 0 ? horariosArray[0] : { hora: "06:00", frascos: 0, ml: 0 };

    return {
      totalPacientes: todos.length,
      totalAtivos: ativos.length,
      totalSuspensos: suspensos.length,
      volumeTotalLitros: (volumeTotalMl / 1000).toFixed(1),
      volumeTotalMl,
      totalFrascosDia,
      topDieta,
      topEnfermaria,
      topHorario,
      dietasArray,
      contagemCategorias,
      enfArray,
      contagemVias,
      contagemDispositivos,
      demandaHorarios
    };
  },

  /**
   * Renderiza a aba completa de Dashboard
   */
  renderizar() {
    const container = document.getElementById("tab-dashboard");
    if (!container) return;

    const m = this.calcularMetricas();

    // 1. Renderizar Cards de Topo
    const cardAtivos = document.getElementById("dash-card-pacientes");
    if (cardAtivos) {
      cardAtivos.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10.5px] font-black uppercase tracking-wider text-purple-700">Pacientes na Relação</span>
            <div class="text-2xl sm:text-3xl font-black text-purple-950 mt-0.5">${m.totalAtivos} <span class="text-xs font-bold text-slate-500">ativos</span></div>
          </div>
          <div class="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-xl text-purple-900 border border-purple-200">
            🍼
          </div>
        </div>
        <div class="mt-2.5 pt-2 border-t border-purple-100 flex items-center justify-between text-xs">
          <span class="text-slate-600 font-semibold">Dietas Suspensas:</span>
          <span class="font-bold font-mono px-2 py-0.5 rounded ${m.totalSuspensos > 0 ? "bg-rose-100 text-rose-900 border border-rose-200" : "bg-slate-100 text-slate-600"}">
            ${m.totalSuspensos} paciente(s)
          </span>
        </div>
      `;
    }

    const cardVolume = document.getElementById("dash-card-volume");
    if (cardVolume) {
      cardVolume.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10.5px] font-black uppercase tracking-wider text-fuchsia-700">Volume Total 24 Horas</span>
            <div class="text-2xl sm:text-3xl font-black text-fuchsia-950 mt-0.5">${m.volumeTotalLitros} <span class="text-xs font-bold text-slate-500">Litros / dia</span></div>
          </div>
          <div class="w-11 h-11 rounded-2xl bg-fuchsia-100 flex items-center justify-center text-xl text-fuchsia-900 border border-fuchsia-200">
            🥛
          </div>
        </div>
        <div class="mt-2.5 pt-2 border-t border-fuchsia-100 flex items-center justify-between text-xs">
          <span class="text-slate-600 font-semibold">Total de Envases / dia:</span>
          <span class="font-bold font-mono text-fuchsia-900 bg-fuchsia-50 px-2 py-0.5 rounded border border-fuchsia-200">
            ${m.totalFrascosDia} frascos/mamadeiras
          </span>
        </div>
      `;
    }

    const cardTopDieta = document.getElementById("dash-card-top-dieta");
    if (cardTopDieta) {
      const percTop = m.volumeTotalMl > 0 ? ((m.topDieta.ml / m.volumeTotalMl) * 100).toFixed(0) : 0;
      cardTopDieta.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10.5px] font-black uppercase tracking-wider text-pink-700">Fórmula Mais Prescrita</span>
            <div class="text-base sm:text-lg font-black text-pink-950 mt-0.5 truncate max-w-[170px]" title="${m.topDieta.nome}">
              ${m.topDieta.nome}
            </div>
          </div>
          <div class="w-11 h-11 rounded-2xl bg-pink-100 flex items-center justify-center text-xl text-pink-900 border border-pink-200">
            ⭐
          </div>
        </div>
        <div class="mt-2.5 pt-2 border-t border-pink-100 flex items-center justify-between text-xs">
          <span class="text-slate-600 font-semibold">${m.topDieta.pacientes} paciente(s)</span>
          <span class="font-bold font-mono text-pink-900 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
            ${(m.topDieta.ml / 1000).toFixed(1)} L (${percTop}%)
          </span>
        </div>
      `;
    }

    const cardTopEnfermaria = document.getElementById("dash-card-top-enfermaria");
    if (cardTopEnfermaria) {
      cardTopEnfermaria.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10.5px] font-black uppercase tracking-wider text-purple-700">Maior Demanda por Unidade</span>
            <div class="text-base sm:text-lg font-black text-purple-950 mt-0.5 truncate max-w-[170px]" title="${m.topEnfermaria.nome}">
              ${m.topEnfermaria.nome}
            </div>
          </div>
          <div class="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-xl text-purple-900 border border-purple-200">
            🏥
          </div>
        </div>
        <div class="mt-2.5 pt-2 border-t border-purple-100 flex items-center justify-between text-xs">
          <span class="text-slate-600 font-semibold">${m.topEnfermaria.pacientes} leito(s)</span>
          <span class="font-bold font-mono text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            ${(m.topEnfermaria.ml / 1000).toFixed(1)} Litros
          </span>
        </div>
      `;
    }

    // 2. Painel de Distribuição por Categoria de Dietas
    const painelCategorias = document.getElementById("dash-painel-categorias");
    if (painelCategorias) {
      const cats = Object.values(m.contagemCategorias);
      painelCategorias.innerHTML = cats.map(cat => {
        const perc = m.volumeTotalMl > 0 ? ((cat.ml / m.volumeTotalMl) * 100).toFixed(1) : 0;
        return `
          <div class="space-y-1">
            <div class="flex justify-between items-center text-xs font-bold">
              <span class="text-slate-800 flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full ${cat.color}"></span>
                <span>${cat.nome}</span>
              </span>
              <span class="font-mono text-slate-700">${(cat.ml / 1000).toFixed(1)} L (${perc}%)</span>
            </div>
            <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div class="h-full ${cat.color} rounded-full transition-all duration-500" style="width: ${perc}%"></div>
            </div>
          </div>
        `;
      }).join("");
    }

    // 3. Grade de Picos de Horários de Preparo (8 Horários Oficiais)
    const painelHorarios = document.getElementById("dash-painel-horarios");
    if (painelHorarios) {
      const maxFrascos = Math.max(...Object.values(m.demandaHorarios).map(h => h.frascos), 1);
      const horasList = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "00:00", "03:00"];

      painelHorarios.innerHTML = horasList.map(h => {
        const dataH = m.demandaHorarios[h] || { frascos: 0, ml: 0 };
        const percH = ((dataH.frascos / maxFrascos) * 100).toFixed(0);
        const isPeak = dataH.frascos === maxFrascos && maxFrascos > 0;

        return `
          <div class="flex flex-col items-center flex-1 min-w-[50px] p-2 rounded-xl ${isPeak ? "bg-purple-100/80 border border-purple-300" : "bg-purple-50/30 border border-purple-100"}">
            <span class="text-[10.5px] font-black font-mono ${isPeak ? "text-purple-950" : "text-slate-600"}">${h}</span>
            
            <div class="h-20 w-full flex items-end justify-center my-1.5">
              <div 
                class="w-5 rounded-t-md transition-all duration-500 ${isPeak ? "bg-gradient-to-t from-purple-600 to-fuchsia-600 shadow-sm" : "bg-purple-300"}" 
                style="height: ${Math.max(10, percH)}%"
                title="${dataH.frascos} frascos (${dataH.ml} ml)"
              ></div>
            </div>

            <span class="text-xs font-black font-mono ${isPeak ? "text-purple-900" : "text-slate-800"}">${dataH.frascos}</span>
            <span class="text-[9.5px] text-slate-500">${(dataH.ml / 1000).toFixed(1)}L</span>
          </div>
        `;
      }).join("");
    }

    // 4. Distribuição por Enfermarias (Top 5)
    const painelEnf = document.getElementById("dash-painel-enfermarias");
    if (painelEnf) {
      const top5Enf = m.enfArray.slice(0, 5);
      const maxEnfMl = top5Enf.length > 0 ? top5Enf[0].ml : 1;

      painelEnf.innerHTML = top5Enf.map(enf => {
        const perc = maxEnfMl > 0 ? ((enf.ml / maxEnfMl) * 100).toFixed(0) : 0;
        return `
          <div class="space-y-1">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-800 truncate max-w-[200px]" title="${enf.nome}">${enf.nome}</span>
              <span class="font-mono font-bold text-purple-950">${(enf.ml / 1000).toFixed(1)} L <span class="text-[10px] text-slate-500 font-normal">(${enf.pacientes} leitos)</span></span>
            </div>
            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div class="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-500" style="width: ${perc}%"></div>
            </div>
          </div>
        `;
      }).join("");
    }

    // 5. Vias e Dispositivos
    const painelVias = document.getElementById("dash-painel-vias");
    if (painelVias) {
      const totalVias = m.totalAtivos || 1;
      const percOral = ((m.contagemVias.ORAL / totalVias) * 100).toFixed(0);
      const percEnteral = ((m.contagemVias.ENTERAL / totalVias) * 100).toFixed(0);

      painelVias.innerHTML = `
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="p-3 bg-purple-50/50 rounded-xl border border-purple-200 text-center">
            <div class="text-xs font-bold text-purple-900">Via Oral</div>
            <div class="text-xl font-black text-purple-950 font-mono mt-0.5">${m.contagemVias.ORAL} <span class="text-[10px] text-purple-700">(${percOral}%)</span></div>
          </div>
          <div class="p-3 bg-fuchsia-50/50 rounded-xl border border-fuchsia-200 text-center">
            <div class="text-xs font-bold text-fuchsia-900">Via Enteral (SNE/SNG)</div>
            <div class="text-xl font-black text-fuchsia-950 font-mono mt-0.5">${m.contagemVias.ENTERAL} <span class="text-[10px] text-fuchsia-700">(${percEnteral}%)</span></div>
          </div>
        </div>

        <div class="text-xs font-bold text-slate-700 mb-1.5">Dispositivos Utilizados:</div>
        <div class="flex flex-wrap gap-1.5">
          ${Object.entries(m.contagemDispositivos).map(([disp, qtd]) => `
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 border border-purple-200 shadow-2xs">
              <span>🍼 ${disp}:</span>
              <span class="font-mono text-purple-900 font-black">${qtd}</span>
            </span>
          `).join("")}
        </div>
      `;
    }
  }
};

if (typeof window !== "undefined") {
  window.DashboardModule = DashboardModule;
}
