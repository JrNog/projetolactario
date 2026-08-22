/**
 * Módulo Oficial de Pedido de Compras e Gestão de Estoque
 * Lactário - Hospital São Paulo (UNIFESP-EPM) / SPDM
 * 
 * Replicando fielmente a estrutura e fórmulas da planilha 'PEDIDO' do Excel oficial:
 * - Saídas calculadas em tempo real do censo ativo
 * - Conversão de gramas para latas/caixas
 * - Fórmula oficial de pedido: ROUNDUP(1.5 * Saída_em_Und, 0)
 * - Nomenclaturas técnicas padronizadas para requisição no Forms/Almoxarifado SPDM
 */

const ComprasModule = {
  // Catálogo Oficial de Itens de Pedido (Sincronizado com a planilha PEDIDO)
  ITENS_PEDIDO_OFICIAL: [
    {
      id: "pre_nan",
      nome: "PRE NAN",
      dietasAssociadas: ["pre_nan", "pre_nan_conc"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "F. I. RN de Baixo Peso - lata 400g - PreNan /",
      estoquePadrao: 1,
      isLiquido: false
    },
    {
      id: "nan_1",
      nome: "NAN 1",
      dietasAssociadas: ["nan_1", "nan_1_conc"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "F. I. c/ Ferro p/ Lactentes até seis meses - lata 400g - Nan 1",
      estoquePadrao: 2,
      isLiquido: false
    },
    {
      id: "nan_2",
      nome: "NAN 2",
      dietasAssociadas: ["nan_2", "nan_2_conc"],
      pesoEmbalagem: 800,
      unidade: "Lata",
      formsDesc: "F. I. de Seguimento p/ Lactentes acima de 6m - lt 800g - Nan 2",
      estoquePadrao: 6,
      isLiquido: false
    },
    {
      id: "ninho",
      nome: "NINHO",
      dietasAssociadas: ["ld_sem_acucar", "ld_com_acucar", "ld_achocolatado"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "Leite em pó Integral p/ lactentes - lata 400g - Ninho",
      estoquePadrao: 3,
      isLiquido: false
    },
    {
      id: "aptamil_soja",
      nome: "APTAMIL SOJA",
      dietasAssociadas: ["aptamil_soja"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "F. I. p/ lactentes de 0 a 6m a base de soja lt 400g - Nan Soja / Aptamil Soja",
      estoquePadrao: 4,
      isLiquido: false
    },
    {
      id: "leite_desnatado",
      nome: "LEITE DESNATADO",
      dietasAssociadas: ["leite_desnatado"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "Leite em pó desnatado instantâneo",
      estoquePadrao: 3,
      isLiquido: false
    },
    {
      id: "leite_sl_uht",
      nome: "LEITE SEM LACTOSE (ML)",
      dietasAssociadas: ["leite_sl_uht"],
      pesoEmbalagem: 1000,
      unidade: "Caixa de 1 Litro",
      formsDesc: "Leite UHT - sem lactose",
      estoquePadrao: 1,
      isLiquido: true
    },
    {
      id: "peptamen_jr",
      nome: "PEPTAMEN JUNIOR PÓ",
      dietasAssociadas: ["peptamen_jr"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "Dieta oral e enteral em pó semi-elementar NC e NP p/ crianças de 1 a 10 anos - Peptamen Jr. pó",
      estoquePadrao: 5,
      isLiquido: false
    },
    {
      id: "neocate_alfamino",
      nome: "NEOCATE/ALFAMINO",
      dietasAssociadas: ["neocate_lcp", "neocate_conc", "alfamino", "alfamino_conc"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "F. I. Elementar Hipoalergênica c/ aa livres - lt 400g - Neocate / Alfamino",
      estoquePadrao: 3,
      isLiquido: false
    },
    {
      id: "nan_sem_lactose",
      nome: "NAN SEM LACTOSE",
      dietasAssociadas: ["nan_sl", "nan_sl_conc"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "F. I. Isenta de Lactose - lata 400g - Nan s/ Lactose",
      estoquePadrao: 5,
      isLiquido: false
    },
    {
      id: "pregomin",
      nome: "PREGOMIN",
      dietasAssociadas: ["pregomin_1_30", "pregomin_1_25", "pregomin_1_20"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "F. I. Semi Elementar s/ Lactose p/ lactentes - lata 400g - Pregomin / Alfaré",
      estoquePadrao: 5,
      isLiquido: false
    },
    {
      id: "fortini_plus",
      nome: "FORTINI PLUS",
      dietasAssociadas: ["fortini_10", "fortini_15"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "Sup. em pó hipercalórico s/ fibras p/ crianças de 3 a 10 anos - Fortini Plus",
      estoquePadrao: 5,
      isLiquido: false
    },
    {
      id: "nan_espessar",
      nome: "NAN ESPESSAR",
      dietasAssociadas: ["nan_espessar", "nan_espessar_conc"],
      pesoEmbalagem: 800,
      unidade: "Lata",
      formsDesc: "F. I. Anti Regurgitação - lata 800g - Nan EspessaAR",
      estoquePadrao: 2,
      isLiquido: false
    },
    {
      id: "monogen",
      nome: "MONOGEN",
      dietasAssociadas: ["monogen"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "F. I. polimérica, baixo teor lipidico, c/ baixo teor de TCL e elevado teor de TCM - Monogen",
      estoquePadrao: 0,
      isLiquido: false
    },
    {
      id: "modulen",
      nome: "MODULEN",
      dietasAssociadas: ["modulen_10", "modulen_15"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "Dieta oral e enteral em pó para doença de crohn - Modulen",
      estoquePadrao: 1,
      isLiquido: false
    },
    {
      id: "infatrini",
      nome: "INFATRINI",
      dietasAssociadas: ["infatrini"],
      pesoEmbalagem: 400,
      unidade: "Lata",
      formsDesc: "F. I p/ lact. e crianças c/ necessidades dietoterápicas especificas 1kcal/ml - Infatrini pó",
      estoquePadrao: 1,
      isLiquido: false
    },
    {
      id: "ketocal",
      nome: "KETOCAL",
      dietasAssociadas: ["ketocal"],
      pesoEmbalagem: 300,
      unidade: "Lata",
      formsDesc: "D. I. oral/enteral em pó, NC, hiperlipídica - Ketocal",
      estoquePadrao: 1,
      isLiquido: false
    },
    {
      id: "frebini",
      nome: "FREBINI (BOLSAS)",
      dietasAssociadas: [],
      pesoEmbalagem: 500,
      unidade: "Bolsa unitaria",
      formsDesc: "D. E. Normocalórica e Normoproteica infantil S.F. - bolsa 500ml - Frebini",
      estoquePadrao: 0,
      isLiquido: true
    }
  ],

  /**
   * Obtém o estoque atual do localStorage ou valor padrão
   */
  getEstoque(itemId, padrao = 0) {
    try {
      const salvo = localStorage.getItem(`lac_estoque_${itemId}`);
      if (salvo !== null) return Number(salvo);
    } catch (e) {}
    return padrao;
  },

  /**
   * Salva o estoque no localStorage e atualiza a interface
   */
  salvarEstoque(itemId, valor) {
    try {
      localStorage.setItem(`lac_estoque_${itemId}`, Number(valor) || 0);
    } catch (e) {}
    if (typeof App !== "undefined") {
      App.renderizarCompras();
    }
  },

  /**
   * Calcula a planilha oficial de pedidos de compras com base no censo ativo
   */
  calcularRelatorio(pacientesAtivos, dietasCatalogo) {
    const mapaDietas = new Map();
    if (Array.isArray(dietasCatalogo)) {
      dietasCatalogo.forEach(d => mapaDietas.set(d.id, d));
    }

    const ativos = pacientesAtivos.filter(p => !p.suspenso && !p.alta);

    let totalLatasPedidoGeral = 0;
    let totalPoGeralG = 0;
    let totalItensEmUso = 0;
    let totalItensCriticos = 0;

    const linhas = ComprasModule.ITENS_PEDIDO_OFICIAL.map(item => {
      // Calcula a saída diária em gramas (ou ml) somando os pacientes ativos com as dietas associadas
      let saidasG = 0;
      let volumeTotalMl = 0;
      let pacientesCount = 0;

      ativos.forEach(p => {
        if (item.dietasAssociadas.includes(p.dietaId)) {
          const volUnit = Number(p.volumeMl) || 0;
          const vezes = Number(p.vezesDia) || 0;
          const volDiario = volUnit * vezes;

          const dObj = mapaDietas.get(p.dietaId) || { g_po_100ml: 14.0 };
          const gPo100ml = Number(dObj.g_po_100ml) || 14.0;

          if (item.isLiquido) {
            saidasG += volDiario; // em ml
          } else {
            saidasG += (volDiario * gPo100ml) / 100.0; // em g
          }

          volumeTotalMl += volDiario;
          pacientesCount++;
        }
      });

      // Conversão em unidades (latas / caixas)
      const saidaEmUnd = item.pesoEmbalagem > 0 ? (saidasG / item.pesoEmbalagem) : 0;

      // Fator oficial do Excel: ROUNDUP(1.5 * saidaEmUnd, 0)
      const pedidoCalculado = Math.ceil(1.5 * saidaEmUnd);

      // Estoque atual salvo
      const estoqueAtual = ComprasModule.getEstoque(item.id, item.estoquePadrao);

      // Dias de autonomia de estoque
      let diasAutonomia = saidaEmUnd > 0 ? (estoqueAtual / saidaEmUnd) : 999;
      let statusEstoque = "SUFICIENTE";
      if (saidasG > 0) {
        if (diasAutonomia < 1.5) {
          statusEstoque = "CRÍTICO";
          totalItensCriticos++;
        } else if (diasAutonomia < 3.0) {
          statusEstoque = "ATENÇÃO";
        }
        totalItensEmUso++;
      } else {
        statusEstoque = "SEM CONSUMO";
      }

      totalLatasPedidoGeral += pedidoCalculado;
      totalPoGeralG += saidasG;

      return {
        ...item,
        saidasG,
        volumeTotalMl,
        pacientesCount,
        saidaEmUnd,
        estoqueAtual,
        pedidoCalculado,
        diasAutonomia,
        statusEstoque
      };
    });

    return {
      linhas,
      totais: {
        totalLatasPedidoGeral,
        totalPoGeralKg: totalPoGeralG / 1000.0,
        totalItensEmUso,
        totalItensCriticos,
        totalPacientesAtivos: ativos.length
      }
    };
  },

  /**
   * Renderiza a interface da aba Compras
   */
  renderizarAba(pacientesAtivos, dietasCatalogo) {
    const container = document.getElementById("tab-compras");
    if (!container) return;

    const relatorio = ComprasModule.calcularRelatorio(pacientesAtivos, dietasCatalogo);

    container.innerHTML = `
      <div class="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        
        <!-- Zona Superior Fixa/Congelada de Compras (Banner + 4 Cards de KPI) -->
        <div class="shrink-0 space-y-2 mb-2 z-30">
          <!-- Banner e Resumo Executivo de Compras / Pedido -->
          <div class="bg-gradient-to-r from-purple-950 via-slate-950 to-purple-950 text-white rounded-xl p-3.5 shadow-sm border border-purple-900/40 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div class="text-[10px] uppercase font-black tracking-wider text-pink-300">HOSPITAL SÃO PAULO • CENTRAL DE NUTRIÇÃO E DIETÉTICA</div>
              <h2 class="text-sm sm:text-base font-black tracking-wide text-white mt-0.5">PEDIDO OFICIAL DE FÓRMULAS E SUPRIMENTOS</h2>
              <p class="text-xs text-purple-200 mt-0.5">
                Cálculo de requisição com margem de segurança <strong class="text-pink-300">ROUNDUP(1.5 × Saída Diária)</strong> e controle de estoque de segurança.
              </p>
            </div>

            <!-- Ações Rápidas de Compras -->
            <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
              <button 
                onclick="ComprasModule.copiarTextoForms()"
                class="px-3 py-1.5 rounded-lg text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs font-bold"
                title="Copiar lista com nomes oficiais para colar no formulário Google Forms / Email da SPDM"
              >
                <span>📋</span>
                <span>Copiar p/ Forms SPDM</span>
              </button>

              <button 
                onclick="ComprasModule.exportarCSVPedido()"
                class="px-3 py-1.5 rounded-lg text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs font-bold"
              >
                <span>📄</span>
                <span>Exportar CSV</span>
              </button>

              <button 
                onclick="ComprasModule.imprimirPedidoA4()"
                class="px-3.5 py-1.5 rounded-lg text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 border border-purple-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs font-bold text-xs"
              >
                <span>🖨️</span>
                <span>IMPRIMIR</span>
              </button>
            </div>
          </div>

          <!-- Indicadores de Cards Rápidos -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="bg-white border border-purple-200/80 rounded-xl p-3 text-center shadow-2xs" style="border-top: 3px solid #6b21a8;">
              <div class="text-[10px] uppercase font-bold text-purple-800">Total a Solicitar</div>
              <div class="text-lg sm:text-xl font-black font-mono text-purple-950 mt-0.5">${relatorio.totais.totalLatasPedidoGeral} un</div>
              <div class="text-[10px] text-purple-600 font-medium">latas / caixas</div>
            </div>
            <div class="bg-white border border-purple-200/80 rounded-xl p-3 text-center shadow-2xs" style="border-top: 3px solid #86198f;">
              <div class="text-[10px] uppercase font-bold text-purple-800">Consumo Diário</div>
              <div class="text-lg sm:text-xl font-black font-mono text-fuchsia-950 mt-0.5">${relatorio.totais.totalPoGeralKg.toFixed(2)} kg</div>
              <div class="text-[10px] text-purple-600 font-medium">pó manipulado/dia</div>
            </div>
            <div class="bg-white border border-purple-200/80 rounded-xl p-3 text-center shadow-2xs" style="border-top: 3px solid #db2777;">
              <div class="text-[10px] uppercase font-bold text-purple-800">Fórmulas em Uso</div>
              <div class="text-lg sm:text-xl font-black font-mono text-slate-900 mt-0.5">${relatorio.totais.totalItensEmUso}</div>
              <div class="text-[10px] text-purple-600 font-medium">de 18 itens cadastrados</div>
            </div>
            <div class="bg-white border border-purple-200/80 rounded-xl p-3 text-center shadow-2xs" style="border-top: 3px solid #e11d48;">
              <div class="text-[10px] uppercase font-bold text-purple-800">Estoque Crítico (&lt; 2d)</div>
              <div class="text-lg sm:text-xl font-black font-mono ${relatorio.totais.totalItensCriticos > 0 ? 'text-rose-700' : 'text-emerald-700'} mt-0.5">
                ${relatorio.totais.totalItensCriticos} itens
              </div>
              <div class="text-[10px] text-purple-600 font-medium">necessitam reposição</div>
            </div>
          </div>
        </div>

        <!-- Container Rolável da Tabela de Pedido com Sticky Thead -->
        <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar w-full pb-4 pr-1">
          <div class="bg-white border border-purple-200/80 rounded-xl overflow-hidden shadow-2xs" style="border-top: 4px solid #6b21a8;">
            <div class="bg-purple-50/70 px-4 py-2.5 border-b border-purple-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div class="flex items-center gap-2">
                <span class="text-base">📋</span>
                <h3 class="text-xs sm:text-sm font-bold text-purple-950 uppercase tracking-wider">
                  Mapa Oficial de Pedido e Controle de Estoque
                </h3>
              </div>
              <span class="text-[11px] text-purple-800 font-semibold">
                💡 Digite o estoque no campo abaixo para atualizar o status automaticamente.
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="sticky top-0 z-20 bg-purple-50/95 backdrop-blur-xs shadow-2xs">
                  <tr class="bg-purple-50/80 text-purple-950 font-bold border-b border-purple-200 text-[11px] uppercase">
                    <th class="py-2.5 px-3">Fórmula / Dieta</th>
                    <th class="py-2.5 px-2 text-center">Saídas (g / ml)</th>
                    <th class="py-2.5 px-2 text-center">Peso Lata</th>
                    <th class="py-2.5 px-2 text-center bg-purple-100/50 text-purple-950 border-x border-purple-200">Saída em Und/Dia</th>
                    <th class="py-2.5 px-3 text-center bg-pink-100/50 text-pink-950 border-r border-purple-200">Estoque Atual</th>
                    <th class="py-2.5 px-3 text-center bg-purple-200/60 text-purple-950 font-black border-r border-purple-200">Pedido Sugerido</th>
                    <th class="py-2.5 px-2 text-center">Unidade</th>
                    <th class="py-2.5 px-2 text-center">Autonomia</th>
                    <th class="py-2.5 px-3">Identificação no Forms SPDM</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-purple-100 font-mono text-slate-700 bg-white">
                  ${relatorio.linhas.map(row => `
                    <tr class="hover:bg-purple-50/40 transition-colors ${row.saidasG > 0 ? '' : 'text-slate-400 opacity-60'}">
                      <!-- Nome da Fórmula -->
                      <td class="py-2 px-3 font-sans font-bold text-slate-800 text-xs">
                        ${escapeHtml(row.nome)}
                      </td>

                      <!-- Saídas Calculadas em gramas / ml -->
                      <td class="py-2 px-2 text-center font-bold ${row.saidasG > 0 ? 'text-slate-900' : ''}">
                        ${row.saidasG > 0 ? `${row.saidasG.toFixed(1)} ${row.isLiquido ? 'ml' : 'g'}` : '-'}
                      </td>

                      <!-- Peso da Embalagem -->
                      <td class="py-2 px-2 text-center text-slate-600">
                        ${row.pesoEmbalagem} ${row.isLiquido ? 'ml' : 'g'}
                      </td>

                      <!-- Saída em Und / Dia -->
                      <td class="py-2 px-2 text-center font-bold text-purple-950 bg-purple-50/30 border-x border-purple-100">
                        ${row.saidaEmUnd > 0 ? row.saidaEmUnd.toFixed(2) : '-'}
                      </td>

                      <!-- Campo Editável de Estoque Atual -->
                      <td class="py-1.5 px-3 text-center bg-pink-50/30 border-r border-purple-100">
                        <input 
                          type="number" 
                          min="0" 
                          step="1" 
                          value="${row.estoqueAtual}" 
                          onchange="ComprasModule.salvarEstoque('${row.id}', this.value)"
                          class="w-16 bg-white text-purple-950 font-black text-center text-xs py-1 px-1.5 rounded border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </td>

                      <!-- Pedido Sugerido Oficial (ROUNDUP(1.5 * E, 0)) -->
                      <td class="py-2 px-3 text-center font-black text-sm bg-purple-100/40 text-purple-950 border-r border-purple-100">
                        ${row.pedidoCalculado > 0 ? `${row.pedidoCalculado} un` : '-'}
                      </td>

                      <!-- Unidade -->
                      <td class="py-2 px-2 text-center font-sans text-slate-700 text-[11px]">
                        ${escapeHtml(row.unidade)}
                      </td>

                      <!-- Status de Autonomia -->
                      <td class="py-2 px-2 text-center font-sans">
                        ${row.saidasG > 0 ? `
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.statusEstoque === 'CRÍTICO' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                            row.statusEstoque === 'ATENÇÃO' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }">
                            ${row.diasAutonomia.toFixed(1)} dias
                          </span>
                        ` : `
                          <span class="text-slate-400 text-[10px] font-medium">-</span>
                        `}
                      </td>

                      <!-- Nome Oficial no Forms -->
                      <td class="py-2 px-3 font-sans text-[11px] text-slate-600 truncate max-w-[280px]" title="${escapeHtml(row.formsDesc)}">
                        ${escapeHtml(row.formsDesc)}
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
                <tfoot>
                  <tr class="bg-purple-50/80 border-t-2 border-purple-200 font-bold font-mono text-purple-950 text-xs">
                    <td class="py-2.5 px-3 font-sans uppercase">TOTAL GERAL DE PEDIDO:</td>
                    <td class="py-2.5 px-2 text-center text-purple-950">${(relatorio.totais.totalPoGeralKg * 1000).toFixed(0)} g</td>
                    <td class="py-2.5 px-2 text-center">-</td>
                    <td class="py-2.5 px-2 text-center text-purple-950 bg-purple-100/50 border-x border-purple-200">-</td>
                    <td class="py-2.5 px-3 text-center text-pink-950 bg-pink-100/50 border-r border-purple-200">-</td>
                    <td class="py-2.5 px-3 text-center text-sm font-black text-purple-950 bg-purple-200/60 border-r border-purple-200">${relatorio.totais.totalLatasPedidoGeral} un</td>
                    <td class="py-2.5 px-2 text-center" colspan="3">Margem: ROUNDUP(1.5 × Saídas)</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Copia para o clipboard a lista com a descrição do Forms e as quantidades
   */
  copiarTextoForms() {
    const pacsAtivos = (typeof CensoModule !== "undefined") ? CensoModule.getPacientesAtivos() : [];
    const dietas = (typeof App !== "undefined") ? App.dietasCatalogo : [];
    const rel = ComprasModule.calcularRelatorio(pacsAtivos, dietas);

    let texto = `*PEDIDO DE FÓRMULAS INFANTIS - LACTÁRIO HOSPITAL SÃO PAULO*\n`;
    texto += `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;

    const itensComPedido = rel.linhas.filter(l => l.pedidoCalculado > 0);
    if (itensComPedido.length === 0) {
      alert("Nenhuma fórmula com demanda de pedido calculada no momento.");
      return;
    }

    itensComPedido.forEach(item => {
      texto += `• ${item.formsDesc}: *${item.pedidoCalculado} ${item.unidade}(s)* (Consumo: ${item.saidasG.toFixed(0)}g/dia | Estoque: ${item.estoqueAtual})\n`;
    });

    navigator.clipboard.writeText(texto).then(() => {
      alert("✓ Lista copiada para a área de transferência! Pronta para colar no formulário ou email.");
    }).catch(() => {
      prompt("Copie o texto do pedido abaixo:", texto);
    });
  },

  /**
   * Exporta a planilha de pedidos em CSV
   */
  exportarCSVPedido() {
    const pacsAtivos = (typeof CensoModule !== "undefined") ? CensoModule.getPacientesAtivos() : [];
    const dietas = (typeof App !== "undefined") ? App.dietasCatalogo : [];
    const rel = ComprasModule.calcularRelatorio(pacsAtivos, dietas);

    let csv = "data:text/csv;charset=utf-8,";
    csv += "Formula,Saidas_G,Peso_Lata,Saida_Und_Dia,Estoque_Atual,Pedido_Sugerido,Unidade,Autonomia_Dias,Identificacao_Forms\n";

    rel.linhas.forEach(l => {
      csv += `"${l.nome}",${l.saidasG.toFixed(1)},${l.pesoEmbalagem},${l.saidaEmUnd.toFixed(2)},${l.estoqueAtual},${l.pedidoCalculado},"${l.unidade}",${l.diasAutonomia.toFixed(1)},"${l.formsDesc}"\n`;
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pedido_lactario_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Impressão do Relatório de Pedido em Folha A4
   */
  imprimirPedidoA4() {
    const container = document.getElementById("print-area-bancada");
    if (!container) return;

    const pacsAtivos = (typeof CensoModule !== "undefined") ? CensoModule.getPacientesAtivos() : [];
    const dietas = (typeof App !== "undefined") ? App.dietasCatalogo : [];
    const rel = ComprasModule.calcularRelatorio(pacsAtivos, dietas);

    const agora = new Date();
    const dataHoraStr = agora.toLocaleDateString("pt-BR") + " às " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    container.innerHTML = `
      <div style="padding: 6mm; font-family: Arial, sans-serif; color: #000000; background: #ffffff;">
        <div style="border-bottom: 2px solid #000000; padding-bottom: 3mm; margin-bottom: 4mm; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 13pt; font-weight: 900;">HOSPITAL SÃO PAULO - UNIFESP • SPDM</div>
            <div style="font-size: 10pt; font-weight: bold; color: #334155;">CENTRAL DE NUTRIÇÃO E DIETÉTICA • LACTÁRIO</div>
            <div style="font-size: 11pt; font-weight: 900; color: #0369a1; margin-top: 1mm;">REQUISIÇÃO OFICIAL DE FÓRMULAS INFANTIS E ENTERAIS</div>
          </div>
          <div style="text-align: right; font-size: 8.5pt;">
            <div><strong>Emissão:</strong> ${dataHoraStr}</div>
            <div><strong>Total a Pedir:</strong> ${rel.totais.totalLatasPedidoGeral} latas/unidades</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-top: 2mm;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1.5px solid #000000;">
              <th style="padding: 1.5mm; text-align: left; width: 20%;">Fórmula</th>
              <th style="padding: 1.5mm; text-align: center; width: 12%;">Saída Diária (g)</th>
              <th style="padding: 1.5mm; text-align: center; width: 10%;">Peso Lata</th>
              <th style="padding: 1.5mm; text-align: center; width: 10%;">Saída (und)</th>
              <th style="padding: 1.5mm; text-align: center; width: 10%;">Estoque</th>
              <th style="padding: 1.5mm; text-align: center; width: 12%; font-weight: 900;">PEDIDO</th>
              <th style="padding: 1.5mm; text-align: left; width: 26%;">Identificação Oficial no Forms SPDM</th>
            </tr>
          </thead>
          <tbody>
            ${rel.linhas.map(row => `
              <tr style="border-bottom: 0.5px solid #cbd5e1; ${row.pedidoCalculado > 0 ? '' : 'color: #94a3b8;'}">
                <td style="padding: 1.5mm; font-weight: bold;">${escapeHtml(row.nome)}</td>
                <td style="padding: 1.5mm; text-align: center; font-family: monospace;">${row.saidasG > 0 ? row.saidasG.toFixed(1) : '-'}</td>
                <td style="padding: 1.5mm; text-align: center;">${row.pesoEmbalagem}g</td>
                <td style="padding: 1.5mm; text-align: center; font-family: monospace;">${row.saidaEmUnd > 0 ? row.saidaEmUnd.toFixed(2) : '-'}</td>
                <td style="padding: 1.5mm; text-align: center; font-family: monospace;">${row.estoqueAtual}</td>
                <td style="padding: 1.5mm; text-align: center; font-family: monospace; font-weight: 900; background: ${row.pedidoCalculado > 0 ? '#fef3c7' : 'transparent'};">
                  ${row.pedidoCalculado > 0 ? `${row.pedidoCalculado} ${row.unidade}` : '-'}
                </td>
                <td style="padding: 1.5mm; font-size: 7.5pt;">${escapeHtml(row.formsDesc)}</td>
              </tr>
            `).join("")}
            <tr style="background: #e2e8f0; font-weight: bold; border-top: 1.5px solid #000000;">
              <td style="padding: 2mm;">TOTAL GERAL:</td>
              <td style="padding: 2mm; text-align: center;">${(rel.totais.totalPoGeralKg * 1000).toFixed(0)} g</td>
              <td colspan="3" style="text-align: right; padding-right: 2mm;">TOTAL SOLICITADO:</td>
              <td style="padding: 2mm; text-align: center; font-weight: 900; font-size: 9pt;">${rel.totais.totalLatasPedidoGeral} un</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 10mm; padding-top: 4mm; border-top: 1px solid #000000; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8.5pt;">
          <div>Solicitante (Lactarista): ___________________________</div>
          <div style="text-align: center;">
            ${(() => {
              const nutri = (typeof App !== "undefined" && typeof App.obterDadosNutricionista === "function") ? App.obterDadosNutricionista() : {};
              return nutri.nome 
                ? `<strong>${escapeHtml(nutri.nome)}</strong> • CRN: ${escapeHtml(nutri.crn || 'Não informado')}`
                : `Nutricionista Responsável / CRN: ___________________________`;
            })()}
          </div>
          <div>Recebido Almoxarifado: ___________________________</div>
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
  window.ComprasModule = ComprasModule;
}
