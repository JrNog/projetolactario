/**
 * ============================================================================
 * LACTÁRIO DIGITAL - HOSPITAL SÃO PAULO (UNIFESP-EPM)
 * Backend Google Apps Script (Web App REST API)
 * ============================================================================
 * 
 * Este script transforma sua planilha Google Sheets em um banco de dados
 * em nuvem de alta velocidade e resiliente para o Lactário HSP / NutriLac.
 */

// Nomes oficiais das abas do banco de dados na planilha
const SHEET_CENSO = "DB_Censo";
const SHEET_DIETAS = "DB_Dietas";
const SHEET_ENFERMARIAS = "DB_Enfermarias";
const SHEET_SNAPSHOTS = "DB_Snapshots";
const SHEET_LOGS = "DB_Logs";
const SHEET_ALTAS = "TB_LOG_ALTAS";

/**
 * Resposta formatada em JSON com cabeçalhos CORS liberados
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Garante que todas as abas e cabeçalhos existam automaticamente
 */
function verificarEstruturaPlanilha() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Aba DB_Censo
  let sCenso = ss.getSheetByName(SHEET_CENSO);
  if (!sCenso) {
    sCenso = ss.insertSheet(SHEET_CENSO);
    const headersCenso = [
      "id", "rh", "nome", "enfermaria", "enfermariaNome", "leito",
      "dietaId", "dietaNome", "dietaEspecialDesc", "volumeMl", "vezesDia", "via",
      "dispositivo", "espessanteObs", "calCalorico", "horarioInicio",
      "suspenso", "updatedAt"
    ];
    sCenso.getRange(1, 1, 1, headersCenso.length).setValues([headersCenso]);
    sCenso.getRange(1, 1, 1, headersCenso.length)
      .setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold").setFontFamily("Arial");
    sCenso.setFrozenRows(1);
  }

  // 2. Aba DB_Dietas
  let sDietas = ss.getSheetByName(SHEET_DIETAS);
  if (!sDietas) {
    sDietas = ss.insertSheet(SHEET_DIETAS);
    const headersDietas = [
      "id", "nome", "categoria", "categoriaNome", "g_po_100ml", "ml_agua_100ml",
      "peso_lata_g", "colher_medida_g", "kcal_100ml", "densidade_padrao", "temperatura_preparo", "instrucoes"
    ];
    sDietas.getRange(1, 1, 1, headersDietas.length).setValues([headersDietas]);
    sDietas.getRange(1, 1, 1, headersDietas.length)
      .setBackground("#166534").setFontColor("#ffffff").setFontWeight("bold").setFontFamily("Arial");
    sDietas.setFrozenRows(1);
  }

  // 3. Aba DB_Snapshots
  let sSnap = ss.getSheetByName(SHEET_SNAPSHOTS);
  if (!sSnap) {
    sSnap = ss.insertSheet(SHEET_SNAPSHOTS);
    const headersSnap = ["id", "nome", "tipo", "motivo", "dataHora", "responsavel", "dadosJson"];
    sSnap.getRange(1, 1, 1, headersSnap.length).setValues([headersSnap]);
    sSnap.getRange(1, 1, 1, headersSnap.length)
      .setBackground("#7e22ce").setFontColor("#ffffff").setFontWeight("bold").setFontFamily("Arial");
    sSnap.setFrozenRows(1);
  }

  // 4. Aba DB_Logs (Auditoria Geral)
  let sLogs = ss.getSheetByName(SHEET_LOGS);
  if (!sLogs) {
    sLogs = ss.insertSheet(SHEET_LOGS);
    const headersLogs = ["timestamp", "dataHoraFormatada", "responsavel", "modulo", "acao", "titulo", "alteracoesJson", "metadataJson"];
    sLogs.getRange(1, 1, 1, headersLogs.length).setValues([headersLogs]);
    sLogs.getRange(1, 1, 1, headersLogs.length)
      .setBackground("#334155").setFontColor("#ffffff").setFontWeight("bold").setFontFamily("Arial");
    sLogs.setFrozenRows(1);
  }

  // 5. Aba TB_LOG_ALTAS (Histórico Oficial de Altas Hospitalares)
  let sAltas = ss.getSheetByName(SHEET_ALTAS);
  if (!sAltas) {
    sAltas = ss.insertSheet(SHEET_ALTAS);
    const headersAltas = [
      "id", "pacienteId", "rh", "nome", "enfermaria", "enfermariaNome", "leito",
      "dietaNome", "volumeMl", "vezesDia", "dataHoraAlta", "responsavel", "motivoObservacao"
    ];
    sAltas.getRange(1, 1, 1, headersAltas.length).setValues([headersAltas]);
    sAltas.getRange(1, 1, 1, headersAltas.length)
      .setBackground("#0f172a").setFontColor("#ffffff").setFontWeight("bold").setFontFamily("Arial");
    sAltas.setFrozenRows(1);
  }
}

/**
 * Endpoint HTTP GET (Leitura de Dados)
 */
function doGet(e) {
  try {
    verificarEstruturaPlanilha();
    const action = e && e.parameter ? e.parameter.action : "ping";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "ping") {
      return createJsonResponse({
        status: "success",
        message: "API Lactário Digital HSP Online!",
        planilhaNome: ss.getName(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === "getCenso") {
      const sheet = ss.getSheetByName(SHEET_CENSO);
      const rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) return createJsonResponse({ status: "success", data: [] });

      const headers = rows[0];
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;
        const obj = {};
        headers.forEach((h, idx) => {
          let val = row[idx];
          if (h === "suspenso") val = (val === true || val === "true" || val === "S" || val === "s");
          if (h === "volumeMl" || h === "vezesDia") val = Number(val) || 0;
          obj[h] = val;
        });
        data.push(obj);
      }
      return createJsonResponse({ status: "success", data: data });
    }

    if (action === "getDietas") {
      const sheet = ss.getSheetByName(SHEET_DIETAS);
      const rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) return createJsonResponse({ status: "success", data: [] });

      const headers = rows[0];
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = row[idx]; });
        data.push(obj);
      }
      return createJsonResponse({ status: "success", data: data });
    }

    if (action === "getSnapshots") {
      const sheet = ss.getSheetByName(SHEET_SNAPSHOTS);
      const rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) return createJsonResponse({ status: "success", data: [] });

      const headers = rows[0];
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;
        const obj = {};
        headers.forEach((h, idx) => {
          if (h === "dadosJson") {
            try { obj["dados"] = JSON.parse(row[idx]); } catch (e) { obj["dados"] = null; }
          } else {
            obj[h] = row[idx];
          }
        });
        data.push(obj);
      }
      return createJsonResponse({ status: "success", data: data });
    }

    if (action === "getAltas") {
      const sheet = ss.getSheetByName(SHEET_ALTAS);
      const rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) return createJsonResponse({ status: "success", data: [] });

      const headers = rows[0];
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = row[idx]; });
        data.push(obj);
      }
      return createJsonResponse({ status: "success", data: data });
    }

    return createJsonResponse({ status: "error", message: "Ação não reconhecida: " + action });

  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Endpoint HTTP POST (Gravação com Proteção LockService contra Concorrência)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  const success = lock.tryLock(10000);
  if (!success) {
    return createJsonResponse({
      status: "error",
      message: "O servidor está ocupado processando outra requisição de bancada. Tente novamente em instantes."
    });
  }

  try {
    verificarEstruturaPlanilha();
    const rawData = e.postData.contents;
    const payload = JSON.parse(rawData);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Salvar Censo Completo
    if (payload.action === "saveCenso") {
      const sheet = ss.getSheetByName(SHEET_CENSO);
      const censoList = payload.data || [];
      const headers = [
        "id", "rh", "nome", "enfermaria", "enfermariaNome", "leito",
        "dietaId", "dietaNome", "dietaEspecialDesc", "volumeMl", "vezesDia", "via",
        "dispositivo", "espessanteObs", "calCalorico", "horarioInicio",
        "suspenso", "updatedAt"
      ];

      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }

      if (censoList.length > 0) {
        const rowsToInsert = censoList.map(p => [
          p.id || "",
          p.rh || "",
          p.nome || "",
          p.enfermaria || "",
          p.enfermariaNome || "",
          p.leito || "",
          p.dietaId || "",
          p.dietaNome || "",
          p.dietaEspecialDesc || "",
          Number(p.volumeMl) || 0,
          Number(p.vezesDia) || 0,
          p.via || "ORAL",
          p.dispositivo || "Mamadeira",
          p.espessanteObs || "Sem espessante",
          p.calCalorico || "",
          p.horarioInicio || "06:00",
          p.suspenso ? "S" : "N",
          p.updatedAt || new Date().toISOString()
        ]);
        sheet.getRange(2, 1, rowsToInsert.length, headers.length).setValues(rowsToInsert);
      }

      registrarLog(ss, "CENSO", "ATUALIZACAO", "Sincronização de Censo", `Total de pacientes: ${censoList.length}`);
      return createJsonResponse({ status: "success", message: "Censo salvo no Google Sheets!", count: censoList.length });
    }

    // 2. Salvar Fórmulas / Catálogo
    if (payload.action === "saveDietas") {
      const sheet = ss.getSheetByName(SHEET_DIETAS);
      const dietasList = payload.data || [];
      const headers = [
        "id", "nome", "categoria", "categoriaNome", "g_po_100ml", "ml_agua_100ml",
        "peso_lata_g", "colher_medida_g", "kcal_100ml", "densidade_padrao", "temperatura_preparo", "instrucoes"
      ];

      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }

      if (dietasList.length > 0) {
        const rowsToInsert = dietasList.map(d => [
          d.id || "",
          d.nome || "",
          d.categoria || "",
          d.categoriaNome || "",
          d.g_po_100ml || "",
          d.ml_agua_100ml || "",
          d.peso_lata_g || "",
          d.colher_medida_g || "",
          d.kcal_100ml || "",
          d.densidade_padrao || "",
          d.temperatura_preparo || "",
          d.instrucoes || ""
        ]);
        sheet.getRange(2, 1, rowsToInsert.length, headers.length).setValues(rowsToInsert);
      }

      registrarLog(ss, "CATALOGO", "ATUALIZACAO", "Catálogo de Fórmulas Atualizado", `Total de fórmulas: ${dietasList.length}`);
      return createJsonResponse({ status: "success", message: "Catálogo de fórmulas salvo no Google Sheets!" });
    }

    // 3. Salvar Registro de Alta Hospitalar (TB_LOG_ALTAS)
    if (payload.action === "saveAlta") {
      const sheet = ss.getSheetByName(SHEET_ALTAS);
      const alta = payload.data || {};
      sheet.appendRow([
        alta.id || ("ALTA_" + Date.now()),
        alta.pacienteId || "",
        alta.rh || "",
        alta.nome || "",
        alta.enfermaria || "",
        alta.enfermariaNome || "",
        alta.leito || "",
        alta.dietaNome || "",
        alta.volumeMl || 0,
        alta.vezesDia || 0,
        alta.dataHoraFormatada || alta.dataHoraIso || new Date().toISOString(),
        alta.responsavel || "Nutricionista",
        alta.motivoObservacao || "Alta Hospitalar Concedida"
      ]);

      registrarLog(ss, "PACIENTES", "ALTA", `Alta: ${alta.nome} (${alta.leito})`, alta.motivoObservacao || "");
      return createJsonResponse({ status: "success", message: "Alta registrada em TB_LOG_ALTAS com sucesso!" });
    }

    // 4. Salvar Snapshot de Versão
    if (payload.action === "saveSnapshot") {
      const sheet = ss.getSheetByName(SHEET_SNAPSHOTS);
      const snap = payload.data || {};
      sheet.appendRow([
        snap.id || ("SNAP_" + Date.now()),
        snap.nome || "Versão sem título",
        snap.tipo || "AUTOMATICO",
        snap.motivo || "-",
        snap.dataHoraFormatada || new Date().toISOString(),
        snap.responsavel || "Nutricionista",
        JSON.stringify(snap.dados || {})
      ]);

      return createJsonResponse({ status: "success", message: "Ponto de restauração salvo no Google Sheets!" });
    }

    // 5. Salvar Log de Auditoria
    if (payload.action === "appendAuditLog") {
      const sheet = ss.getSheetByName(SHEET_LOGS);
      const log = payload.data || {};
      sheet.appendRow([
        new Date().toISOString(),
        log.dataHoraFormatada || "",
        log.responsavel || "Nutricionista",
        log.modulo || "SISTEMA",
        log.acao || "INFO",
        log.titulo || "",
        JSON.stringify(log.alteracoes || []),
        JSON.stringify(log.metadata || {})
      ]);

      return createJsonResponse({ status: "success", message: "Log registrado no Google Sheets!" });
    }

    return createJsonResponse({ status: "error", message: "Ação POST não reconhecida: " + payload.action });

  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Função Auxiliar para Registro de Operações
 */
function registrarLog(ss, modulo, acao, titulo, detalhes) {
  try {
    const logSheet = ss.getSheetByName(SHEET_LOGS);
    if (logSheet) {
      logSheet.appendRow([
        new Date().toISOString(),
        Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy HH:mm:ss"),
        Session.getActiveUser().getEmail() || "sistema_lactario",
        modulo,
        acao,
        titulo,
        "[]",
        JSON.stringify({ detalhes: detalhes })
      ]);
    }
  } catch (e) {
    // Silencioso
  }
}

/**
 * Função para criar a estrutura manualmente pelo editor se desejado
 */
function setupLactarioDatabase() {
  verificarEstruturaPlanilha();
  SpreadsheetApp.getUi().alert("✅ Banco de Dados do Lactário Digital HSP configurado com sucesso no Google Sheets!");
}
