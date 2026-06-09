import { FiscalError } from "../fiscal-core/error.ts";
import { calculateMod11, formatYearMonth, generateNumericCode } from "../fiscal-core/xml_builder/access_key.ts";
import { CTE_MODEL } from "./constants.ts";
import type { Ide } from "./types.ts";

export interface CteAccessKeyParams {
  model: string;
  state_code: string;
  year_month: string;
  tax_id: string;
  series: number;
  number: number;
  emission_type: string;
  numeric_code: string;
}

export interface CteAccessKey {
  key: string;
  numeric_code: string;
  check_digit: number;
  as_str(): string;
}

export function buildCteAccessKey(params: CteAccessKeyParams): CteAccessKey {
  const base = [
    String(params.state_code).padStart(2, "0"),
    params.year_month,
    String(params.tax_id).padStart(14, "0"),
    String(params.model).padStart(2, "0"),
    String(params.series).padStart(3, "0"),
    String(params.number).padStart(9, "0"),
    String(params.emission_type),
    String(params.numeric_code).padStart(8, "0"),
  ].join("");

  if (!/^\d{43}$/.test(base)) {
    throw FiscalError.xmlGeneration(`CT-e access key base must be 43 digits, got ${base.length} ("${base}")`);
  }

  const checkDigit = calculateMod11(base);
  const key = `${base}${checkDigit}`;
  return {
    key,
    numeric_code: String(params.numeric_code).padStart(8, "0"),
    check_digit: checkDigit,
    as_str: () => key,
  };
}

export const build_cte_access_key = buildCteAccessKey;

export function buildCteAccessKeyFromIde(ide: Ide, taxId: string, numericCode?: string): CteAccessKey {
  return buildCteAccessKeyFromIdeModel(ide, CTE_MODEL, taxId, numericCode);
}

export const build_cte_access_key_from_ide = buildCteAccessKeyFromIde;

export function buildCteAccessKeyFromIdeModel(ide: Ide, model: string, taxId: string, numericCode?: string): CteAccessKey {
  return buildCteAccessKey({
    model,
    state_code: ide.c_uf,
    year_month: formatYearMonth(ide.dh_emi),
    tax_id: taxId,
    series: ide.serie,
    number: ide.n_ct,
    emission_type: ide.tp_emis,
    numeric_code: numericCode ?? generateNumericCode(),
  });
}

export const build_cte_access_key_from_ide_model = buildCteAccessKeyFromIdeModel;
