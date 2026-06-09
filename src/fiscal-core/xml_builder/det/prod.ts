import type { FiscalRecord } from "../../core.ts";
import { formatCents10, formatCents2 } from "../../format_utils.ts";
import { Cents } from "../../newtypes/monetary.ts";
import { rawTag, tag } from "../../xml_utils.ts";

function money(value: unknown, places = 2): string {
  if (value instanceof Cents) return places === 10 ? formatCents10(value.value) : formatCents2(value.value);
  if (typeof value === "number") return places === 10 ? formatCents10(value) : formatCents2(value);
  return String(value ?? "");
}

/** Monta o grupo `<prod>` de um item. */
export function buildProd(item: FiscalRecord): string {
  const children = [
    tag("cProd", String(item.product_code ?? item.c_prod ?? item.cProd ?? "")),
    tag("cEAN", String(item.c_ean ?? item.cEAN ?? "SEM GTIN")),
    tag("xProd", String(item.description ?? item.name ?? item.x_prod ?? item.xProd ?? "")),
    tag("NCM", String(item.ncm ?? "00000000")),
    item.cest ? tag("CEST", String(item.cest)) : "",
    tag("CFOP", String(item.cfop ?? "")),
    tag("uCom", String(item.unit ?? item.u_com ?? item.uCom ?? "UN")),
    tag("qCom", String(item.quantity ?? item.q_com ?? item.qCom ?? "1.0000")),
    tag("vUnCom", money(item.unit_price ?? item.v_un_com ?? item.vUnCom ?? 0, 10)),
    tag("vProd", money(item.total_price ?? item.v_prod ?? item.vProd ?? 0)),
    tag("cEANTrib", String(item.c_ean_trib ?? item.cEANTrib ?? item.c_ean ?? item.cEAN ?? "SEM GTIN")),
    tag("uTrib", String(item.taxable_unit ?? item.u_trib ?? item.uTrib ?? item.unit ?? "UN")),
    tag("qTrib", String(item.taxable_quantity ?? item.q_trib ?? item.qTrib ?? item.quantity ?? "1.0000")),
    tag("vUnTrib", money(item.taxable_unit_price ?? item.v_un_trib ?? item.vUnTrib ?? item.unit_price ?? 0, 10)),
    item.freight ? tag("vFrete", money(item.freight)) : "",
    item.insurance ? tag("vSeg", money(item.insurance)) : "",
    item.discount ? tag("vDesc", money(item.discount)) : "",
    item.other ? tag("vOutro", money(item.other)) : "",
    tag("indTot", String(item.ind_tot ?? item.indTot ?? 1)),
  ];
  return rawTag("prod", children.join(""));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_prod = buildProd;
