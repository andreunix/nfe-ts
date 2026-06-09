import type { FiscalRecord } from "../core.ts";
import { genericFiscalGroup } from "../tax_element.ts";
import { rawTag } from "../xml_utils.ts";

const group = (name: string, data: FiscalRecord) => rawTag(name, genericFiscalGroup(data));

/** Monta o grupo de cobrança `<cobr>`. */
export const buildCobr = (billing: FiscalRecord): string => group("cobr", billing);
/** Monta o grupo de intermediador `<infIntermed>`. */
export const buildIntermediary = (intermed: FiscalRecord): string => group("infIntermed", intermed);
/** Monta o grupo do responsável técnico `<infRespTec>`. */
export const buildTechResponsible = (tech: FiscalRecord): string => group("infRespTec", tech);
/** Monta o responsável técnico incluindo chave de acesso, quando necessário. */
export const buildTechResponsibleWithKey = (tech: FiscalRecord, accessKey: string): string => group("infRespTec", { ...tech, access_key: accessKey });
/** Monta o grupo de compra `<compra>`. */
export const buildPurchase = (purchase: FiscalRecord): string => group("compra", purchase);
/** Monta o grupo de exportação `<exporta>`. */
export const buildExport = (exp: FiscalRecord): string => group("exporta", exp);
/** Monta o local de retirada `<retirada>`. */
export const buildWithdrawal = (w: FiscalRecord): string => group("retirada", w);
/** Monta o local de entrega `<entrega>`. */
export const buildDelivery = (d: FiscalRecord): string => group("entrega", d);
/** Monta o grupo `<cana>`. */
export const buildCana = (cana: FiscalRecord): string => group("cana", cana);
/** Monta grupos agropecuários PL_010. */
export const buildAgropecuario = (data: FiscalRecord): string => group("agropecuario", data);
/** Monta o grupo `<gCompraGov>`. */
export const buildCompraGov = (data: FiscalRecord): string => group("gCompraGov", data);
/** Monta o grupo `<gPagAntecipado>`. */
export const buildPagAntecipado = (data: FiscalRecord): string => group("gPagAntecipado", data);
/** Monta uma autorização XML `<autXML>`. */
export const buildAutXml = (entry: FiscalRecord): string => group("autXML", entry);

export const build_cobr = buildCobr;
export const build_intermediary = buildIntermediary;
export const build_tech_responsible = buildTechResponsible;
export const build_tech_responsible_with_key = buildTechResponsibleWithKey;
export const build_purchase = buildPurchase;
export const build_export = buildExport;
export const build_withdrawal = buildWithdrawal;
export const build_delivery = buildDelivery;
export const build_cana = buildCana;
export const build_agropecuario = buildAgropecuario;
export const build_compra_gov = buildCompraGov;
export const build_pag_antecipado = buildPagAntecipado;
export const build_aut_xml = buildAutXml;
