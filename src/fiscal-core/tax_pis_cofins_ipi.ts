import type { FiscalRecord } from "./core.ts";
import { formatCents, formatCents2, formatRate, formatRate4 } from "./format_utils.ts";
import { Cents, Rate, Rate4, unwrapNumber } from "./newtypes/monetary.ts";
import { genericFiscalGroup, optionalTag } from "./tax_element.ts";
import { rawTag, tag } from "./xml_utils.ts";

/** Dados do grupo PIS. */
export class PisData {
  cst: string;
  v_bc?: Cents;
  p_pis?: Rate4;
  v_pis?: Cents;
  q_bc_prod?: number;
  v_aliq_prod?: number;
  [key: string]: unknown;

  constructor(cst: string) {
    this.cst = cst;
  }

  vBc(value: Cents): this { this.v_bc = value; return this; }
  v_bc_set(value: Cents): this { return this.vBc(value); }
  pPis(value: Rate4): this { this.p_pis = value; return this; }
  p_pis_set(value: Rate4): this { return this.pPis(value); }
  vPis(value: Cents): this { this.v_pis = value; return this; }
  v_pis_set(value: Cents): this { return this.vPis(value); }
  qBcProd(value: number): this { this.q_bc_prod = value; return this; }
  q_bc_prod_set(value: number): this { return this.qBcProd(value); }
  vAliqProd(value: number): this { this.v_aliq_prod = value; return this; }
  v_aliq_prod_set(value: number): this { return this.vAliqProd(value); }
  buildXml(): string { return buildPisXml(this); }
  build_xml(): string { return this.buildXml(); }
}

/** Dados do grupo PISST. */
export class PisStData {
  v_pis: Cents;
  v_bc?: Cents;
  p_pis?: Rate4;
  q_bc_prod?: number;
  v_aliq_prod?: number;
  ind_soma_pis_st?: number;
  [key: string]: unknown;

  constructor(vPis: Cents) {
    this.v_pis = vPis;
  }

  vBc(value: Cents): this { this.v_bc = value; return this; }
  pPis(value: Rate4): this { this.p_pis = value; return this; }
  qBcProd(value: number): this { this.q_bc_prod = value; return this; }
  vAliqProd(value: number): this { this.v_aliq_prod = value; return this; }
  indSomaPisSt(value: number): this { this.ind_soma_pis_st = value; return this; }
  buildXml(): string { return buildPisStXml(this); }
  build_xml(): string { return this.buildXml(); }
}

/** Dados do grupo COFINS. */
export class CofinsData {
  cst: string;
  v_bc?: Cents;
  p_cofins?: Rate4;
  v_cofins?: Cents;
  q_bc_prod?: number;
  v_aliq_prod?: number;
  [key: string]: unknown;

  constructor(cst: string) {
    this.cst = cst;
  }

  vBc(value: Cents): this { this.v_bc = value; return this; }
  pCofins(value: Rate4): this { this.p_cofins = value; return this; }
  vCofins(value: Cents): this { this.v_cofins = value; return this; }
  qBcProd(value: number): this { this.q_bc_prod = value; return this; }
  vAliqProd(value: number): this { this.v_aliq_prod = value; return this; }
  buildXml(): string { return buildCofinsXml(this); }
  build_xml(): string { return this.buildXml(); }
}

/** Dados do grupo COFINSST. */
export class CofinsStData {
  v_cofins: Cents;
  v_bc?: Cents;
  p_cofins?: Rate4;
  q_bc_prod?: number;
  v_aliq_prod?: number;
  ind_soma_cofins_st?: number;
  [key: string]: unknown;

  constructor(vCofins: Cents) {
    this.v_cofins = vCofins;
  }

  vBc(value: Cents): this { this.v_bc = value; return this; }
  pCofins(value: Rate4): this { this.p_cofins = value; return this; }
  qBcProd(value: number): this { this.q_bc_prod = value; return this; }
  vAliqProd(value: number): this { this.v_aliq_prod = value; return this; }
  indSomaCofinsSt(value: number): this { this.ind_soma_cofins_st = value; return this; }
  buildXml(): string { return buildCofinsStXml(this); }
  build_xml(): string { return this.buildXml(); }
}

/** Dados do grupo IPI. */
export class IpiData {
  cst: string;
  c_enq: string;
  cnpj_prod?: string;
  c_selo?: string;
  q_selo?: number;
  v_bc?: Cents;
  p_ipi?: Rate;
  q_unid?: number;
  v_unid?: number;
  v_ipi?: Cents;
  [key: string]: unknown;

  constructor(cst: string, cEnq: string) {
    this.cst = cst;
    this.c_enq = cEnq;
  }

  cnpjProd(value: string): this { this.cnpj_prod = value; return this; }
  cSelo(value: string): this { this.c_selo = value; return this; }
  qSelo(value: number): this { this.q_selo = value; return this; }
  vBc(value: Cents): this { this.v_bc = value; return this; }
  pIpi(value: Rate): this { this.p_ipi = value; return this; }
  qUnid(value: number): this { this.q_unid = value; return this; }
  vUnid(value: number): this { this.v_unid = value; return this; }
  vIpi(value: Cents): this { this.v_ipi = value; return this; }
  buildXml(): string { return buildIpiXml(this); }
  build_xml(): string { return this.buildXml(); }
}

/** Dados do grupo II. */
export class IiData {
  v_bc: Cents;
  v_desp_adu: Cents;
  v_ii: Cents;
  v_iof: Cents;
  [key: string]: unknown;

  constructor(vBc: Cents, vDespAdu: Cents, vIi: Cents, vIof: Cents) {
    this.v_bc = vBc;
    this.v_desp_adu = vDespAdu;
    this.v_ii = vIi;
    this.v_iof = vIof;
  }

  buildXml(): string { return buildIiXml(this); }
  build_xml(): string { return this.buildXml(); }
}

/** Gera XML do grupo PIS conforme o CST informado. */
export function buildPisXml(data: FiscalRecord): string {
  return rawTag("PIS", rawTag(`PIS${pisCofinsGroupSuffix(String(data.cst ?? ""))}`, pisCofinsBody(data, "pis")));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_pis_xml = buildPisXml;

/** Gera XML do grupo PISST. */
export function buildPisStXml(data: FiscalRecord): string {
  return rawTag("PISST", pisStBody(data, "pis"));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_pis_st_xml = buildPisStXml;

/** Gera XML do grupo COFINS conforme o CST informado. */
export function buildCofinsXml(data: FiscalRecord): string {
  return rawTag("COFINS", rawTag(`COFINS${pisCofinsGroupSuffix(String(data.cst ?? ""))}`, pisCofinsBody(data, "cofins")));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_cofins_xml = buildCofinsXml;

/** Gera XML do grupo COFINSST. */
export function buildCofinsStXml(data: FiscalRecord): string {
  return rawTag("COFINSST", pisStBody(data, "cofins"));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_cofins_st_xml = buildCofinsStXml;

/** Gera XML do grupo IPI, escolhendo IPITrib ou IPINT conforme o CST. */
export function buildIpiXml(data: FiscalRecord): string {
  const suffix = ["00", "49", "50", "99"].includes(String(data.cst)) ? "IPITrib" : "IPINT";
  const specific = suffix === "IPITrib"
    ? [
        tag("CST", String(data.cst ?? "")),
        optionalTag("vBC", cents(data.v_bc)),
        optionalTag("pIPI", rate(data.p_ipi)),
        optionalTag("qUnid", decimal(data.q_unid, 4)),
        optionalTag("vUnid", decimal(data.v_unid, 4)),
        optionalTag("vIPI", cents(data.v_ipi)),
      ].join("")
    : tag("CST", String(data.cst ?? ""));
  return rawTag("IPI", [
    optionalTag("CNPJProd", data.cnpj_prod),
    optionalTag("cSelo", data.c_selo),
    optionalTag("qSelo", data.q_selo),
    tag("cEnq", String(data.c_enq ?? data.cEnq ?? "")),
    rawTag(suffix, specific),
  ].join(""));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_ipi_xml = buildIpiXml;

/** Gera XML do grupo Imposto de Importação (`II`). */
export function buildIiXml(data: FiscalRecord): string {
  return rawTag("II", [
    tag("vBC", cents(data.v_bc)),
    tag("vDespAdu", cents(data.v_desp_adu)),
    tag("vII", cents(data.v_ii)),
    tag("vIOF", cents(data.v_iof)),
  ].join(""));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_ii_xml = buildIiXml;

function pisCofinsGroupSuffix(cst: string): string {
  if (["01", "02"].includes(cst)) return "Aliq";
  if (cst === "03") return "Qtde";
  if (["04", "05", "06", "07", "08", "09"].includes(cst)) return "NT";
  return "Outr";
}

function pisCofinsBody(data: FiscalRecord, tax: "pis" | "cofins"): string {
  const upper = tax === "pis" ? "PIS" : "COFINS";
  const rateKey = tax === "pis" ? "p_pis" : "p_cofins";
  const valueKey = tax === "pis" ? "v_pis" : "v_cofins";
  const cst = String(data.cst ?? "");
  if (["04", "05", "06", "07", "08", "09"].includes(cst)) return tag("CST", cst);
  if (cst === "03") {
    return [
      tag("CST", cst),
      optionalTag("qBCProd", decimal(data.q_bc_prod, 4)),
      optionalTag("vAliqProd", decimal(data.v_aliq_prod, 4)),
      optionalTag(`v${upper}`, cents(data[valueKey])),
    ].join("");
  }
  return [
    tag("CST", cst),
    optionalTag("vBC", cents(data.v_bc)),
    optionalTag(`p${upper}`, rate4(data[rateKey])),
    optionalTag(`v${upper}`, cents(data[valueKey])),
    optionalTag("qBCProd", decimal(data.q_bc_prod, 4)),
    optionalTag("vAliqProd", decimal(data.v_aliq_prod, 4)),
  ].join("");
}

function pisStBody(data: FiscalRecord, tax: "pis" | "cofins"): string {
  const upper = tax === "pis" ? "PIS" : "COFINS";
  const rateKey = tax === "pis" ? "p_pis" : "p_cofins";
  const valueKey = tax === "pis" ? "v_pis" : "v_cofins";
  return [
    optionalTag("vBC", cents(data.v_bc)),
    optionalTag(`p${upper}`, rate4(data[rateKey])),
    optionalTag("qBCProd", decimal(data.q_bc_prod, 4)),
    optionalTag("vAliqProd", decimal(data.v_aliq_prod, 4)),
    tag(`v${upper}`, cents(data[valueKey])),
    optionalTag(`indSoma${upper}ST`, data[`ind_soma_${tax}_st`]),
  ].join("") || genericFiscalGroup(data);
}

function cents(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (value instanceof Cents) return formatCents2(value.value);
  if (typeof value === "number" || typeof value === "bigint") return formatCents2(value);
  return String(value);
}

function rate(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (value instanceof Rate) return formatRate(value.value, 4);
  if (typeof value === "number" || typeof value === "bigint") return formatRate(value, 4);
  return String(value);
}

function rate4(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (value instanceof Rate4) return formatRate4(value.value);
  if (typeof value === "number" || typeof value === "bigint") return formatRate4(value);
  return String(value);
}

function decimal(value: unknown, places: number): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (value instanceof Cents || value instanceof Rate || value instanceof Rate4) return formatCents(unwrapNumber(value), places);
  if (typeof value === "number" || typeof value === "bigint") return (Number(value) / 100).toFixed(places);
  return String(value);
}
