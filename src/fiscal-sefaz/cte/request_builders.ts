import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";
import { CTE_NAMESPACE, CTE_VERSION } from "./index.ts";

function stripXmlDeclaration(xml: string): string {
  return xml.trimStart().replace(/^<\?xml[\s\S]*?\?>\s*/u, "");
}

/** Monta consulta de status CT-e (`consStatServCTe`). */
export function buildCteStatusRequest(stateCode: string, environment: SefazEnvironment): string {
  return `<consStatServCTe xmlns="${CTE_NAMESPACE}" versao="${CTE_VERSION}"><tpAmb>${environment}</tpAmb><cUF>${stateCode}</cUF><xServ>STATUS</xServ></consStatServCTe>`;
}

/** Monta consulta CT-e por chave (`consSitCTe`). */
export function buildCteConsultaRequest(accessKey: string, environment: SefazEnvironment): string {
  if (!/^\d{44}$/.test(accessKey)) throw new Error("CT-e access key must be exactly 44 digits");
  return `<consSitCTe xmlns="${CTE_NAMESPACE}" versao="${CTE_VERSION}"><tpAmb>${environment}</tpAmb><xServ>CONSULTAR</xServ><chCTe>${accessKey}</chCTe></consSitCTe>`;
}

/** Payload da recepção síncrona CT-e: o documento assinado puro, sem lote. */
export function buildCteRecepcaoSincPayload(signedCteXml: string): string {
  if (!signedCteXml.trim()) throw new Error("signed CT-e XML is required for the reception payload");
  return stripXmlDeclaration(signedCteXml);
}

export const build_cte_status_request = buildCteStatusRequest;
export const build_cte_consulta_request = buildCteConsultaRequest;
export const build_cte_recepcao_sinc_payload = buildCteRecepcaoSincPayload;

