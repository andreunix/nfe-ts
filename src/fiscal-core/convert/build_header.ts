import type { ParsedInvoice } from "./types.ts";
import { rawTag, tag } from "../xml_utils.ts";

/** Monta o grupo `<ide>` a partir das entidades TXT. */
export function buildHeader(invoice: ParsedInvoice): string {
  const b = invoice.entities.find((entity) => entity.ref === "B");
  const f = b?.fields ?? [];
  return rawTag("ide", [
    tag("cUF", f[0] ?? ""),
    tag("cNF", f[1] ?? ""),
    tag("natOp", f[2] ?? "VENDA"),
    tag("mod", f[3] ?? "55"),
    tag("serie", f[4] ?? "1"),
    tag("nNF", f[5] ?? "1"),
    tag("dhEmi", f[6] ?? ""),
    tag("tpNF", f[7] ?? "1"),
    tag("idDest", f[8] ?? "1"),
    tag("cMunFG", f[9] ?? ""),
    tag("tpImp", f[10] ?? "1"),
    tag("tpEmis", f[11] ?? "1"),
    tag("cDV", f[12] ?? ""),
    tag("tpAmb", f[13] ?? "2"),
    tag("finNFe", f[14] ?? "1"),
    tag("indFinal", f[15] ?? "0"),
    tag("indPres", f[16] ?? "0"),
    tag("procEmi", f[17] ?? "0"),
    tag("verProc", f[18] ?? "fiscal-js"),
  ].join(""));
}
