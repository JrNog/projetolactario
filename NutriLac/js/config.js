/**
 * Lactário Digital - Hospital São Paulo (UNIFESP-EPM)
 * Configurações Institucionais e Parâmetros do Sistema
 */

const CONFIG = {
  INSTITUICAO: {
    NOME_PRINCIPAL: "HOSPITAL SÃO PAULO",
    SUBTITULO: "UNIFESP - EPM",
    SETOR: "SERVIÇO DE NUTRIÇÃO E DIETÉTICA - LACTÁRIO",
    CIDADE_UF: "São Paulo - SP"
  },
  
  // Parâmetros de Impressão e Validade
  ETIQUETAS: {
    LARGURA_MM: 100,
    ALTURA_MM: 50,
    VALIDADE_PADRAO_HORAS: 2, // Validade padrão de 2 horas a partir do preparo
    EXIBIR_LOTE: false, // Lote não necessário conforme definição
    EXIBIR_CABECALHO: true,
  },

  // Turnos Operacionais do Lactário
  TURNOS: [
    { id: "M1", nome: "Manhã 1", horario: "06:00 - 10:00", padraoHorario: "08:00" },
    { id: "M2", nome: "Manhã 2", horario: "10:00 - 14:00", padraoHorario: "11:00" },
    { id: "T1", nome: "Tarde 1", horario: "14:00 - 18:00", padraoHorario: "15:00" },
    { id: "N1", nome: "Noite 1", horario: "18:00 - 22:00", padraoHorario: "19:00" },
    { id: "N2", nome: "Noite 2 / Madrugada", horario: "22:00 - 06:00", padraoHorario: "23:00" }
  ],

  // Dispositivos de Administração Controlados
  DISPOSITIVOS: [
    "Mamadeira",
    "Frasco Enteral",
    "Frasco V.O.",
    "Chuca sem bico",
    "Copo",
    "Seringa",
    "Equipo Roxo"
  ],

  // Vias de Administração
  VIAS: [
    "ORAL",
    "ENTERAL",
    "SONDA NASOGÁSTRICA (SNG)",
    "SONDA NASOENTERAL (SNE)",
    "GASTROSTOMIA (GTT)"
  ],

  // Chaves de Armazenamento Local
  STORAGE_KEYS: {
    CENSO: "lactario_hsp_censo_v1",
    DIETAS: "lactario_hsp_dietas_v2",
    CONFIG: "lactario_hsp_config_v1",
    LOGS: "lactario_hsp_logs_v1",
    API_URL: "lactario_hsp_api_url_v1"
  },

  // URL Padrão da API Google Apps Script (gerada e injetada pelo Configurador Automático)
  API_URL_DEFAULT: "https://script.google.com/macros/s/AKfycbwkTp0Zk_45BhWmqskYaWSMD5wZTjxolZFzpjsiJ5fYwevXoji25A2jTSBzyYNTOFc-/exec",

  // Multiplicador de contingência para pedidos de fim de semana
  FATOR_FIM_DE_SEMANA: 1.5,

  // Sanitizador de texto para prevenção de XSS em interfaces hospitalares
  escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
  window.escapeHtml = escapeHtml;
}


