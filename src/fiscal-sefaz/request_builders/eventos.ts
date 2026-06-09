import { getStateCode } from "../../fiscal-core/state_codes.ts";
import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";
import { eventTypes } from "./event_core.ts";
import { buildEventXml, buildEventXmlWithOrg } from "./helpers.ts";

/** Evento de cancelamento NF-e (`110111`). */
export function buildCancelaRequest(accessKey: string, protocol: string, justification: string, seq: number, environment: SefazEnvironment, taxId: string): string {
  if (!justification) throw new Error("Cancellation justification (xJust) is required");
  return buildEventXml(accessKey, eventTypes.CANCELLATION, seq, taxId, environment, `<nProt>${protocol}</nProt><xJust>${justification}</xJust>`);
}

/** Evento de Carta de Correção Eletrônica (`110110`). */
export function buildCceRequest(accessKey: string, correction: string, seq: number, environment: SefazEnvironment, taxId: string): string {
  if (!correction) throw new Error("Correction text (xCorrecao) is required for CCe");
  const cond = "A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, de 15 de dezembro de 1970 e pode ser utilizada para regularizacao de erro ocorrido na emissao de documento fiscal, desde que o erro nao esteja relacionado com: I - as variaveis que determinam o valor do imposto tais como: base de calculo, aliquota, diferenca de preco, quantidade, valor da operacao ou da prestacao; II - a correcao de dados cadastrais que implique mudanca do remetente ou do destinatario; III - a data de emissao ou de saida.";
  return buildEventXml(accessKey, eventTypes.CCE, seq, taxId, environment, `<xCorrecao>${correction}</xCorrecao><xCondUso>${cond}</xCondUso>`);
}

/** Evento de manifestação do destinatário enviado ao Ambiente Nacional. */
export function buildManifestaRequest(accessKey: string, eventType: string, justification: string | undefined, seq: number, environment: SefazEnvironment, taxId: string): string {
  const tpEvento = Number.parseInt(eventType, 10) || 0;
  const additional = tpEvento === eventTypes.OPERATION_NOT_PERFORMED && justification ? `<xJust>${justification}</xJust>` : "";
  return buildEventXmlWithOrg(accessKey, tpEvento, seq, taxId, environment, additional, "91");
}

/** Evento NFC-e de cancelamento por substituição (`110112`). */
export function buildCancelSubstituicaoRequest(accessKey: string, refAccessKey: string, protocol: string, justification: string, verAplic: string, seq: number, environment: SefazEnvironment, taxId: string): string {
  if (!justification) throw new Error("Cancellation justification (xJust) is required");
  if (!refAccessKey) throw new Error("Reference access key (chNFeRef) is required");
  if (!verAplic) throw new Error("Application version (verAplic) is required");
  const cOrgao = accessKey.slice(0, 2);
  const additional = `<cOrgaoAutor>${cOrgao}</cOrgaoAutor><tpAutor>1</tpAutor><verAplic>${verAplic}</verAplic><nProt>${protocol}</nProt><xJust>${justification}</xJust><chNFeRef>${refAccessKey}</chNFeRef>`;
  return buildEventXml(accessKey, eventTypes.CANCEL_SUBSTITUICAO, seq, taxId, environment, additional);
}

/** Evento de ator interessado, usado para autorizar transportador no download da NF-e. */
export function buildAtorInteressadoRequest(accessKey: string, tpAutor: number, verAplic: string, authorizedCnpj: string | undefined, authorizedCpf: string | undefined, tpAutorizacao: number, issuerUf: string, seq: number, environment: SefazEnvironment, taxId: string): string {
  const cUf = getStateCode(issuerUf);
  const authTag = authorizedCnpj ? `<CNPJ>${authorizedCnpj}</CNPJ>` : authorizedCpf ? `<CPF>${authorizedCpf}</CPF>` : (() => { throw new Error("Either authorized_cnpj or authorized_cpf must be provided"); })();
  const cond = tpAutorizacao === 1 ? "<xCondUso>O emitente ou destinatario da NF-e, declara que permite o transportador declarado no campo CNPJ/CPF deste evento a autorizar os transportadores subcontratados ou redespachados a terem acesso ao download da NF-e</xCondUso>" : "";
  const additional = `<cOrgaoAutor>${cUf}</cOrgaoAutor><tpAutor>${tpAutor}</tpAutor><verAplic>${verAplic}</verAplic><autXML>${authTag}</autXML><tpAutorizacao>${tpAutorizacao}</tpAutorizacao>${cond}`;
  return buildEventXmlWithOrg(accessKey, eventTypes.ATOR_INTERESSADO, seq, taxId, environment, additional, "91");
}

/** Evento de comprovante de entrega (`110130`). */
export function buildComprovanteEntregaRequest(accessKey: string, verAplic: string, deliveryDate: string, docNumber: string, name: string, lat: string | undefined, long: string | undefined, hash: string, hashDate: string, issuerUf: string, seq: number, environment: SefazEnvironment, taxId: string): string {
  const cUf = getStateCode(issuerUf);
  const gps = lat && long ? `<latGPS>${lat}</latGPS><longGPS>${long}</longGPS>` : "";
  const additional = `<cOrgaoAutor>${cUf}</cOrgaoAutor><tpAutor>1</tpAutor><verAplic>${verAplic}</verAplic><dhEntrega>${deliveryDate}</dhEntrega><nDoc>${docNumber}</nDoc><xNome>${name}</xNome>${gps}<hashComprovante>${hash}</hashComprovante><dhHashComprovante>${hashDate}</dhHashComprovante>`;
  return buildEventXmlWithOrg(accessKey, eventTypes.COMPROVANTE_ENTREGA, seq, taxId, environment, additional, "91");
}

/** Evento de cancelamento do comprovante de entrega (`110131`). */
export function buildCancelComprovanteEntregaRequest(accessKey: string, verAplic: string, eventProtocol: string, issuerUf: string, seq: number, environment: SefazEnvironment, taxId: string): string {
  const cUf = getStateCode(issuerUf);
  const additional = `<cOrgaoAutor>${cUf}</cOrgaoAutor><tpAutor>1</tpAutor><verAplic>${verAplic}</verAplic><nProtEvento>${eventProtocol}</nProtEvento>`;
  return buildEventXmlWithOrg(accessKey, eventTypes.CANCEL_COMPROVANTE_ENTREGA, seq, taxId, environment, additional, "91");
}

/** Evento de insucesso de entrega (`110192`). */
export function buildInsucessoEntregaRequest(accessKey: string, verAplic: string, attemptDate: string, attemptNumber: number | undefined, reasonType: number, reasonJustification: string | undefined, lat: string | undefined, long: string | undefined, hash: string, hashDate: string, issuerUf: string, seq: number, environment: SefazEnvironment, taxId: string): string {
  const cUf = getStateCode(issuerUf);
  const nTentativa = attemptNumber && attemptNumber > 0 ? `<nTentativa>${attemptNumber}</nTentativa>` : "";
  const just = reasonType === 4 && reasonJustification ? `<xJustMotivo>${reasonJustification}</xJustMotivo>` : "";
  const gps = lat && long ? `<latGPS>${lat}</latGPS><longGPS>${long}</longGPS>` : "";
  const additional = `<cOrgaoAutor>${cUf}</cOrgaoAutor><verAplic>${verAplic}</verAplic><dhTentativaEntrega>${attemptDate}</dhTentativaEntrega>${nTentativa}<tpMotivo>${reasonType}</tpMotivo>${just}${gps}<hashTentativaEntrega>${hash}</hashTentativaEntrega><dhHashTentativaEntrega>${hashDate}</dhHashTentativaEntrega>`;
  return buildEventXmlWithOrg(accessKey, eventTypes.INSUCESSO_ENTREGA, seq, taxId, environment, additional, "91");
}

/** Evento de cancelamento de insucesso de entrega (`110193`). */
export function buildCancelInsucessoEntregaRequest(accessKey: string, verAplic: string, eventProtocol: string, issuerUf: string, seq: number, environment: SefazEnvironment, taxId: string): string {
  const cUf = getStateCode(issuerUf);
  const additional = `<cOrgaoAutor>${cUf}</cOrgaoAutor><verAplic>${verAplic}</verAplic><nProtEvento>${eventProtocol}</nProtEvento>`;
  return buildEventXmlWithOrg(accessKey, eventTypes.CANCEL_INSUCESSO_ENTREGA, seq, taxId, environment, additional, "91");
}

export const build_cancela_request = buildCancelaRequest;
export const build_cce_request = buildCceRequest;
export const build_manifesta_request = buildManifestaRequest;
export const build_cancel_substituicao_request = buildCancelSubstituicaoRequest;
export const build_ator_interessado_request = buildAtorInteressadoRequest;
export const build_comprovante_entrega_request = buildComprovanteEntregaRequest;
export const build_cancel_comprovante_entrega_request = buildCancelComprovanteEntregaRequest;
export const build_insucesso_entrega_request = buildInsucessoEntregaRequest;
export const build_cancel_insucesso_entrega_request = buildCancelInsucessoEntregaRequest;

