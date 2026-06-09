/** Códigos `tpEvento` usados pelos builders de eventos SEFAZ. */
export const eventTypes = {
  CCE: 110110,
  CANCELLATION: 110111,
  CANCEL_SUBSTITUICAO: 110112,
  COMPROVANTE_ENTREGA: 110130,
  CANCEL_COMPROVANTE_ENTREGA: 110131,
  EPEC: 110140,
  ATOR_INTERESSADO: 110150,
  INSUCESSO_ENTREGA: 110192,
  CANCEL_INSUCESSO_ENTREGA: 110193,
  CONFIRMATION: 210200,
  AWARENESS: 210210,
  UNKNOWN_OPERATION: 210220,
  OPERATION_NOT_PERFORMED: 210240,
  PRORROGACAO_1: 111500,
  PRORROGACAO_2: 111501,
  CANCEL_PRORROGACAO_1: 111502,
  CANCEL_PRORROGACAO_2: 111503,
  CONCILIACAO: 110750,
  CANCEL_CONCILIACAO: 110751,
  RTC_CANCELA_EVENTO: 110001,
  RTC_INFO_PAGTO_INTEGRAL: 112110,
  RTC_IMPORTACAO_ZFM: 112120,
  RTC_ROUBO_PERDA_FORNECEDOR: 112130,
  RTC_FORNECIMENTO_NAO_REALIZADO: 112140,
  RTC_ATUALIZACAO_DATA_ENTREGA: 112150,
  RTC_SOL_APROP_CRED_PRESUMIDO: 211110,
  RTC_DESTINO_CONSUMO_PESSOAL: 211120,
  RTC_ROUBO_PERDA_ADQUIRENTE: 211124,
  RTC_ACEITE_DEBITO: 211128,
  RTC_IMOBILIZACAO_ITEM: 211130,
  RTC_APROPRIACAO_CREDITO_COMB: 211140,
  RTC_APROPRIACAO_CREDITO_BENS: 211150,
  RTC_MANIF_TRANSF_CRED_IBS: 212110,
  RTC_MANIF_TRANSF_CRED_CBS: 212120,
} as const;

export const event_types = eventTypes;

/** Descrição oficial usada dentro de `<descEvento>`. */
export function eventDescription(eventType: number): string {
  switch (eventType) {
    case 110110: return "Carta de Correcao";
    case 110111: return "Cancelamento";
    case 110112: return "Cancelamento por substituicao";
    case 110130: return "Comprovante de Entrega da NF-e";
    case 110131: return "Cancelamento Comprovante de Entrega da NF-e";
    case 110140: return "EPEC";
    case 110150: return "Ator interessado na NF-e";
    case 110192: return "Insucesso na Entrega da NF-e";
    case 110193: return "Cancelamento Insucesso na Entrega da NF-e";
    case 210200: return "Confirmacao da Operacao";
    case 210210: return "Ciencia da Operacao";
    case 210220: return "Desconhecimento da Operacao";
    case 210240: return "Operacao nao Realizada";
    case 111500:
    case 111501: return "Pedido de Prorrogacao";
    case 111502:
    case 111503: return "Cancelamento de Pedido de Prorrogacao";
    case 110750: return "ECONF";
    case 110751: return "Cancelamento Conciliação Financeira";
    case 110001: return "Cancelamento de Evento";
    case 112110: return "Informação de efetivo pagamento integral para liberar crédito presumido do adquirente";
    case 112120: return "Importação em ALC/ZFM não convertida em isenção";
    case 112130: return "Perecimento, perda, roubo ou furto durante o transporte contratado pelo fornecedor";
    case 112140: return "Fornecimento não realizado com pagamento antecipado";
    case 112150: return "Atualização da Data de Previsão de Entrega";
    case 211110: return "Solicitação de Apropriação de crédito presumido";
    case 211120: return "Destinação de item para consumo pessoal";
    case 211124: return "Perecimento, perda, roubo ou furto durante o transporte contratado pelo adquirente";
    case 211128: return "Aceite de débito na apuração por emissão de nota de crédito";
    case 211130: return "Imobilização de Item";
    case 211140: return "Solicitação de Apropriação de Crédito de Combustível";
    case 211150: return "Solicitação de Apropriação de Crédito para bens e serviços que dependem de atividade do adquirente";
    case 212110: return "Manifestação sobre Pedido de Transferência de Crédito de IBS em Operação de Sucessão";
    case 212120: return "Manifestação sobre Pedido de Transferência de Crédito de CBS em Operação de Sucessão";
    default: return "";
  }
}

/** ID do evento no padrão `ID{tpEvento}{chNFe}{nSeqEvento:02}`. */
export function buildEventId(eventType: number, accessKey: string, seq: number): string {
  return `ID${eventType}${accessKey}${String(seq).padStart(2, "0")}`;
}

export const event_description = eventDescription;
export const build_event_id = buildEventId;

