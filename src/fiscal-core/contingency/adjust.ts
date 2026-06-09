import { tag } from "../xml_utils.ts";
import type { Contingency } from "./manager.ts";

/** Ajusta um XML de NF-e/NFC-e para refletir emissão em contingência. */
export function adjustNfeContingency(xml: string, contingency: Contingency): string {
  if (!contingency.isActive()) return xml;
  let adjusted = replaceSimpleTag(xml, "tpEmis", String(contingency.emissionType()));
  if (contingency.startedAt) adjusted = replaceOrInsertAfter(adjusted, "dhCont", contingency.startedAt, "tpEmis");
  if (contingency.reason) adjusted = replaceOrInsertAfter(adjusted, "xJust", contingency.reason, "dhCont");
  return adjusted;
}
export const adjust_nfe_contingency = adjustNfeContingency;

/** Substitui uma tag simples quando ela já existe no XML. */
function replaceSimpleTag(xml: string, tagName: string, value: string): string {
  const pattern = new RegExp(`<${tagName}>[\\s\\S]*?</${tagName}>`);
  const replacement = tag(tagName, value);
  if (pattern.test(xml)) return xml.replace(pattern, replacement);
  return xml;
}

/** Substitui uma tag simples ou a insere após outra tag de referência. */
function replaceOrInsertAfter(xml: string, tagName: string, value: string, afterTag: string): string {
  const pattern = new RegExp(`<${tagName}>[\\s\\S]*?</${tagName}>`);
  const replacement = tag(tagName, value);
  if (pattern.test(xml)) return xml.replace(pattern, replacement);
  return xml.replace(new RegExp(`</${afterTag}>`), `</${afterTag}>${replacement}`);
}
