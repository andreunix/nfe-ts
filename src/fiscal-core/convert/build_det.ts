import type { ParsedInvoice } from "./types.ts";
import { rawTag, tag } from "../xml_utils.ts";

/** Monta todos os grupos `<det>` a partir das entidades I. */
export function buildDet(invoice: ParsedInvoice): string {
  return invoice.items.map((item, index) => rawTag("det", { nItem: index + 1 }, [
    rawTag("prod", [
      tag("cProd", item.prod.cProd ?? ""),
      tag("cEAN", item.prod.cEAN ?? "SEM GTIN"),
      tag("xProd", item.prod.xProd ?? ""),
      tag("NCM", item.prod.NCM ?? ""),
      tag("CFOP", item.prod.CFOP ?? ""),
      tag("uCom", item.prod.uCom ?? "UN"),
      tag("qCom", item.prod.qCom ?? "1.0000"),
      tag("vUnCom", item.prod.vUnCom ?? "0.0000000000"),
      tag("vProd", item.prod.vProd ?? "0.00"),
      tag("cEANTrib", item.prod.cEANTrib ?? "SEM GTIN"),
      tag("uTrib", item.prod.uTrib ?? item.prod.uCom ?? "UN"),
      tag("qTrib", item.prod.qTrib ?? item.prod.qCom ?? "1.0000"),
      tag("vUnTrib", item.prod.vUnTrib ?? item.prod.vUnCom ?? "0.0000000000"),
      tag("indTot", item.prod.indTot ?? "1"),
    ].join("")),
    rawTag("imposto", rawTag("ICMS", rawTag("ICMS00", `${tag("orig", "0")}${tag("CST", "00")}${tag("vBC", "0.00")}${tag("pICMS", "0.0000")}${tag("vICMS", "0.00")}`))),
  ].join(""))).join("");
}
