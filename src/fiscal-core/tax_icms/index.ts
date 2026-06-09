import type { FiscalRecord } from "../core.ts";
import { unwrapNumber } from "../newtypes/monetary.ts";
import { genericFiscalGroup } from "../tax_element.ts";
import { rawTag } from "../xml_utils.ts";
import { createIcmsTotals, type TaxTotals } from "./totals.ts";

/** Variante ICMS de regime normal, identificada por CST. */
export type IcmsCst = FiscalRecord & { kind?: string; cst?: string; orig?: string };
/** Variante ICMS do Simples Nacional, identificada por CSOSN. */
export type IcmsCsosn = FiscalRecord & { kind?: string; csosn?: string; orig?: string };
/** União pública aceita pelo builder de ICMS. */
export type IcmsVariant = { type: "cst"; data: IcmsCst } | { type: "csosn"; data: IcmsCsosn } | IcmsCst | IcmsCsosn;
/** Dados do grupo ICMSPart. */
export type IcmsPartData = FiscalRecord;
/** Dados do grupo ICMSST. */
export type IcmsStData = FiscalRecord;
/** Dados do grupo ICMSUFDest. */
export type IcmsUfDestData = FiscalRecord;

export { createIcmsTotals, IcmsTotals, mergeIcmsTotals, type TaxTotals } from "./totals.ts";

/** Retorna o código CST de uma variante ICMS normal. */
export function icmsCstCode(data: IcmsCst): string {
  return String(data.cst ?? data.kind?.replace(/\D/g, "") ?? "");
}

/** Retorna o código CSOSN de uma variante ICMS Simples Nacional. */
export function icmsCsosnCode(data: IcmsCsosn): string {
  return String(data.csosn ?? data.kind?.replace(/\D/g, "") ?? "");
}

/** Gera XML de uma variante ICMS CST e acumula totais conhecidos. */
export function buildIcmsCstXml(data: IcmsCst, totals: TaxTotals = createIcmsTotals()): [string, TaxTotals] {
  const cst = icmsCstCode(data);
  const body = genericFiscalGroup({ ...data, cst }, ["orig", "cst"]);
  accumulateKnownIcmsFields(totals, data);
  return [rawTag(`ICMS${cst}`, body), totals];
}

/** Gera XML de uma variante ICMS CSOSN e acumula totais conhecidos. */
export function buildIcmsCsosnXml(data: IcmsCsosn, totals: TaxTotals = createIcmsTotals()): [string, TaxTotals] {
  const csosn = icmsCsosnCode(data);
  const body = genericFiscalGroup({ ...data, csosn }, ["orig", "csosn"]);
  accumulateKnownIcmsFields(totals, data);
  return [rawTag(`ICMSSN${csosn}`, body), totals];
}

/** Gera o grupo `<ICMS>` escolhendo CST ou CSOSN automaticamente. */
export function buildIcmsXml(variant: IcmsVariant): [string, TaxTotals] {
  const data = ("data" in variant ? variant.data : variant) as FiscalRecord;
  const type = "type" in variant ? variant.type : ("csosn" in data ? "csosn" : "cst");
  const [inner, totals] = type === "csosn" ? buildIcmsCsosnXml(data as IcmsCsosn) : buildIcmsCstXml(data as IcmsCst);
  return [rawTag("ICMS", inner), totals];
}

/** Gera XML do grupo ICMSPart e seus totais. */
export function buildIcmsPartXml(data: FiscalRecord): [string, TaxTotals] {
  const totals = createIcmsTotals();
  accumulateKnownIcmsFields(totals, data);
  return [rawTag("ICMSPart", genericFiscalGroup(data, ["orig", "cst"])), totals];
}

/** Gera XML do grupo ICMSST e seus totais. */
export function buildIcmsStXml(data: FiscalRecord): [string, TaxTotals] {
  const totals = createIcmsTotals();
  accumulateKnownIcmsFields(totals, data);
  return [rawTag("ICMSST", genericFiscalGroup(data, ["orig", "cst"])), totals];
}

/** Gera XML do grupo ICMSUFDest e seus totais. */
export function buildIcmsUfDestXml(data: FiscalRecord): [string, TaxTotals] {
  const totals = createIcmsTotals();
  accumulateKnownIcmsFields(totals, data);
  return [rawTag("ICMSUFDest", genericFiscalGroup(data)), totals];
}

/** Acumula campos ICMS conhecidos em uma estrutura de totais. */
function accumulateKnownIcmsFields(totals: TaxTotals, data: FiscalRecord): void {
  const mapping: Record<string, string> = {
    v_bc: "v_bc",
    vICMS: "v_icms",
    v_icms: "v_icms",
    v_icms_deson: "v_icms_deson",
    v_bc_st: "v_bc_st",
    v_icms_st: "v_st",
    v_fcp: "v_fcp",
    v_fcp_st: "v_fcp_st",
    v_fcp_st_ret: "v_fcp_st_ret",
    v_fcp_uf_dest: "v_fcp_uf_dest",
    v_icms_uf_dest: "v_icms_uf_dest",
    v_icms_uf_remet: "v_icms_uf_remet",
    v_icms_mono: "v_icms_mono",
    v_icms_mono_reten: "v_icms_mono_reten",
    v_icms_mono_ret: "v_icms_mono_ret",
  };
  for (const [field, target] of Object.entries(mapping)) {
    const value = data[field];
    if (value !== undefined && value !== null) totals[target] = Number(totals[target] ?? 0) + unwrapNumber(value as number);
  }
}
