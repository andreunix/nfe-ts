import type { FiscalRecord } from "../../core.ts";
import { buildIcmsXml } from "../../tax_icms/index.ts";

/** Monta a variante ICMS de um item e retorna XML + totais. */
export function buildIcmsVariant(item: FiscalRecord) {
  const variant = item.icms ?? item.icms_variant ?? item.icmsVariant ?? { cst: "00", orig: "0" };
  return buildIcmsXml(variant as never);
}

/** Alias em snake_case para paridade com o Rust. */
export const build_icms_variant = buildIcmsVariant;
