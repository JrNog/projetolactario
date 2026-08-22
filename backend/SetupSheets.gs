/**
 * ============================================================================
 * LACTÁRIO DIGITAL - HOSPITAL SÃO PAULO (UNIFESP-EPM)
 * Script de Inicialização e Configuração Automática do Google Sheets
 * ============================================================================
 * 
 * COMO USAR:
 * 1. No editor do Apps Script, selecione a função "setupLactarioDatabase".
 * 2. Clique em "Executar".
 * 3. O script criará e formatará todas as abas necessárias automaticamente.
 */

function setupLactarioDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Aba DB_Censo
  let sheetCenso = ss.getSheetByName("DB_Censo");
  if (!sheetCenso) {
    sheetCenso = ss.insertSheet("DB_Censo");
  } else {
    sheetCenso.clear();
  }

  const headersCenso = [
    "id", "rh", "nome", "enfermaria", "enfermariaNome", "leito",
    "dietaId", "dietaNome", "volumeMl", "vezesDia", "via",
    "dispositivo", "espessanteObs", "calCalorico", "horarioInicio",
    "suspenso", "updatedAt"
  ];

  sheetCenso.getRange(1, 1, 1, headersCenso.length).setValues([headersCenso]);
  sheetCenso.getRange(1, 1, 1, headersCenso.length)
    .setBackground("#0284c7")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontFamily("Arial");
  sheetCenso.setFrozenRows(1);

  // 2. Aba DB_Dietas
  let sheetDietas = ss.getSheetByName("DB_Dietas");
  if (!sheetDietas) {
    sheetDietas = ss.insertSheet("DB_Dietas");
  } else {
    sheetDietas.clear();
  }

  const headersDietas = [
    "id", "nome", "categoria", "categoriaNome", "g_po_100ml", "ml_agua_100ml",
    "peso_lata_g", "kcal_100ml", "densidade_padrao", "temperatura_preparo", "instrucoes"
  ];

  sheetDietas.getRange(1, 1, 1, headersDietas.length).setValues([headersDietas]);
  sheetDietas.getRange(1, 1, 1, headersDietas.length)
    .setBackground("#166534")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontFamily("Arial");
  sheetDietas.setFrozenRows(1);

  // 3. Aba DB_Logs
  let sheetLogs = ss.getSheetByName("DB_Logs");
  if (!sheetLogs) {
    sheetLogs = ss.insertSheet("DB_Logs");
  }
  if (sheetLogs.getLastRow() === 0) {
    const headersLogs = ["timestamp", "usuario", "operacao", "detalhes"];
    sheetLogs.getRange(1, 1, 1, headersLogs.length).setValues([headersLogs]);
    sheetLogs.getRange(1, 1, 1, headersLogs.length)
      .setBackground("#334155")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
    sheetLogs.setFrozenRows(1);
  }

  SpreadsheetApp.getUi().alert("Banco de Dados do Lactário Digital configurado com sucesso no Google Sheets!");
}
