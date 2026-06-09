import { FiscalError } from "../error.ts";
import { structure310, structure400, structure400Sebrae, structure400V12, structure400V13 } from "./structures.ts";

/** Retorna o mapa de estrutura TXT para versão/layout. */
export function getStructure(version: string, layout: string): Record<string, string> {
  const ver = Number(version.replace(".", ""));
  const normalized = layout.toUpperCase();
  if (ver === 310) return structure310();
  if (ver === 400) {
    if (normalized === "SEBRAE") return structure400Sebrae();
    if (normalized === "LOCAL_V12") return structure400V12();
    if (normalized === "LOCAL_V13") return structure400V13();
    return structure400();
  }
  throw FiscalError.invalidTxt(`Estrutura TXT para versão ${version} (${layout}) não encontrada.`);
}
