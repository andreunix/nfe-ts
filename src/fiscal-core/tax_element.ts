import type { FiscalRecord } from "./core.ts";
import { formatCents2, formatRate, formatRate4 } from "./format_utils.ts";
import { Cents, Rate, Rate4 } from "./newtypes/monetary.ts";
import { rawTag, tag } from "./xml_utils.ts";

/** Campo simples de imposto, com nome XML e valor já formatado. */
export class TaxField {
  /** Nome da tag XML. */
  readonly name: string;
  /** Valor textual da tag. */
  readonly value: string;

  /** Cria um campo fiscal. */
  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}

/** Elemento fiscal composto por grupo externo, variante e campos. */
export interface TaxElement {
  /** Tag externa opcional, como `PIS` ou `COFINS`. */
  outerTag?: string;
  /** Campos emitidos diretamente na tag externa. */
  outerFields?: TaxField[];
  /** Tag de variante, como `PISAliq` ou `ICMS00`. */
  variantTag: string;
  /** Campos emitidos dentro da variante. */
  fields: TaxField[];
}

/** Cria campo opcional; retorna `undefined` quando não há valor. */
export function optionalField(name: string, value?: string | null): TaxField | undefined {
  return value === undefined || value === null || value === "" ? undefined : new TaxField(name, value);
}

/** Alias em snake_case para paridade com o Rust. */
export const optional_field = optionalField;

/** Cria campo obrigatório ou lança erro fiscal quando ausente. */
export function requiredField(name: string, value?: string | null): TaxField {
  if (value === undefined || value === null || value === "") {
    throw new Error(`Campo obrigatório ausente: ${name}`);
  }
  return new TaxField(name, value);
}

/** Alias em snake_case para paridade com o Rust. */
export const required_field = requiredField;

/** Remove campos opcionais vazios de uma lista. */
export function filterFields(fields: Array<TaxField | undefined>): TaxField[] {
  return fields.filter((field): field is TaxField => Boolean(field));
}

/** Alias em snake_case para paridade com o Rust. */
export const filter_fields = filterFields;

/** Serializa um `TaxElement` para XML. */
export function serializeTaxElement(element: TaxElement): string {
  const outerFields = (element.outerFields ?? []).map((field) => tag(field.name, field.value)).join("");
  const variant = rawTag(element.variantTag, element.fields.map((field) => tag(field.name, field.value)).join(""));
  return element.outerTag ? rawTag(element.outerTag, `${outerFields}${variant}`) : variant;
}

/** Alias em snake_case para paridade com o Rust. */
export const serialize_tax_element = serializeTaxElement;

/** Cria uma tag somente quando o valor existe. */
export function optionalTag(name: string, value: unknown): string {
  return value === undefined || value === null || value === "" ? "" : tag(name, formatFiscalValue(value));
}

/**
 * Serializa um objeto fiscal genérico em tags XML.
 *
 * `firstKeys` força campos obrigatórios a saírem primeiro, reproduzindo a ordem
 * esperada pelos grupos fiscais da NF-e.
 */
export function genericFiscalGroup(data: FiscalRecord, firstKeys: string[] = []): string {
  const used = new Set(firstKeys);
  const ordered = [
    ...firstKeys,
    ...Object.keys(data).filter((key) => !used.has(key) && !["kind", "type", "data"].includes(key)),
  ];
  return ordered.map((key) => optionalTag(toXmlTagName(key), data[key])).join("");
}

/** Converte nomes TypeScript em snake/camel case para os nomes de tags NF-e. */
export function toXmlTagName(key: string): string {
  const special: Record<string, string> = {
    cst: "CST",
    csosn: "CSOSN",
    orig: "orig",
    c_enq: "cEnq",
    cEnq: "cEnq",
    v_bc: "vBC",
    p_bc: "pBC",
    mod_bc: "modBC",
    p_red_bc: "pRedBC",
    v_icms: "vICMS",
    p_icms: "pICMS",
    v_icms_deson: "vICMSDeson",
    mot_des_icms: "motDesICMS",
    ind_deduz_deson: "indDeduzDeson",
    mod_bc_st: "modBCST",
    p_mva_st: "pMVAST",
    p_red_bc_st: "pRedBCST",
    v_bc_st: "vBCST",
    p_icms_st: "pICMSST",
    v_icms_st: "vICMSST",
    v_bc_fcp: "vBCFCP",
    p_fcp: "pFCP",
    v_fcp: "vFCP",
    v_bc_fcp_st: "vBCFCPST",
    p_fcp_st: "pFCPST",
    v_fcp_st: "vFCPST",
    q_bc_prod: "qBCProd",
    v_aliq_prod: "vAliqProd",
    p_pis: "pPIS",
    v_pis: "vPIS",
    p_cofins: "pCOFINS",
    v_cofins: "vCOFINS",
    p_ipi: "pIPI",
    v_ipi: "vIPI",
  };
  if (special[key]) return special[key];
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

/** Formata valores especiais (`Cents`, `Rate`, `Rate4`) antes de emitir XML. */
export function formatFiscalValue(value: unknown): string {
  if (value instanceof Cents) return formatCents2(value.value);
  if (value instanceof Rate) return formatRate(value.value, 4);
  if (value instanceof Rate4) return formatRate4(value.value);
  if (typeof value === "object" && value !== null) return genericFiscalGroup(value as FiscalRecord);
  return String(value);
}
