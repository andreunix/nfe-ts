import type { ParsedInvoice } from "./types.ts";
import { rawTag, tag } from "../xml_utils.ts";

/** Monta o grupo `<total>` a partir da entidade W ou soma dos itens. */
export function buildTotals(invoice: ParsedInvoice): string {
  const w = invoice.entities.find((entity) => entity.ref === "W")?.fields;
  const vProd = w?.[2] ?? invoice.items.reduce((sum, item) => sum + Number(item.prod.vProd ?? 0), 0).toFixed(2);
  const vNF = w?.[3] ?? vProd;
  return rawTag("total", rawTag("ICMSTot", [
    tag("vBC", w?.[0] ?? "0.00"),
    tag("vICMS", w?.[1] ?? "0.00"),
    tag("vProd", vProd),
    tag("vNF", vNF),
  ].join("")));
}
