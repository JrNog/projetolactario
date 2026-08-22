/**
 * Catálogo Oficial das 47 Enfermarias e Faixas de Leitos
 * Hospital São Paulo (UNIFESP-EPM) / SPDM
 * Sincronizado com a aba 'Config' da planilha oficial do hospital (.xlsx)
 */

function gerarLeitosDaFaixa(leitoInicial, leitoFinal) {
  if (!leitoInicial || !leitoFinal) return [];
  const iniStr = String(leitoInicial).trim().toUpperCase();
  const fimStr = String(leitoFinal).trim().toUpperCase();
  
  const matchIni = iniStr.match(/^([A-Z]+)(\d+)$/);
  const matchFim = fimStr.match(/^([A-Z]+)(\d+)$/);
  if (!matchIni || !matchFim) return [iniStr, fimStr];
  if (matchIni[1] !== matchFim[1]) return [iniStr, fimStr];

  const prefix = matchIni[1];
  const numDigits = matchIni[2].length;
  const start = parseInt(matchIni[2], 10);
  const end = parseInt(matchFim[2], 10);

  if (start > end || (end - start) > 200) return [iniStr, fimStr];

  const leitos = [];
  for (let n = start; n <= end; n++) {
    leitos.push(`${prefix}${String(n).padStart(numDigits, "0")}`);
  }
  return leitos;
}

const ENFERMARIAS_SPDM = [
  { id: "ENF_02", nome: "UI PS PEDIATRIA", sigla: "PS PEDIATRIA", leitoInicial: "J010", leitoFinal: "J030", andar: "Pronto Socorro - Bloco J" },
  { id: "ENF_03", nome: "UI CIRURGIA PEDIATRICA", sigla: "CIR PEDIÁTRICA", leitoInicial: "D0105", leitoFinal: "D0115", andar: "1º Andar - Bloco D" },
  { id: "ENF_04", nome: "UI PEDIATRIA CLINICA", sigla: "PED CLÍNICA", leitoInicial: "A0901", leitoFinal: "A0918", andar: "9º Andar - Bloco A" },
  { id: "ENF_05", nome: "UI SEMI INTENSIVA PEDIATRICA", sigla: "SEMI PED", leitoInicial: "A0919", leitoFinal: "A0922", andar: "9º Andar - Bloco A" },
  { id: "ENF_06", nome: "UTI PEDIATRIA", sigla: "UTI PED", leitoInicial: "B0951", leitoFinal: "B0959", andar: "9º Andar - Bloco B" },
  { id: "ENF_07", nome: "UI DIPE", sigla: "UI DIPE", leitoInicial: "B0901", leitoFinal: "B0907", andar: "9º Andar - Bloco B" },
  { id: "ENF_08", nome: "UI OBSTETRICIA", sigla: "OBSTETRÍCIA", leitoInicial: "B0801", leitoFinal: "B0850", andar: "8º Andar - Bloco B" },
  { id: "ENF_09", nome: "UTI NEONATAL", sigla: "UTI NEO", leitoInicial: "A0800", leitoFinal: "A0817", andar: "8º Andar - Bloco A" },
  { id: "ENF_10", nome: "UTI NEONATAL CONVENCIONAL", sigla: "UTI NEO CONV", leitoInicial: "A0818", leitoFinal: "A0840", andar: "8º Andar - Bloco A" },
  { id: "ENF_11", nome: "UI UNIPET", sigla: "UNIPET", leitoInicial: "C1301", leitoFinal: "C1390", andar: "13º Andar - Bloco C" },
  { id: "ENF_12", nome: "UI OBSERVAÇÃO PS ADULTO", sigla: "OBS PS ADULTO", leitoInicial: "PS01", leitoFinal: "PS20", andar: "Pronto Socorro Adulto" },
  { id: "ENF_13", nome: "UI PS ADULTO", sigla: "PS ADULTO", leitoInicial: "C0101", leitoFinal: "C0110", andar: "1º Andar - Bloco C" },
  { id: "ENF_14", nome: "UI SEMI INT. PS ADULTO", sigla: "SEMI PS ADULTO", leitoInicial: "C0121", leitoFinal: "C0128", andar: "1º Andar - Bloco C" },
  { id: "ENF_15", nome: "UI ORTOPEDIA", sigla: "ORTOPEDIA", leitoInicial: "A0101", leitoFinal: "A0120", andar: "1º Andar - Bloco A" },
  { id: "ENF_16", nome: "UI GASTROCLINICA", sigla: "GASTROCLIN", leitoInicial: "A0201", leitoFinal: "A0209", andar: "2º Andar - Bloco A" },
  { id: "ENF_17", nome: "UI GASTROCIRURGIA", sigla: "GASTROCIR", leitoInicial: "A0210", leitoFinal: "A0225", andar: "2º Andar - Bloco A" },
  { id: "ENF_18", nome: "UI UROLOGIA", sigla: "UROLOGIA", leitoInicial: "D0209", leitoFinal: "D0215", andar: "2º Andar - Bloco D" },
  { id: "ENF_19", nome: "UI OFTALMOLOGIA", sigla: "OFTALMO", leitoInicial: "B0209", leitoFinal: "B0210", andar: "2º Andar - Bloco B" },
  { id: "ENF_20", nome: "UI CIRURGIA PLASTICA", sigla: "CIR PLÁSTICA", leitoInicial: "B0201", leitoFinal: "B0208", andar: "2º Andar - Bloco B" },
  { id: "ENF_21", nome: "UI GINECOLOGIA", sigla: "GINECOLOGIA", leitoInicial: "D0201", leitoFinal: "D0208", andar: "2º Andar - Bloco D" },
  { id: "ENF_22", nome: "UI CIRURGIA CARDIACA", sigla: "CIR CARDÍACA", leitoInicial: "D0307", leitoFinal: "D0317", andar: "3º Andar - Bloco D" },
  { id: "ENF_23", nome: "UI CIRURGIA DE TORAX", sigla: "CIR TÓRAX", leitoInicial: "B0401", leitoFinal: "B0404", andar: "4º Andar - Bloco B" },
  { id: "ENF_24", nome: "CCP", sigla: "CCP", leitoInicial: "B0405", leitoFinal: "B0406", andar: "4º Andar - Bloco B" },
  { id: "ENF_25", nome: "UTI CIRURGIA CARDIACA", sigla: "UTI CIR CARD", leitoInicial: "D0318", leitoFinal: "D0322", andar: "3º Andar - Bloco D" },
  { id: "ENF_26", nome: "UI CLINICA MÉDICA MASCULINA", sigla: "CM MASC", leitoInicial: "A0301", leitoFinal: "A0350", andar: "3º Andar - Bloco A" },
  { id: "ENF_27", nome: "UI CLINICA MÉDICA FEMININA", sigla: "CM FEM", leitoInicial: "B0351", leitoFinal: "B0399", andar: "3º Andar - Bloco B" },
  { id: "ENF_28", nome: "UI CIRURGIA ENDOVASCULAR", sigla: "ENDOVASC", leitoInicial: "D0301", leitoFinal: "D0306", andar: "3º Andar - Bloco D" },
  { id: "ENF_29", nome: "UI OTORRINOLARINGOLOGIA", sigla: "OTORRINO", leitoInicial: "B0407", leitoFinal: "B0408", andar: "4º Andar - Bloco B" },
  { id: "ENF_30", nome: "UTI DMED", sigla: "UTI DMED", leitoInicial: "A0401", leitoFinal: "A0430", andar: "4º Andar - Bloco A" },
  { id: "ENF_31", nome: "UTI GERAL ADULTO 3", sigla: "UTI GERAL 3", leitoInicial: "B0651", leitoFinal: "B0699", andar: "6º Andar - Bloco B" },
  { id: "ENF_32", nome: "UTI GERAL ADULTO 2", sigla: "UTI GERAL 2", leitoInicial: "B0601", leitoFinal: "B0649", andar: "6º Andar - Bloco B" },
  { id: "ENF_33", nome: "UTI GERAL ADULTO 1", sigla: "UTI GERAL 1", leitoInicial: "C0601", leitoFinal: "C0650", andar: "6º Andar - Bloco C" },
  { id: "ENF_34", nome: "UI NEUROLOGIA", sigla: "NEURO", leitoInicial: "A0601", leitoFinal: "A0650", andar: "6º Andar - Bloco A" },
  { id: "ENF_35", nome: "UTI GERAL ADULTO 4", sigla: "UTI GERAL 4", leitoInicial: "C0701", leitoFinal: "C0750", andar: "7º Andar - Bloco C" },
  { id: "ENF_36", nome: "UI DE TRANSPLANTE DE ORGAOS", sigla: "TRANSPLANTE", leitoInicial: "C1001", leitoFinal: "C1090", andar: "10º Andar - Bloco C" },
  { id: "ENF_37", nome: "UI CARDIOLOGIA", sigla: "CARDIO", leitoInicial: "A1001", leitoFinal: "A1010", andar: "10º Andar - Bloco A" },
  { id: "ENF_38", nome: "UTI CARDIOLOGIA", sigla: "UTI CARDIO", leitoInicial: "A1011", leitoFinal: "A1016", andar: "10º Andar - Bloco A" },
  { id: "ENF_39", nome: "UI PNEUMOLOGIA", sigla: "PNEUMO", leitoInicial: "B1151", leitoFinal: "B1190", andar: "11º Andar - Bloco B" },
  { id: "ENF_40", nome: "UI TRAT DE SINDROME RESP AGUDA", sigla: "SIND RESP", leitoInicial: "C1101", leitoFinal: "C1190", andar: "11º Andar - Bloco C" },
  { id: "ENF_41", nome: "UI TRANSPLANTE DE MEDULA OSSEA", sigla: "TMO", leitoInicial: "C1211", leitoFinal: "C1218", andar: "12º Andar - Bloco C" },
  { id: "ENF_42", nome: "UI HEMATOLOGIA", sigla: "HEMATO", leitoInicial: "C1201", leitoFinal: "C1210", andar: "12º Andar - Bloco C" },
  { id: "ENF_43", nome: "UI TRATAMENTO DE QUEIMADOS", sigla: "QUEIMADOS", leitoInicial: "C1405", leitoFinal: "C1410", andar: "14º Andar - Bloco C" },
  { id: "ENF_44", nome: "UTI UNIDADE QUEIMADOS", sigla: "UTI QUEIMADOS", leitoInicial: "C1401", leitoFinal: "C1404", andar: "14º Andar - Bloco C" },
  { id: "ENF_45", nome: "UI SAUDE SUPLEMENTAR", sigla: "SAÚDE SUPLEM", leitoInicial: "C0902", leitoFinal: "C0914", andar: "9º Andar - Bloco C" },
  { id: "ENF_46", nome: "UNIDADE DE APOIO NIR", sigla: "APOIO NIR", leitoInicial: "C0901", leitoFinal: "C0907", andar: "9º Andar - Bloco C" },
  { id: "ENF_47", nome: "LEITO DIA", sigla: "LEITO DIA", leitoInicial: "DIA01", leitoFinal: "DIA30", andar: "Ambulatório Leito Dia" },
  { id: "ENF_48", nome: "HEMODINAMICA", sigla: "HEMODINÂMICA", leitoInicial: "HEMO01", leitoFinal: "HEMO30", andar: "Hemodinâmica" }
].map(enf => ({
  ...enf,
  faixa: `${enf.leitoInicial} a ${enf.leitoFinal}`,
  leitos: gerarLeitosDaFaixa(enf.leitoInicial, enf.leitoFinal)
}));

if (typeof window !== "undefined") {
  window.ENFERMARIAS_SPDM = ENFERMARIAS_SPDM;
  window.gerarLeitosDaFaixa = gerarLeitosDaFaixa;
}

