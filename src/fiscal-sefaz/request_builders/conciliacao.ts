import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";
import { eventTypes } from "./event_core.ts";
import { buildEventXmlWithOrg } from "./helpers.ts";

/** Detalhe de pagamento da conciliação financeira. */
export interface ConciliacaoDetPag {
  indPag?: string;
  tPag: string;
  xPag?: string;
  vPag: string;
  dPag: string;
  cnpjPag?: string;
  ufPag?: string;
  cnpjIf?: string;
  tBand?: string;
  cAut?: string;
  cnpjReceb?: string;
  ufReceb?: string;
}

/** Evento de conciliação financeira ou cancelamento de conciliação. */
export function buildConciliacaoRequest(accessKey: string, verAplic: string, detPag: ConciliacaoDetPag[], cancel: boolean, cancelProtocol: string | undefined, seq: number, environment: SefazEnvironment, taxId: string, orgCodeOverride?: string): string {
  if (cancel) {
    return buildEventXmlWithOrg(accessKey, eventTypes.CANCEL_CONCILIACAO, seq, taxId, environment, `<verAplic>${verAplic}</verAplic><nProtEvento>${cancelProtocol ?? ""}</nProtEvento>`, orgCodeOverride);
  }
  const details = detPag.map((pag) => {
    const pagInst = pag.cnpjPag && pag.ufPag ? `<CNPJPag>${pag.cnpjPag}</CNPJPag><UFPag>${pag.ufPag}</UFPag>${pag.cnpjIf ? `<CNPJIF>${pag.cnpjIf}</CNPJIF>` : ""}` : "";
    const receb = pag.cnpjReceb && pag.ufReceb ? `<CNPJReceb>${pag.cnpjReceb}</CNPJReceb><UFReceb>${pag.ufReceb}</UFReceb>` : "";
    return `<detPag>${pag.indPag ? `<indPag>${pag.indPag}</indPag>` : ""}<tPag>${pag.tPag}</tPag>${pag.xPag ? `<xPag>${pag.xPag}</xPag>` : ""}<vPag>${pag.vPag}</vPag><dPag>${pag.dPag}</dPag>${pagInst}${pag.tBand ? `<tBand>${pag.tBand}</tBand>` : ""}${pag.cAut ? `<cAut>${pag.cAut}</cAut>` : ""}${receb}</detPag>`;
  }).join("");
  return buildEventXmlWithOrg(accessKey, eventTypes.CONCILIACAO, seq, taxId, environment, `<verAplic>${verAplic}</verAplic>${details}`, orgCodeOverride);
}

export const build_conciliacao_request = buildConciliacaoRequest;

