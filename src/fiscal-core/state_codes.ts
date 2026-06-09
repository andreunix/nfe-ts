import { FiscalError } from "./error.ts";

/** Tabela UF -> código IBGE (`cUF`) para estados brasileiros e códigos especiais. */
export const STATE_IBGE_CODES = {
  AC: "12", AL: "27", AP: "16", AM: "13", BA: "29", CE: "23", DF: "53", ES: "32", GO: "52",
  MA: "21", MT: "51", MS: "50", MG: "31", PA: "15", PB: "25", PR: "41", PE: "26", PI: "22",
  RJ: "33", RN: "24", RS: "43", RO: "11", RR: "14", SC: "42", SP: "35", SE: "28", TO: "17",
  AN: "91", SVRS: "92",
} as const;

/** Tabela reversa código IBGE -> UF. */
export const IBGE_TO_UF = Object.fromEntries(
  Object.entries(STATE_IBGE_CODES).map(([uf, code]) => [code, uf]),
) as Record<string, keyof typeof STATE_IBGE_CODES>;

/** União de UFs conhecidas pela tabela de códigos IBGE. */
export type Uf = keyof typeof STATE_IBGE_CODES;

/** Retorna o código IBGE de uma UF brasileira. */
export function getStateCode(uf: string): string {
  const code = STATE_IBGE_CODES[uf.toUpperCase() as Uf];
  if (!code) throw FiscalError.invalidStateCode(uf);
  return code;
}
export const get_state_code = getStateCode;

/** Retorna a UF correspondente a um código IBGE. */
export function getStateByCode(code: string): string {
  const uf = IBGE_TO_UF[code];
  if (!uf) throw FiscalError.invalidStateCode(code);
  return uf;
}
export const get_state_by_code = getStateByCode;
