import { NFE_NAMESPACE } from "../../fiscal-core/constants.ts";
import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";
import { buildEventId, eventDescription } from "./event_core.ts";

/** Retorna a data/hora do evento com deslocamento brasileiro fixo `-03:00`. */
export function brtTimestamp(date = new Date()): string {
  const shifted = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return `${shifted.toISOString().slice(0, 19)}-03:00`;
}

/** Converte CPF/CNPJ em tag XML, escolhendo CPF quando houver 11 dígitos. */
export function taxIdXmlTag(taxId: string): string {
  const digits = taxId.replace(/\D/g, "");
  return digits.length === 11 ? `<CPF>${digits}</CPF>` : `<CNPJ>${digits}</CNPJ>`;
}

/** Extrai uma seção XML simples mantendo a tag externa. */
export function extractSection(xml: string, tagName: string): string | undefined {
  const open = new RegExp(`<${tagName}(\\s|>|/)`);
  const match = open.exec(xml);
  if (!match || match.index === undefined) return undefined;
  const close = `</${tagName}>`;
  const end = xml.indexOf(close, match.index);
  return end === -1 ? undefined : xml.slice(match.index, end + close.length);
}

/** Valida o formato básico da chave de acesso. */
export function validateAccessKey(accessKey: string): void {
  if (!accessKey) throw new Error("Access key is required");
  if (!/^\d{44}$/.test(accessKey)) throw new Error(`Invalid access key: must be exactly 44 digits, got ${accessKey.length}`);
}

/** Remove declaração XML para permitir encaixe dentro dos envelopes SEFAZ. */
export function stripXmlDeclaration(xml: string): string {
  return xml.trim().replace(/^<\?xml[\s\S]*?\?>\s*/u, "");
}

/** Builder central de eventos NF-e. */
export function buildEventXml(
  accessKey: string,
  eventType: number,
  seq: number,
  taxId: string,
  environment: SefazEnvironment,
  additionalTags: string,
): string {
  return buildEventXmlWithOrg(accessKey, eventType, seq, taxId, environment, additionalTags);
}

/** Builder central de eventos NF-e com `cOrgao` opcional. */
export function buildEventXmlWithOrg(
  accessKey: string,
  eventType: number,
  seq: number,
  taxId: string,
  environment: SefazEnvironment,
  additionalTags: string,
  orgCodeOverride?: string,
): string {
  const eventId = buildEventId(eventType, accessKey, seq);
  const orgCode = orgCodeOverride ?? accessKey.slice(0, 2);
  const lotId = String(Date.now());
  const dhEvento = brtTimestamp();
  return `<envEvento xmlns="${NFE_NAMESPACE}" versao="1.00"><idLote>${lotId}</idLote><evento xmlns="${NFE_NAMESPACE}" versao="1.00"><infEvento Id="${eventId}"><cOrgao>${orgCode}</cOrgao><tpAmb>${environment}</tpAmb>${taxIdXmlTag(taxId)}<chNFe>${accessKey}</chNFe><dhEvento>${dhEvento}</dhEvento><tpEvento>${eventType}</tpEvento><nSeqEvento>${seq}</nSeqEvento><verEvento>1.00</verEvento><detEvento versao="1.00"><descEvento>${eventDescription(eventType)}</descEvento>${additionalTags}</detEvento></infEvento></evento></envEvento>`;
}

export const tax_id_xml_tag = taxIdXmlTag;
export const extract_section = extractSection;
export const validate_access_key = validateAccessKey;
export const strip_xml_declaration = stripXmlDeclaration;
export const build_event_xml = buildEventXml;
export const build_event_xml_with_org = buildEventXmlWithOrg;

