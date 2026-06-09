import { NFE_NAMESPACE, NFE_VERSION } from "../constants.ts";
import { FiscalError } from "../error.ts";
import { VALID_EVENT_STATUSES, VALID_PROTOCOL_STATUSES } from "../status_codes.ts";
import { extractXmlElement, extractXmlTagValue, rawTag } from "../xml_utils.ts";

/** Anexa o protocolo de autorização/rejeição processada e forma `nfeProc`. */
export function attachProtocol(requestXml: string, responseXml: string): string {
  const status = extractXmlTagValue(responseXml, "cStat");
  if (!status || !VALID_PROTOCOL_STATUSES.has(status)) {
    throw FiscalError.validation(`Invalid protocol status: ${status ?? "missing"}`);
  }
  const protNFe = extractXmlElement(responseXml, "protNFe");
  if (!protNFe) throw FiscalError.xml("Response XML does not contain protNFe.");
  const nfe = extractXmlElement(requestXml, "NFe") ?? requestXml;
  return rawTag("nfeProc", { xmlns: NFE_NAMESPACE, versao: NFE_VERSION }, `${nfe}${protNFe}`);
}
export const attach_protocol = attachProtocol;

/** Alias semântico para autorizar XML a partir do retorno da SEFAZ. */
export function toAuthorize(requestXml: string, responseXml: string): string {
  return attachProtocol(requestXml, responseXml);
}
export const to_authorize = toAuthorize;

/** Anexa o retorno de evento e forma `procEventoNFe`. */
export function attachEventProtocol(requestXml: string, responseXml: string): string {
  const status = extractXmlTagValue(responseXml, "cStat");
  if (!status || !VALID_EVENT_STATUSES.has(status)) {
    throw FiscalError.validation(`Invalid event status: ${status ?? "missing"}`);
  }
  const retEvento = extractXmlElement(responseXml, "retEvento");
  const evento = extractXmlElement(requestXml, "evento") ?? requestXml;
  if (!retEvento) throw FiscalError.xml("Response XML does not contain retEvento.");
  return rawTag("procEventoNFe", { versao: NFE_VERSION, xmlns: NFE_NAMESPACE }, `${evento}${retEvento}`);
}
export const attach_event_protocol = attachEventProtocol;

/** Anexa protocolo de cancelamento, que é um evento NF-e. */
export function attachCancellation(requestXml: string, responseXml: string): string {
  return attachEventProtocol(requestXml, responseXml);
}
export const attach_cancellation = attachCancellation;

/** Anexa retorno de inutilização e forma `ProcInutNFe`. */
export function attachInutilizacao(requestXml: string, responseXml: string): string {
  const inutNFe = extractXmlElement(requestXml, "inutNFe") ?? requestXml;
  const retInutNFe = extractXmlElement(responseXml, "retInutNFe");
  if (!retInutNFe) throw FiscalError.xml("Response XML does not contain retInutNFe.");
  return rawTag("ProcInutNFe", { versao: NFE_VERSION, xmlns: NFE_NAMESPACE }, `${inutNFe}${retInutNFe}`);
}
export const attach_inutilizacao = attachInutilizacao;

/** Anexa protocolo para fluxos B2B usando a mesma regra de autorização. */
export function attachB2b(requestXml: string, responseXml: string): string {
  return attachProtocol(requestXml, responseXml);
}
export const attach_b2b = attachB2b;
