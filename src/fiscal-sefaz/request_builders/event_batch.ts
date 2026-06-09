import { NFE_NAMESPACE } from "../../fiscal-core/constants.ts";
import { getStateCode } from "../../fiscal-core/state_codes.ts";
import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";
import { buildEventId, eventDescription, eventTypes } from "./event_core.ts";
import { brtTimestamp, buildEventXml, taxIdXmlTag } from "./helpers.ts";

/** Item de pedido de prorrogação de ICMS. */
export interface ProrrogacaoItem {
  numItem: number;
  qtde: number;
}

/** Evento de pedido de prorrogação de ICMS. */
export function buildProrrogacaoRequest(accessKey: string, protocol: string, items: ProrrogacaoItem[], secondTerm: boolean, seq: number, environment: SefazEnvironment, taxId: string): string {
  const eventType = secondTerm ? eventTypes.PRORROGACAO_2 : eventTypes.PRORROGACAO_1;
  const itemXml = items.map((item) => `<itemPedido numItem="${item.numItem}"><qtdeItem>${item.qtde}</qtdeItem></itemPedido>`).join("");
  return buildEventXml(accessKey, eventType, seq, taxId, environment, `<nProt>${protocol}</nProt>${itemXml}`);
}

/** Evento de cancelamento de pedido de prorrogação de ICMS. */
export function buildCancelProrrogacaoRequest(accessKey: string, protocol: string, secondTerm: boolean, seq: number, environment: SefazEnvironment, taxId: string): string {
  const eventType = secondTerm ? eventTypes.CANCEL_PRORROGACAO_2 : eventTypes.CANCEL_PRORROGACAO_1;
  const original = secondTerm ? eventTypes.PRORROGACAO_2 : eventTypes.PRORROGACAO_1;
  return buildEventXml(accessKey, eventType, seq, taxId, environment, `<idPedidoCancelado>ID${original}${accessKey}${String(seq).padStart(2, "0")}</idPedidoCancelado><nProt>${protocol}</nProt>`);
}

/** Evento individual para montagem de lote de eventos. */
export interface EventItem {
  accessKey: string;
  eventType: number;
  seq: number;
  taxId: string;
  additionalTags: string;
}

/** Monta um único `<envEvento>` contendo múltiplos eventos. */
export function buildEventBatchRequest(uf: string, events: EventItem[], lotId: string | undefined, environment: SefazEnvironment): string {
  if (events.length === 0) throw new Error("Event batch must contain at least one event");
  if (events.length > 20) throw new Error(`Event batch is limited to 20 events, got ${events.length}`);
  const cOrgao = getStateCode(uf);
  const dhEvento = brtTimestamp();
  const batch = events.filter((evt) => evt.eventType !== eventTypes.EPEC).map((evt) => {
    const id = buildEventId(evt.eventType, evt.accessKey, evt.seq);
    return `<evento xmlns="${NFE_NAMESPACE}" versao="1.00"><infEvento Id="${id}"><cOrgao>${cOrgao}</cOrgao><tpAmb>${environment}</tpAmb>${taxIdXmlTag(evt.taxId)}<chNFe>${evt.accessKey}</chNFe><dhEvento>${dhEvento}</dhEvento><tpEvento>${evt.eventType}</tpEvento><nSeqEvento>${evt.seq}</nSeqEvento><verEvento>1.00</verEvento><detEvento versao="1.00"><descEvento>${eventDescription(evt.eventType)}</descEvento>${evt.additionalTags}</detEvento></infEvento></evento>`;
  }).join("");
  return `<envEvento xmlns="${NFE_NAMESPACE}" versao="1.00"><idLote>${lotId ?? Date.now()}</idLote>${batch}</envEvento>`;
}

export const build_prorrogacao_request = buildProrrogacaoRequest;
export const build_cancel_prorrogacao_request = buildCancelProrrogacaoRequest;
export const build_event_batch_request = buildEventBatchRequest;

