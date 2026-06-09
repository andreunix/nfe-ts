import type { ParsedInvoice } from "./types.ts";
import { rawTag, tag } from "../xml_utils.ts";

/** Monta grupos opcionais básicos do TXT: transporte, pagamento e informações adicionais. */
export function buildOptional(invoice: ParsedInvoice): string {
  const x = invoice.entities.find((entity) => entity.ref === "X")?.fields;
  const ya = invoice.entities.filter((entity) => entity.ref === "YA");
  const z = invoice.entities.find((entity) => entity.ref === "Z")?.fields;
  const transp = rawTag("transp", tag("modFrete", x?.[0] ?? "9"));
  const pag = rawTag("pag", ya.map((entity) => rawTag("detPag", `${tag("tPag", entity.fields[0] ?? "90")}${tag("vPag", entity.fields[1] ?? "0.00")}`)).join(""));
  const infAdic = z?.[0] ? rawTag("infAdic", tag("infCpl", z[0])) : "";
  return `${transp}${pag}${infAdic}`;
}
