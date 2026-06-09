import type { ParsedInvoice } from "./types.ts";
import { rawTag, tag } from "../xml_utils.ts";

/** Monta emitente e destinatário a partir das entidades TXT. */
export function buildParties(invoice: ParsedInvoice): string {
  const emit = invoice.entities.find((entity) => entity.ref === "C")?.fields ?? [];
  const emitAddr = invoice.entities.find((entity) => entity.ref === "C02")?.fields ?? [];
  const dest = invoice.entities.find((entity) => entity.ref === "E")?.fields;
  const destAddr = invoice.entities.find((entity) => entity.ref === "E05")?.fields ?? [];
  const emitXml = rawTag("emit", [
    emit[0] ? tag("CNPJ", emit[0]) : tag("CPF", emit[1] ?? ""),
    tag("xNome", emit[2] ?? ""),
    emit[3] ? tag("xFant", emit[3]) : "",
    rawTag("enderEmit", buildAddress(emitAddr)),
    tag("IE", emit[4] ?? ""),
    tag("CRT", emit[5] ?? "3"),
  ].join(""));
  const destXml = dest ? rawTag("dest", [
    dest[0] ? tag("CNPJ", dest[0]) : dest[1] ? tag("CPF", dest[1]) : "",
    tag("xNome", dest[2] ?? ""),
    rawTag("enderDest", buildAddress(destAddr)),
    tag("indIEDest", dest[3] ?? "9"),
    dest[4] ? tag("IE", dest[4]) : "",
    dest[5] ? tag("email", dest[5]) : "",
  ].join("")) : "";
  return `${emitXml}${destXml}`;
}

function buildAddress(fields: string[]): string {
  return [
    tag("xLgr", fields[0] ?? ""),
    tag("nro", fields[1] ?? "S/N"),
    fields[2] ? tag("xCpl", fields[2]) : "",
    tag("xBairro", fields[3] ?? ""),
    tag("cMun", fields[4] ?? ""),
    tag("xMun", fields[5] ?? ""),
    tag("UF", fields[6] ?? ""),
    tag("CEP", fields[7] ?? ""),
    tag("cPais", fields[8] ?? "1058"),
    tag("xPais", fields[9] ?? "BRASIL"),
    fields[10] ? tag("fone", fields[10]) : "",
  ].join("");
}
