import type { FiscalRecord } from "./core.ts";
import { formatCents2, formatRate } from "./format_utils.ts";
import { Cents, unwrapNumber } from "./newtypes/monetary.ts";
import { genericFiscalGroup } from "./tax_element.ts";
import { rawTag, tag } from "./xml_utils.ts";
import type { TaxTotals } from "./tax_icms/totals.ts";

/** Dados do grupo ISSQN por item. */
export class IssqnData {
  v_bc: number;
  v_aliq: number;
  v_issqn: number;
  c_mun_fg: string;
  c_list_serv: string;
  v_deducao?: number;
  v_outro?: number;
  v_desc_incond?: number;
  v_desc_cond?: number;
  v_iss_ret?: number;
  ind_iss?: string;
  c_servico?: string;
  c_mun?: string;
  c_pais?: string;
  n_processo?: string;
  ind_incentivo?: string;
  [key: string]: unknown;

  constructor(vBc: number, vAliq: number, vIssqn: number, cMunFg: string, cListServ: string) {
    this.v_bc = vBc;
    this.v_aliq = vAliq;
    this.v_issqn = vIssqn;
    this.c_mun_fg = cMunFg;
    this.c_list_serv = cListServ;
  }

  vDeducao(value: number): this { this.v_deducao = value; return this; }
  vOutro(value: number): this { this.v_outro = value; return this; }
  vDescIncond(value: number): this { this.v_desc_incond = value; return this; }
  vDescCond(value: number): this { this.v_desc_cond = value; return this; }
  vIssRet(value: number): this { this.v_iss_ret = value; return this; }
  indIss(value: string): this { this.ind_iss = value; return this; }
  cServico(value: string): this { this.c_servico = value; return this; }
  cMun(value: string): this { this.c_mun = value; return this; }
  cPais(value: string): this { this.c_pais = value; return this; }
  nProcesso(value: string): this { this.n_processo = value; return this; }
  indIncentivo(value: string): this { this.ind_incentivo = value; return this; }
  buildXml(): string { return buildIssqnXml(this); }
  build_xml(): string { return this.buildXml(); }
}

/** Totais acumulados de ISSQN. */
export type IssqnTotals = TaxTotals;

/** Cria totais ISSQN zerados. */
export function createIssqnTotals(): TaxTotals {
  return { v_serv: 0, v_bc: 0, v_iss: 0, v_pis: 0, v_cofins: 0, v_deducao: 0, v_outro: 0, v_desc_incond: 0, v_desc_cond: 0, v_iss_ret: 0 };
}

/** Alias em snake_case para paridade com o Rust. */
export const create_issqn_totals = createIssqnTotals;

/** Gera XML do grupo ISSQN. */
export function buildIssqnXml(data: FiscalRecord): string {
  const body = [
    tag("vBC", cents(data.v_bc)),
    tag("vAliq", rate(data.v_aliq)),
    tag("vISSQN", cents(data.v_issqn)),
    tag("cMunFG", String(data.c_mun_fg ?? "")),
    tag("cListServ", String(data.c_list_serv ?? "")),
    data.v_deducao !== undefined ? tag("vDeducao", cents(data.v_deducao)) : "",
    data.v_outro !== undefined ? tag("vOutro", cents(data.v_outro)) : "",
    data.v_desc_incond !== undefined ? tag("vDescIncond", cents(data.v_desc_incond)) : "",
    data.v_desc_cond !== undefined ? tag("vDescCond", cents(data.v_desc_cond)) : "",
    data.v_iss_ret !== undefined ? tag("vISSRet", cents(data.v_iss_ret)) : "",
    data.ind_iss ? tag("indISS", String(data.ind_iss)) : "",
    data.c_servico ? tag("cServico", String(data.c_servico)) : "",
    data.c_mun ? tag("cMun", String(data.c_mun)) : "",
    data.c_pais ? tag("cPais", String(data.c_pais)) : "",
    data.n_processo ? tag("nProcesso", String(data.n_processo)) : "",
    data.ind_incentivo ? tag("indIncentivo", String(data.ind_incentivo)) : "",
  ].join("");
  return rawTag("ISSQN", body || genericFiscalGroup(data));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_issqn_xml = buildIssqnXml;

/** Gera XML ISSQN e acumula campos monetários conhecidos nos totais. */
export function buildIssqnXmlWithTotals(data: FiscalRecord, totals: TaxTotals): string {
  const mapping: Record<string, string> = {
    v_bc: "v_bc",
    v_issqn: "v_iss",
    v_deducao: "v_deducao",
    v_outro: "v_outro",
    v_desc_incond: "v_desc_incond",
    v_desc_cond: "v_desc_cond",
    v_iss_ret: "v_iss_ret",
  };
  for (const [field, target] of Object.entries(mapping)) {
    if (data[field] !== undefined) totals[target] = Number(totals[target] ?? 0) + unwrapNumber(data[field] as number);
  }
  return buildIssqnXml(data);
}

/** Alias em snake_case para paridade com o Rust. */
export const build_issqn_xml_with_totals = buildIssqnXmlWithTotals;

/** Gera XML de devolução de IPI dentro de `impostoDevol`. */
export function buildImpostoDevol(pDevol: number, vIpiDevol: number): string {
  return rawTag("impostoDevol", `${tag("pDevol", formatRate(pDevol, 2))}${rawTag("IPI", tag("vIPIDevol", formatCents2(vIpiDevol)))}`);
}

/** Alias em snake_case para paridade com o Rust. */
export const build_imposto_devol = buildImpostoDevol;

function cents(value: unknown): string {
  if (value instanceof Cents) return formatCents2(value.value);
  if (typeof value === "number" || typeof value === "bigint") return formatCents2(value);
  return String(value ?? "0.00");
}

function rate(value: unknown): string {
  if (typeof value === "number" || typeof value === "bigint") return formatRate(value, 2);
  return String(value ?? "0.00");
}
