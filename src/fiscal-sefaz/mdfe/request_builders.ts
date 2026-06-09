import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";
import { MDFE_NAMESPACE, MDFE_VERSION } from "./index.ts";

function stripXmlDeclaration(xml: string): string {
  return xml.trimStart().replace(/^<\?xml[\s\S]*?\?>\s*/u, "");
}

/** Monta consulta de status MDF-e. */
export function buildMdfeStatusRequest(environment: SefazEnvironment): string {
  return `<consStatServMDFe xmlns="${MDFE_NAMESPACE}" versao="${MDFE_VERSION}"><tpAmb>${environment}</tpAmb><xServ>STATUS</xServ></consStatServMDFe>`;
}

/** Monta consulta MDF-e por chave. */
export function buildMdfeConsultaRequest(accessKey: string, environment: SefazEnvironment): string {
  if (!/^\d{44}$/.test(accessKey)) throw new Error("MDF-e access key must be exactly 44 digits");
  return `<consSitMDFe xmlns="${MDFE_NAMESPACE}" versao="${MDFE_VERSION}"><tpAmb>${environment}</tpAmb><xServ>CONSULTAR</xServ><chMDFe>${accessKey}</chMDFe></consSitMDFe>`;
}

/** Payload da recepção síncrona MDF-e: o documento assinado puro, sem lote. */
export function buildMdfeRecepcaoSincPayload(signedMdfeXml: string, _lotId: string): string {
  if (!signedMdfeXml.trim()) throw new Error("signed MDF-e XML is required for the reception payload");
  return stripXmlDeclaration(signedMdfeXml);
}

export const build_mdfe_status_request = buildMdfeStatusRequest;
export const build_mdfe_consulta_request = buildMdfeConsultaRequest;
export const build_mdfe_recepcao_sinc_payload = buildMdfeRecepcaoSincPayload;

