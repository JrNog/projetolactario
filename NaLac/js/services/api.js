/**
 * Camada de API e Sincronização de Dados
 * Lactário Digital - Hospital São Paulo (UNIFESP-EPM)
 * 
 * Opera em modo híbrido:
 * 1. Conexão direta com Google Apps Script Web App (se URL configurada).
 * 2. Persistência local em LocalStorage com integridade imediata para garantir
 *    operação 100% ininterrupta na bancada hospitalar mesmo sem internet.
 */

const ApiService = {
  // Obter URL do Google Apps Script configurada
  getApiUrl() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.API_URL) || CONFIG.API_URL_DEFAULT || "";
  },

  // Salvar nova URL do Google Apps Script
  setApiUrl(url) {
    if (url) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.API_URL, url.trim());
    } else {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.API_URL);
    }
  },

  // Inicializar dados padrão se armazenamento local estiver vazio
  initLocalData() {
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.CENSO)) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.CENSO, JSON.stringify(MOCK_CENSO));
    }
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.DIETAS)) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.DIETAS, JSON.stringify(DIETAS_PADRAO));
    }
  },

  // Fetch seguro com timeout (5s) para nunca travar a interface da bancada
  async fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  },

  // Carregar Censo de Pacientes (Local ou Google Sheets)
  async getCenso() {
    const apiUrl = this.getApiUrl();
    if (apiUrl) {
      try {
        const response = await this.fetchWithTimeout(`${apiUrl}?action=getCenso`, { method: "GET" }, 5000);
        if (response.ok) {
          const result = await response.json();
          if (result.status === "success" && Array.isArray(result.data)) {
            // Atualiza cache local
            localStorage.setItem(CONFIG.STORAGE_KEYS.CENSO, JSON.stringify(result.data));
            return { data: result.data, source: "google_sheets" };
          }
        }
      } catch (err) {
        console.warn("Aviso: Falha ao sincronizar com Google Apps Script. Usando dados locais.", err);
      }
    }

    // Fallback Local
    this.initLocalData();
    const local = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CENSO) || "[]");
    return { data: local, source: "local_storage" };
  },

  // Salvar todo o Censo de Pacientes
  async saveCenso(censoList) {
    // Sempre salva localmente primeiro (resiliência imediata)
    localStorage.setItem(CONFIG.STORAGE_KEYS.CENSO, JSON.stringify(censoList));

    const apiUrl = this.getApiUrl();
    if (apiUrl) {
      try {
        const response = await this.fetchWithTimeout(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" }, // text/plain evita preflight CORS no Apps Script
          body: JSON.stringify({ action: "saveCenso", data: censoList })
        }, 5000);
        if (response.ok) {
          const result = await response.json();
          return { success: true, synced: true, result };
        }
      } catch (err) {
        console.warn("Aviso: Erro ao enviar dados ao Google Sheets. Salvo localmente.", err);
        return { success: true, synced: false, warning: "Salvo localmente (sem sync Google Sheets)" };
      }
    }

    return { success: true, synced: false, message: "Salvo localmente com sucesso." };
  },

  // Carregar Catálogo de Fórmulas e Dietas
  async getDietas() {
    this.initLocalData();
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.DIETAS) || "[]");
    } catch (e) {
      local = [];
    }

    // Se o catálogo local estiver desatualizado (possui subitens legados ou múltiplos em ESPECIAIS)
    const especiaisLocais = Array.isArray(local) ? local.filter(d => d.categoria === "ESPECIAIS") : [];
    const hasLegacy = especiaisLocais.length > 1 || local.some(d => d.id === "leite_vegetal" || d.id === "formula_customizada");

    if (!Array.isArray(local) || local.length === 0 || hasLegacy) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.DIETAS, JSON.stringify(DIETAS_PADRAO));
      // Limpa também chave legada v1 se existir
      localStorage.removeItem("lactario_hsp_dietas_v1");
      return DIETAS_PADRAO;
    }

    return local;
  },

  // Salvar Catálogo de Fórmulas
  async saveDietas(dietasList) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.DIETAS, JSON.stringify(dietasList));
    const apiUrl = this.getApiUrl();
    if (apiUrl) {
      try {
        await this.fetchWithTimeout(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "saveDietas", data: dietasList })
        }, 5000);
      } catch (e) {
        console.warn("Erro ao sincronizar dietas com Google Sheets", e);
      }
    }
    return { success: true };
  },

  // Salvar Registro de Alta Hospitalar (TB_LOG_ALTAS)
  async saveAlta(altaData) {
    const apiUrl = this.getApiUrl();
    if (apiUrl && altaData) {
      try {
        await this.fetchWithTimeout(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "saveAlta", data: altaData })
        }, 5000);
      } catch (e) {
        console.warn("Erro ao sincronizar alta com Google Sheets (TB_LOG_ALTAS)", e);
      }
    }
    return { success: true };
  },

  // Obter Histórico de Altas Hospitalares
  async getAltas() {
    const apiUrl = this.getApiUrl();
    if (apiUrl) {
      try {
        const response = await this.fetchWithTimeout(`${apiUrl}?action=getAltas`, { method: "GET" }, 5000);
        if (response.ok) {
          const res = await response.json();
          if (res.status === "success" && Array.isArray(res.data)) {
            return res.data;
          }
        }
      } catch (e) {
        console.warn("Aviso: Falha ao buscar histórico de altas no Google Sheets", e);
      }
    }
    return JSON.parse(localStorage.getItem("lactario_hsp_altas_v1") || "[]");
  },

  // Salvar Snapshot de Versão
  async saveSnapshot(snapData) {
    const apiUrl = this.getApiUrl();
    if (apiUrl && snapData) {
      try {
        await this.fetchWithTimeout(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "saveSnapshot", data: snapData })
        }, 5000);
      } catch (e) {
        console.warn("Erro ao sincronizar snapshot com Google Sheets", e);
      }
    }
    return { success: true };
  },

  // Enviar Log de Auditoria
  async appendAuditLog(logData) {
    const apiUrl = this.getApiUrl();
    if (apiUrl && logData) {
      try {
        await this.fetchWithTimeout(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "appendAuditLog", data: logData })
        }, 5000);
      } catch (e) {
        console.warn("Erro ao sincronizar log de auditoria com Google Sheets", e);
      }
    }
    return { success: true };
  },

  // Restaurar dados de demonstração
  resetToMock() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.CENSO, JSON.stringify(MOCK_CENSO));
    localStorage.setItem(CONFIG.STORAGE_KEYS.DIETAS, JSON.stringify(DIETAS_PADRAO));
    return { success: true };
  }
};

if (typeof window !== "undefined") {
  window.ApiService = ApiService;
}
