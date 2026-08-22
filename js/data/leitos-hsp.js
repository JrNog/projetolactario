/**
 * Mapeamento Oficial de Enfermarias e Leitos
 * Hospital São Paulo (UNIFESP-EPM)
 */

const ENFERMARIAS_HSP = [
  {
    id: "UTI_NEO",
    nome: "UTI NEONATAL",
    sigla: "UTI NEO",
    andar: "8º Andar - Bloco A",
    faixa: "A0800 a A0817",
    leitos: Array.from({ length: 18 }, (_, i) => `A08${String(i).padStart(2, "0")}`)
  },
  {
    id: "UTI_NEO_CONV",
    nome: "UTI NEONATAL CONVENCIONAL",
    sigla: "UTI NEO CONV",
    andar: "8º Andar - Bloco A",
    faixa: "A0818 a A0840",
    leitos: Array.from({ length: 23 }, (_, i) => `A08${String(i + 18).padStart(2, "0")}`)
  },
  {
    id: "UTI_PED",
    nome: "UTI PEDIÁTRICA",
    sigla: "UTI PED",
    andar: "9º Andar - Bloco B",
    faixa: "B0951 a B0959",
    leitos: Array.from({ length: 9 }, (_, i) => `B09${String(i + 51).padStart(2, "0")}`)
  },
  {
    id: "UI_PED_CLINICA",
    nome: "UI PEDIATRIA CLÍNICA",
    sigla: "PED CLÍNICA",
    andar: "9º Andar - Bloco A",
    faixa: "A0901 a A0918",
    leitos: Array.from({ length: 18 }, (_, i) => `A09${String(i + 1).padStart(2, "0")}`)
  },
  {
    id: "UI_SEMI_PED",
    nome: "UI SEMI INTENSIVA PEDIÁTRICA",
    sigla: "SEMI PED",
    andar: "9º Andar - Bloco A",
    faixa: "A0919 a A0922",
    leitos: Array.from({ length: 4 }, (_, i) => `A09${String(i + 19).padStart(2, "0")}`)
  },
  {
    id: "UI_CIRURGIA_PED",
    nome: "UI CIRURGIA PEDIÁTRICA",
    sigla: "CIR PEDIÁTRICA",
    andar: "1º Andar - Bloco D",
    faixa: "D0105 a D0115",
    leitos: Array.from({ length: 11 }, (_, i) => `D01${String(i + 5).padStart(2, "0")}`)
  },
  {
    id: "UI_PS_PED",
    nome: "UI PS PEDIATRIA",
    sigla: "PS PEDIATRIA",
    andar: "Pronto Socorro - Bloco J",
    faixa: "J010 a J030",
    leitos: Array.from({ length: 21 }, (_, i) => `J0${String(i + 10).padStart(2, "0")}`)
  },
  {
    id: "UI_DIPE",
    nome: "UI DIPE (Doenças Infecto-Parasitárias)",
    sigla: "UI DIPE",
    andar: "9º Andar - Bloco B",
    faixa: "B0901 a B0907",
    leitos: Array.from({ length: 7 }, (_, i) => `B09${String(i + 1).padStart(2, "0")}`)
  },
  {
    id: "UI_OBSTETRICIA",
    nome: "UI OBSTETRÍCIA (Alojamento Conjunto / Berçário)",
    sigla: "OBSTETRÍCIA",
    andar: "8º Andar - Bloco B",
    faixa: "B0801 a B0850",
    leitos: Array.from({ length: 50 }, (_, i) => `B08${String(i + 1).padStart(2, "0")}`)
  }
];

// Helper para obter lista plana de todos os leitos cadastrados
const TODOS_LEITOS_HSP = ENFERMARIAS_HSP.flatMap(enf => 
  enf.leitos.map(leito => ({
    leito,
    enfermariaId: enf.id,
    enfermariaNome: enf.nome,
    enfermariaSigla: enf.sigla,
    andar: enf.andar
  }))
);

if (typeof window !== "undefined") {
  window.ENFERMARIAS_HSP = ENFERMARIAS_HSP;
  window.TODOS_LEITOS_HSP = TODOS_LEITOS_HSP;
}
