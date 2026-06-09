import type { FiscalRecord } from "../core.ts";
import { formatCents2 } from "../format_utils.ts";
import { rawTag, tag } from "../xml_utils.ts";
import type { TaxTotals } from "../tax_icms/totals.ts";

/** Outros totais da NF-e além dos acumuladores ICMS. */
export interface OtherTotals {
  v_ipi?: number;
  v_pis?: number;
  v_cofins?: number;
  v_ii?: number;
  v_frete?: number;
  v_seg?: number;
  v_desc?: number;
  v_outro?: number;
  v_tot_trib?: number;
  v_ipi_devol?: number;
  v_pis_st?: number;
  v_cofins_st?: number;
  [key: string]: number | undefined;
}

function cents(value: unknown): string {
  return typeof value === "number" ? formatCents2(value) : String(value ?? "0.00");
}

/** Monta o grupo `<total>` com `<ICMSTot>` e totais opcionais. */
export function buildTotal(totalProducts: number, icmsTotals: TaxTotals = {}, otherTotals: OtherTotals = {}, extra: FiscalRecord = {}): string {
  const vNF = Number(extra.v_nf_tot_override ?? totalProducts)
    + Number(otherTotals.v_ipi ?? 0)
    + Number(otherTotals.v_frete ?? 0)
    + Number(otherTotals.v_seg ?? 0)
    + Number(otherTotals.v_outro ?? 0)
    - Number(otherTotals.v_desc ?? 0);
  const icmsTot = rawTag("ICMSTot", [
    tag("vBC", cents(icmsTotals.v_bc)),
    tag("vICMS", cents(icmsTotals.v_icms)),
    tag("vICMSDeson", cents(icmsTotals.v_icms_deson)),
    tag("vFCP", cents(icmsTotals.v_fcp)),
    tag("vBCST", cents(icmsTotals.v_bc_st)),
    tag("vST", cents(icmsTotals.v_st)),
    tag("vFCPST", cents(icmsTotals.v_fcp_st)),
    tag("vFCPSTRet", cents(icmsTotals.v_fcp_st_ret)),
    tag("vProd", cents(totalProducts)),
    tag("vFrete", cents(otherTotals.v_frete)),
    tag("vSeg", cents(otherTotals.v_seg)),
    tag("vDesc", cents(otherTotals.v_desc)),
    tag("vII", cents(otherTotals.v_ii)),
    tag("vIPI", cents(otherTotals.v_ipi)),
    tag("vIPIDevol", cents(otherTotals.v_ipi_devol)),
    tag("vPIS", cents(otherTotals.v_pis)),
    tag("vCOFINS", cents(otherTotals.v_cofins)),
    tag("vOutro", cents(otherTotals.v_outro)),
    tag("vNF", cents(vNF)),
    tag("vTotTrib", cents(otherTotals.v_tot_trib)),
  ].join(""));
  return rawTag("total", icmsTot);
}

/** Alias em snake_case para paridade com o Rust. */
export const build_total = buildTotal;
