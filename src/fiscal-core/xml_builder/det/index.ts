import type { FiscalRecord } from "../../core.ts";
import { buildCofinsXml, buildIiXml, buildIpiXml, buildPisXml } from "../../tax_pis_cofins_ipi.ts";
import { rawTag, tag } from "../../xml_utils.ts";
import { buildIcmsVariant } from "./icms_variant.ts";
import { buildProd } from "./prod.ts";
import type { TaxTotals } from "../../tax_icms/totals.ts";

/** Resultado da construção de um item `<det>`. */
export interface DetResult {
  /** XML completo do item. */
  xml: string;
  /** Totais ICMS acumulados para o item. */
  icms_totals: TaxTotals;
  /** Indicador `indTot` do produto. */
  ind_tot: number;
  /** Demais totais extraídos do item. */
  [key: string]: string | number | boolean | TaxTotals;
}

/** Monta um grupo `<det>` completo para um item da NF-e/NFC-e. */
export function buildDet(item: FiscalRecord, indexOrData: number | FiscalRecord = 1): DetResult {
  const index = typeof indexOrData === "number" ? indexOrData : Number(item.item_number ?? item.n_item ?? 1);
  const [icmsXml, icmsTotals] = buildIcmsVariant(item);
  const taxes = [
    icmsXml,
    item.ipi ? buildIpiXml(item.ipi as FiscalRecord) : "",
    item.ii ? buildIiXml(item.ii as FiscalRecord) : "",
    item.pis ? buildPisXml(item.pis as FiscalRecord) : "",
    item.cofins ? buildCofinsXml(item.cofins as FiscalRecord) : "",
  ].join("");
  const imposto = rawTag("imposto", `${item.total_tax ? tag("vTotTrib", String(item.total_tax)) : ""}${taxes}`);
  const infAdProd = item.additional_info || item.inf_ad_prod ? tag("infAdProd", String(item.additional_info ?? item.inf_ad_prod)) : "";
  const xml = rawTag("det", { nItem: index }, `${buildProd(item)}${imposto}${infAdProd}`);
  return {
    xml,
    icms_totals: icmsTotals,
    ind_tot: Number(item.ind_tot ?? item.indTot ?? 1),
    v_ipi: Number(item.v_ipi ?? 0),
    v_pis: Number(item.v_pis ?? 0),
    v_cofins: Number(item.v_cofins ?? 0),
    v_ii: Number(item.v_ii ?? 0),
    v_frete: Number(item.freight ?? item.v_frete ?? 0),
    v_seg: Number(item.insurance ?? item.v_seg ?? 0),
    v_desc: Number(item.discount ?? item.v_desc ?? 0),
    v_outro: Number(item.other ?? item.v_outro ?? 0),
    v_tot_trib: Number(item.total_tax ?? item.v_tot_trib ?? 0),
    v_ipi_devol: Number(item.v_ipi_devol ?? 0),
    v_pis_st: Number(item.v_pis_st ?? 0),
    v_cofins_st: Number(item.v_cofins_st ?? 0),
    ind_deduz_deson: Boolean(item.ind_deduz_deson),
  };
}

/** Alias em snake_case para paridade com o Rust. */
export const build_det = buildDet;

export * from "./prod.ts";
export * from "./icms_variant.ts";
