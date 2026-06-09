import { FiscalError } from "../error.ts";
import type { AccessKeyParams } from "../types/index.ts";
import { InvoiceModel, EmissionType } from "../types/enums.ts";

/** Parâmetros mínimos aceitos para montar uma chave de acesso NF-e/NFC-e. */
export interface BuildAccessKeyParams extends AccessKeyParams {
  /** Código IBGE da UF (`cUF`). */
  state_code?: string;
  /** Ano/mês no formato AAMM. */
  year_month?: string;
  /** CNPJ do emitente, com ou sem pontuação. */
  tax_id?: string;
  /** Modelo do documento fiscal. */
  model?: InvoiceModel | number | string;
  /** Série do documento. */
  series?: number | string;
  /** Número do documento. */
  number?: number | string;
  /** Tipo de emissão. */
  emission_type?: EmissionType | number | string;
  /** Código numérico de 8 dígitos. */
  numeric_code?: string;
}

/** Monta a chave de acesso de 44 dígitos e calcula o dígito verificador módulo 11. */
export function buildAccessKey(params: BuildAccessKeyParams): string {
  const stateCode = String(params.state_code ?? "").padStart(2, "0");
  const yearMonth = String(params.year_month ?? "");
  const taxId = String(params.tax_id ?? "").replace(/\D/g, "").padStart(14, "0");
  const model = String(params.model ?? InvoiceModel.Nfe).padStart(2, "0");
  const series = String(params.series ?? 1).padStart(3, "0");
  const number = String(params.number ?? 1).padStart(9, "0");
  const emissionType = String(params.emission_type ?? EmissionType.Normal);
  const numericCode = String(params.numeric_code ?? generateNumericCode()).padStart(8, "0");
  const base = `${stateCode}${yearMonth}${taxId}${model}${series}${number}${emissionType}${numericCode}`;

  if (!/^\d{43}$/.test(base)) {
    throw FiscalError.xmlGeneration(`Base da chave de acesso deve ter 43 dígitos, recebeu ${base.length}: ${base}`);
  }

  return `${base}${calculateMod11(base)}`;
}

/** Alias em snake_case para paridade com o Rust. */
export const build_access_key = buildAccessKey;

/** Calcula o dígito verificador módulo 11 usado na chave de acesso. */
export function calculateMod11(digits: string): number {
  let sum = 0;
  let weight = 2;
  for (const char of Array.from(digits).reverse()) {
    sum += Number(char) * weight;
    weight = weight >= 9 ? 2 : weight + 1;
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/** Alias em snake_case para paridade com o Rust. */
export const calculate_mod11 = calculateMod11;

/** Gera um código numérico pseudoaleatório de 8 dígitos. */
export function generateNumericCode(): string {
  return Math.floor(Math.random() * 100_000_000).toString().padStart(8, "0");
}

/** Alias em snake_case para paridade com o Rust. */
export const generate_numeric_code = generateNumericCode;

/** Formata uma data em AAMM para compor chave de acesso. */
export function formatYearMonth(date: Date | string = new Date()): string {
  const dt = typeof date === "string" ? new Date(date) : date;
  const year = String(dt.getFullYear()).slice(-2);
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
}

/** Alias em snake_case para paridade com o Rust. */
export const format_year_month = formatYearMonth;
