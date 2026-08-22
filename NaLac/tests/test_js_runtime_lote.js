/**
 * Teste de Execução em Tempo Real do Módulo Lote e Esteira (Node.js DOM Simulation)
 * Testa o carregamento real dos scripts sem mocks sintéticos de métodos
 */

const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = global;
global.document = {
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        id,
        classList: {
          classes: new Set(['hidden']),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        innerHTML: '',
        textContent: '',
        value: '',
        checked: false,
        disabled: false,
        focus() {},
        parentNode: {
          appendChild() {},
          insertBefore() {}
        },
        remove() {}
      };
    }
    return this.elements[id];
  },
  querySelectorAll() {
    return [];
  },
  querySelector() {
    return null;
  },
  createElement(tag) {
    return {
      tagName: tag,
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      innerHTML: '',
      textContent: '',
      parentNode: null
    };
  },
  elements: {}
};

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

// Carregar arquivos REAIS do projeto
const configJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'config.js'), 'utf8');
eval(configJs);

const auditoriaJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', 'auditoria.js'), 'utf8');
eval(auditoriaJs);

const apiJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'services', 'api.js'), 'utf8');
eval(apiJs);

const censoJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', 'censo.js'), 'utf8');
eval(censoJs);

const loteJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', 'lote-esteira.js'), 'utf8');
eval(loteJs);

global.App = {
  mostrarToast: () => {},
  renderizarTudo: () => {},
  fecharModalPaciente: () => {},
  abrirModalEdicao: (id) => {
    App.ultimoIdEditado = id;
  }
};

async function runTests() {
  console.log("Iniciando testes rigorosos de runtime JS com arquivos reais...");

  // Setup initial patients
  CensoModule.pacientes = [
    { id: "PAC_001", rh: "123456", nome: "LUCAS SILVA", leito: "01", enfermaria: "8L", enfermariaNome: "8º LESTE", dietaNome: "FÓRMULA 1", volumeMl: 60, vezesDia: 8, alta: false, suspenso: false },
    { id: "PAC_002", rh: "234567", nome: "MARINA COSTA", leito: "02", enfermaria: "8L", enfermariaNome: "8º LESTE", dietaNome: "FÓRMULA 2", volumeMl: 90, vezesDia: 8, alta: false, suspenso: false },
    { id: "PAC_003", rh: "345678", nome: "PEDRO SANTOS", leito: "03", enfermaria: "UTI_PED", enfermariaNome: "UTI PEDIÁTRICA", dietaNome: "FÓRMULA 3", volumeMl: 40, vezesDia: 12, alta: false, suspenso: false }
  ];

  // 1. Test Selection
  LoteEsteiraModule.limparSelecao();
  if (LoteEsteiraModule.getIdsSelecionados().length !== 0) throw new Error("Falha ao limpar seleção");

  LoteEsteiraModule.toggleSelecao("PAC_001");
  LoteEsteiraModule.toggleSelecao("PAC_002");
  if (LoteEsteiraModule.getIdsSelecionados().length !== 2) throw new Error("Falha no toggleSelecao");

  const selecionados = LoteEsteiraModule.getPacientesSelecionados();
  if (selecionados.length !== 2 || selecionados[0].nome !== "LUCAS SILVA" || selecionados[1].nome !== "MARINA COSTA") {
    throw new Error("getPacientesSelecionados não retornou os pacientes esperados");
  }
  console.log("✅ 1. Seleção múltipla e busca de pacientes OK");

  // 2. Test Esteira de Edição
  LoteEsteiraModule.iniciarEsteiraEdicao();
  if (!LoteEsteiraModule.esteiraEdicao.ativa) throw new Error("Esteira de edição não ativou");
  if (App.ultimoIdEditado !== "PAC_001") throw new Error("Primeiro paciente da esteira não foi aberto");

  // Save and advance in esteira
  LoteEsteiraModule.salvarAvancarEsteira(
    { id: "PAC_001", volumeMl: 60 },
    { id: "PAC_001", volumeMl: 75, nome: "LUCAS SILVA", leito: "01", enfermaria: "8L", rh: "123456" },
    [{ campo: "Volume", de: "60 ml", para: "75 ml" }]
  );

  if (LoteEsteiraModule.esteiraEdicao.indiceAtual !== 1) throw new Error("Esteira não avançou o índice");
  if (App.ultimoIdEditado !== "PAC_002") throw new Error("Segundo paciente da esteira não foi aberto");

  // Save second patient
  LoteEsteiraModule.salvarAvancarEsteira(
    { id: "PAC_002", dietaNome: "FÓRMULA 2" },
    { id: "PAC_002", dietaNome: "FÓRMULA 2 PREMIUM", nome: "MARINA COSTA", leito: "02", enfermaria: "8L", rh: "234567" },
    [{ campo: "Dieta", de: "FÓRMULA 2", para: "FÓRMULA 2 PREMIUM" }]
  );

  if (LoteEsteiraModule.esteiraEdicao.ativa !== false) throw new Error("Esteira deveria ter finalizado");
  console.log("✅ 2. Esteira de edição sequencial com avanço e finalização OK");

  // 3. Test Alta Individual (Simulando clique sem argumento, com argumento e com DOM event)
  LoteEsteiraModule.abrirModalAltaIndividual("PAC_003");
  const modalAlta = document.getElementById("modal-alta-paciente");
  if (modalAlta.classList.contains("hidden")) throw new Error("Modal de alta individual não abriu");

  document.getElementById("modal-alta-observacao").value = "Alta médica para domicílio com sucesso";
  
  // Chamada simulando clique direto no botão
  await LoteEsteiraModule.confirmarAltaAtual();

  const pac3 = CensoModule.obterPorId("PAC_003");
  if (!pac3.alta) throw new Error("Paciente 3 deveria estar marcado com alta");
  
  const altasLocais = LoteEsteiraModule.getAltasLocais();
  if (altasLocais.length === 0 || altasLocais[0].pacienteId !== "PAC_003") {
    throw new Error("Alta não foi registrada no localStorage");
  }

  // Verifica se o modal fechou
  if (!modalAlta.classList.contains("hidden")) throw new Error("Modal de alta deveria estar fechado (hidden)");

  // Verifica estado do botão
  const btnConfirmar = document.getElementById("btn-confirmar-alta-paciente");
  if (btnConfirmar.disabled) throw new Error("Botão de confirmação deveria estar reabilitado (disabled=false)");
  if (btnConfirmar.innerHTML.includes("Gravando")) throw new Error("Botão não deveria mais conter texto 'Gravando...'");

  console.log("✅ 3. Alta individual com observação, fechamento imediato do modal e reabilitação do botão OK");

  // 4. Test Esteira de Alta
  LoteEsteiraModule.selecionarTodos(true); // Seleciona PAC_001 e PAC_002
  if (LoteEsteiraModule.getIdsSelecionados().length !== 2) throw new Error("Selecionar todos falhou");

  LoteEsteiraModule.iniciarEsteiraAlta();
  if (!LoteEsteiraModule.esteiraAlta.ativa) throw new Error("Esteira de alta não ativou");

  await LoteEsteiraModule.confirmarAltaAtual();
  if (LoteEsteiraModule.esteiraAlta.indiceAtual !== 1) throw new Error("Esteira de alta não avançou para o segundo");

  await LoteEsteiraModule.confirmarAltaAtual();
  if (LoteEsteiraModule.esteiraAlta.ativa !== false) throw new Error("Esteira de alta deveria ter finalizado");

  console.log("✅ 4. Esteira de alta em lote OK");
  console.log("🎉 TODOS OS TESTES DE RUNTIME JS PASSARAM COM 100% DE SUCESSO!");
}

runTests().catch(err => {
  console.error("❌ ERRO NO TESTE DE RUNTIME:", err);
  process.exit(1);
});
