import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";
import { eventTypes } from "./event_core.ts";
import { buildEventXmlWithOrg } from "./helpers.ts";

/** Item básico usado em eventos RTC por item da NF-e. */
export class RtcItem {
  quantidadeValue?: number;
  unidadeValue?: string;
  chaveValue?: string;
  nItemValue?: number;

  constructor(public item: number, public vIbs: number, public vCbs: number) {}

  quantidade(v: number): this { this.quantidadeValue = v; return this; }
  unidade(v: string): this { this.unidadeValue = v; return this; }
  chave(v: string): this { this.chaveValue = v; return this; }
  nItem(v: number): this { this.nItemValue = v; return this; }
  n_item(v: number): this { return this.nItem(v); }
}

/** Item de crédito presumido RTC. */
export interface RtcCredPresItem {
  cCredPres: string;
  vCredPresIbs: number;
  vCredPresCbs: number;
}

/** Substituição de crédito presumido RTC. */
export interface RtcCredPresSub {
  cCredPres: string;
  vCredPresIbs: number;
  vCredPresCbs: number;
}

function itemXml(item: RtcItem): string {
  return `<item nItem="${item.nItemValue ?? item.item}">${item.chaveValue ? `<chNFe>${item.chaveValue}</chNFe>` : ""}${item.quantidadeValue !== undefined ? `<qBC>${item.quantidadeValue}</qBC>` : ""}${item.unidadeValue ? `<uMed>${item.unidadeValue}</uMed>` : ""}<vIBS>${item.vIbs.toFixed(2)}</vIBS><vCBS>${item.vCbs.toFixed(2)}</vCBS></item>`;
}

function genericRtc(accessKey: string, eventType: number, verAplic: string, extra: string, seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return buildEventXmlWithOrg(accessKey, eventType, seq, taxId, environment, `<verAplic>${verAplic}</verAplic>${extra}`, orgCodeOverride);
}

/** Evento RTC de informação de pagamento integral. */
export function buildRtcInfoPagtoIntegral(accessKey: string, verAplic: string, items: RtcItem[], seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_INFO_PAGTO_INTEGRAL, verAplic, items.map(itemXml).join(""), seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de solicitação de apropriação de crédito presumido. */
export function buildRtcSolApropCredPresumido(accessKey: string, verAplic: string, itens: RtcCredPresItem[], seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  const xml = itens.map((i) => `<credPres><cCredPres>${i.cCredPres}</cCredPres><vCredPresIBS>${i.vCredPresIbs.toFixed(2)}</vCredPresIBS><vCredPresCBS>${i.vCredPresCbs.toFixed(2)}</vCredPresCBS></credPres>`).join("");
  return genericRtc(accessKey, eventTypes.RTC_SOL_APROP_CRED_PRESUMIDO, verAplic, xml, seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de destinação para consumo pessoal. */
export function buildRtcDestinoConsumoPessoal(accessKey: string, verAplic: string, items: RtcItem[], seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_DESTINO_CONSUMO_PESSOAL, verAplic, items.map(itemXml).join(""), seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de aceite de débito. */
export function buildRtcAceiteDebito(accessKey: string, verAplic: string, nProtEvento: string, seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_ACEITE_DEBITO, verAplic, `<nProtEvento>${nProtEvento}</nProtEvento>`, seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de imobilização de item. */
export function buildRtcImobilizacaoItem(accessKey: string, verAplic: string, items: RtcItem[], seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_IMOBILIZACAO_ITEM, verAplic, items.map(itemXml).join(""), seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de apropriação de crédito de combustível. */
export function buildRtcApropriacaoCreditoComb(accessKey: string, verAplic: string, items: RtcItem[], seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_APROPRIACAO_CREDITO_COMB, verAplic, items.map(itemXml).join(""), seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de apropriação de crédito de bens/serviços. */
export function buildRtcApropriacaoCreditoBens(accessKey: string, verAplic: string, items: RtcItem[], seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_APROPRIACAO_CREDITO_BENS, verAplic, items.map(itemXml).join(""), seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de manifestação de transferência de crédito IBS. */
export function buildRtcManifTransfCredIbs(accessKey: string, verAplic: string, aceite: boolean, seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_MANIF_TRANSF_CRED_IBS, verAplic, `<indAceite>${aceite ? 1 : 0}</indAceite>`, seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de manifestação de transferência de crédito CBS. */
export function buildRtcManifTransfCredCbs(accessKey: string, verAplic: string, aceite: boolean, seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_MANIF_TRANSF_CRED_CBS, verAplic, `<indAceite>${aceite ? 1 : 0}</indAceite>`, seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de cancelamento de outro evento. */
export function buildRtcCancelaEvento(accessKey: string, verAplic: string, eventProtocol: string, eventTypeToCancel: number, seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_CANCELA_EVENTO, verAplic, `<tpEventoCancelado>${eventTypeToCancel}</tpEventoCancelado><nProtEvento>${eventProtocol}</nProtEvento>`, seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de importação ZFM não convertida em isenção. */
export function buildRtcImportacaoZfm(accessKey: string, verAplic: string, items: RtcItem[], seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_IMPORTACAO_ZFM, verAplic, items.map(itemXml).join(""), seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de roubo/perda pelo adquirente. */
export function buildRtcRouboPerdaAdquirente(accessKey: string, verAplic: string, items: RtcItem[], seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_ROUBO_PERDA_ADQUIRENTE, verAplic, items.map(itemXml).join(""), seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de roubo/perda pelo fornecedor. */
export function buildRtcRouboPerdaFornecedor(accessKey: string, verAplic: string, items: RtcItem[], seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_ROUBO_PERDA_FORNECEDOR, verAplic, items.map(itemXml).join(""), seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de fornecimento não realizado. */
export function buildRtcFornecimentoNaoRealizado(accessKey: string, verAplic: string, items: RtcItem[], seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_FORNECIMENTO_NAO_REALIZADO, verAplic, items.map(itemXml).join(""), seq, environment, taxId, orgCodeOverride);
}

/** Evento RTC de atualização da data de entrega. */
export function buildRtcAtualizacaoDataEntrega(accessKey: string, verAplic: string, dataEntrega: string, seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  return genericRtc(accessKey, eventTypes.RTC_ATUALIZACAO_DATA_ENTREGA, verAplic, `<dhEntrega>${dataEntrega}</dhEntrega>`, seq, environment, taxId, orgCodeOverride);
}

export const build_rtc_info_pagto_integral = buildRtcInfoPagtoIntegral;
export const build_rtc_sol_aprop_cred_presumido = buildRtcSolApropCredPresumido;
export const build_rtc_destino_consumo_pessoal = buildRtcDestinoConsumoPessoal;
export const build_rtc_aceite_debito = buildRtcAceiteDebito;
export const build_rtc_imobilizacao_item = buildRtcImobilizacaoItem;
export const build_rtc_apropriacao_credito_comb = buildRtcApropriacaoCreditoComb;
export const build_rtc_apropriacao_credito_bens = buildRtcApropriacaoCreditoBens;
export const build_rtc_manif_transf_cred_ibs = buildRtcManifTransfCredIbs;
export const build_rtc_manif_transf_cred_cbs = buildRtcManifTransfCredCbs;
export const build_rtc_cancela_evento = buildRtcCancelaEvento;
export const build_rtc_importacao_zfm = buildRtcImportacaoZfm;
export const build_rtc_roubo_perda_adquirente = buildRtcRouboPerdaAdquirente;
export const build_rtc_roubo_perda_fornecedor = buildRtcRouboPerdaFornecedor;
export const build_rtc_fornecimento_nao_realizado = buildRtcFornecimentoNaoRealizado;
export const build_rtc_atualizacao_data_entrega = buildRtcAtualizacaoDataEntrega;
