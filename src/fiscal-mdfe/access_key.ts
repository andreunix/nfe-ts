import { FiscalError } from "../fiscal-core/error.ts";
import { calculateMod11, formatYearMonth, generateNumericCode } from "../fiscal-core/xml_builder/access_key.ts";
import { MDFE_MODEL } from "./constants.ts";
import type { Ide } from "./types.ts";

export interface MdfeAccessKeyParams {
  state_code: string;
  year_month: string;
  tax_id: string;
  series: number;
  number: number;
  emission_type: string;
  numeric_code: string;
}

export interface MdfeAccessKey {
  key: string;
  numeric_code: string;
  check_digit: number;
  as_str(): string;
}

export function buildMdfeAccessKey(params: MdfeAccessKeyParams): MdfeAccessKey {
  const base = [
    String(params.state_code).padStart(2, "0"),
    params.year_month,
    String(params.tax_id).padStart(14, "0"),
    MDFE_MODEL,
    String(params.series).padStart(3, "0"),
    String(params.number).padStart(9, "0"),
    String(params.emission_type),
    String(params.numeric_code).padStart(8, "0"),
  ].join("");

  if (!/^\d{43}$/.test(base)) {
    throw FiscalError.xmlGeneration(`MDF-e access key base must be 43 digits, got ${base.length} ("${base}")`);
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

export const build_mdfe_access_key = buildMdfeAccessKey;

export function buildMdfeAccessKeyFromIde(ide: Ide, taxId: string, numericCode?: string): MdfeAccessKey {
  return buildMdfeAccessKey({
    state_code: ide.c_uf,
    year_month: formatYearMonth(ide.dh_emi),
    tax_id: taxId,
    series: ide.serie,
    number: ide.n_mdf,
    emission_type: ide.tp_emis,
    numeric_code: numericCode ?? generateNumericCode(),
  });
}

export const build_mdfe_access_key_from_ide = buildMdfeAccessKeyFromIde;
