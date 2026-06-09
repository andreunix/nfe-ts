import { FiscalError } from "../error.ts";
import { validateTxtLines } from "./helpers.ts";
import { NFeParser } from "./parser.ts";
import { getStructure } from "./structures_dispatch.ts";
import { buildXml } from "./build_xml.ts";

/** Normaliza o nome do layout TXT. */
export function normalizeLayout(layout: string): string {
  const upper = layout.toUpperCase();
  return ["LOCAL", "LOCAL_V12", "LOCAL_V13", "SEBRAE"].includes(upper) ? upper : "LOCAL_V12";
}

/** Retorna a estrutura de campos de uma versão/layout TXT. */
export { getStructure };

/** Converte TXT SEFAZ para XML retornando apenas a primeira nota. */
export function txtToXml(txt: string, layout: string): string {
  return txtToXmlAll(txt, layout)[0]!;
}

/** Alias em snake_case para paridade com o Rust. */
export const txt_to_xml = txtToXml;

/** Converte TXT SEFAZ para XML de todas as notas do arquivo. */
export function txtToXmlAll(txt: string, layout: string): string[] {
  const normalizedTxt = txt.replaceAll("\r", "").replaceAll("\t", "").trim();
  if (!normalizedTxt) throw FiscalError.wrongDocument("Documento vazio.");
  const lines = normalizedTxt.split("\n");
  const first = lines[0]?.split("|") ?? [];
  if (first[0] !== "NOTAFISCAL") throw FiscalError.wrongDocument("Documento inválido: TXT não é NOTAFISCAL.");
  const declaredCount = Number(first[1] ?? 1);
  const invoices = sliceInvoices(lines.slice(1), declaredCount);
  if (invoices.length !== declaredCount) {
    throw FiscalError.wrongDocument(`Número de NF-e declarado (${declaredCount}) não confere com encontrado (${invoices.length}).`);
  }
  const normalizedLayout = normalizeLayout(layout);
  return invoices.map((invoiceLines) => {
    const version = extractLayoutVersion(invoiceLines);
    const errors = validateTxtLines(invoiceLines, normalizedLayout);
    if (errors.length > 0) throw FiscalError.invalidTxt(errors.join("\n"));
    getStructure(version, normalizedLayout);
    const parser = new NFeParser(version, normalizedLayout);
    const invoice = parser.parse(invoiceLines);
    if (parser.infNfeId) {
      const key = parser.infNfeId.replace(/^NFe/, "");
      if (key && key.length !== 44) throw FiscalError.invalidTxt(`A chave informada está incorreta [${parser.infNfeId}]`);
    }
    return buildXml(invoice);
  });
}

/** Alias em snake_case para paridade com o Rust. */
export const txt_to_xml_all = txtToXmlAll;

/** Valida TXT sem converter para XML. */
export function validateTxt(txt: string, layout: string): boolean {
  const normalizedTxt = txt.replaceAll("\r", "").replaceAll("\t", "").trim();
  if (!normalizedTxt) throw FiscalError.wrongDocument("Documento vazio.");
  const lines = normalizedTxt.split("\n");
  const first = lines[0]?.split("|") ?? [];
  if (first[0] !== "NOTAFISCAL") throw FiscalError.wrongDocument("Documento inválido: TXT não é NOTAFISCAL.");
  return validateTxtLines(lines.slice(1), normalizeLayout(layout)).length === 0;
}

/** Alias em snake_case para paridade com o Rust. */
export const validate_txt = validateTxt;

function sliceInvoices(lines: string[], declared: number): string[][] {
  if (declared <= 1) return [lines];
  const starts = lines.map((line, index) => line.startsWith("A|") ? index : -1).filter((index) => index >= 0);
  return starts.map((start, idx) => lines.slice(start, starts[idx + 1] ?? lines.length));
}

function extractLayoutVersion(lines: string[]): string {
  const a = lines.find((line) => line.startsWith("A|"));
  if (!a) throw FiscalError.invalidTxt("Entidade A não encontrada na nota.");
  return a.split("|")[1] || "4.00";
}

export * from "./types.ts";
export * from "./helpers.ts";
export * from "./parser.ts";
export * from "./build_header.ts";
export * from "./build_parties.ts";
export { buildDet as convertBuildDet } from "./build_det.ts";
export * from "./build_tax.ts";
export * from "./build_totals.ts";
export * from "./build_optional.ts";
export * from "./build_xml.ts";
export * from "./structures.ts";
