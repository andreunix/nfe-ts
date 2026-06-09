import type { FiscalRecord } from "../core.ts";
import { genericFiscalGroup } from "../tax_element.ts";
import { rawTag } from "../xml_utils.ts";

/** Dados do grupo IBS/CBS por item. */
export type IbsCbsData = FiscalRecord;
/** Totais IBS/CBS do documento. */
export type IbsCbsTotData = FiscalRecord;
/** Totais do Imposto Seletivo. */
export type IsTotData = FiscalRecord;
/** Dados de diferimento. */
export type GDifData = FiscalRecord;
/** Dados de devolução de tributo. */
export type GDevTribData = FiscalRecord;
/** Dados de redução de alíquota. */
export type GRedData = FiscalRecord;
/** Dados IBS da UF. */
export type GIbsUfData = FiscalRecord;
/** Dados IBS municipal. */
export type GIbsMunData = FiscalRecord;
/** Dados CBS. */
export type GCbsData = FiscalRecord;
/** Grupo agregado IBS/CBS. */
export type GIbsCbsData = FiscalRecord;
/** Dados de tributação regular. */
export type GTribRegularData = FiscalRecord;
/** Dados de compra governamental. */
export type GTribCompraGovData = FiscalRecord;
/** Dados de transferência de crédito. */
export type GTransfCredData = FiscalRecord;
/** Dados de crédito presumido IBS/ZFM. */
export type GCredPresIbsZfmData = FiscalRecord;
/** Dados de ajuste de competência. */
export type GAjusteCompetData = FiscalRecord;
/** Dados de estorno de crédito. */
export type GEstornoCredData = FiscalRecord;
/** Dados de crédito presumido IBS. */
export type GIbsCredPresData = FiscalRecord;
/** Dados de crédito presumido CBS. */
export type GCbsCredPresData = FiscalRecord;
/** Dados de crédito presumido da operação. */
export type GCredPresOperData = FiscalRecord;

/** Gera XML do grupo IBS/CBS por item. */
export function buildIbsCbsXml(data: FiscalRecord): string {
  return rawTag("IBSCBS", genericFiscalGroup(data, ["cst", "c_class_trib"]));
}

/** Gera XML dos totais do Imposto Seletivo. */
export function buildIsTotXml(data: FiscalRecord): string {
  return rawTag("ISTot", genericFiscalGroup(data));
}

/** Gera XML dos totais IBS/CBS do documento. */
export function buildIbsCbsTotXml(data: FiscalRecord): string {
  return rawTag("IBSCBSTot", genericFiscalGroup(data));
}
