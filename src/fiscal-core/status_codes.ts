/** Constantes dos principais códigos `cStat` retornados pela SEFAZ. */
export const sefazStatus = {
  AUTHORIZED: "100",
  CANCELLED: "101",
  VOIDED: "102",
  SERVICE_RUNNING: "107",
  DENIED: "110",
  EVENT_REGISTERED: "135",
  EVENT_ALREADY_REGISTERED: "136",
  AUTHORIZED_LATE: "150",
  ALREADY_CANCELLED: "155",
  DUPLICATE: "204",
  DENIED_IN_DATABASE: "205",
  DENIED_ISSUER_IRREGULAR: "301",
  DENIED_RECIPIENT_IRREGULAR: "302",
  DENIED_RECIPIENT_NOT_ENABLED: "303",
} as const;

/** Status que permitem anexar protocolo e formar `nfeProc`. */
export const VALID_PROTOCOL_STATUSES = new Set(["100", "150", "110", "205", "301", "302", "303"]);
/** Status que permitem anexar retorno de evento e formar `procEventoNFe`. */
export const VALID_EVENT_STATUSES = new Set(["135", "136", "155"]);
