import type { ParsedInvoice } from "./types.ts";
import { rawTag } from "../xml_utils.ts";
import { buildHeader } from "./build_header.ts";
import { buildParties } from "./build_parties.ts";
import { buildDet } from "./build_det.ts";
import { buildTotals } from "./build_totals.ts";
import { buildOptional } from "./build_optional.ts";

/** Monta o XML NF-e completo a partir de um documento TXT parseado. */
export function buildXml(invoice: ParsedInvoice): string {
  const id = invoice.header?.fields[1] || "";
  const version = invoice.version || "4.00";
  const inf = rawTag("infNFe", { Id: id, versao: version }, [
    buildHeader(invoice),
    buildParties(invoice),
    buildDet(invoice),
    buildTotals(invoice),
    buildOptional(invoice),
  ].join(""));
  return rawTag("NFe", { xmlns: "http://www.portalfiscal.inf.br/nfe" }, inf);
}
