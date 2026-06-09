import { FiscalError } from "../../fiscal-core/error.ts";
import { extractAllRawTags, extractInnerContent, extractRawTag, extractTagValue, stripSoapEnvelope } from "../response_parsers/helpers.ts";
import { parseStatusResponse, type StatusResponse } from "../response_parsers/index.ts";

export type { StatusResponse };

/** Resultado de autorização CT-e. */
export interface CteAuthorizationResponse {
  statusCode: string;
  statusMessage: string;
  accessKey?: string;
  protocolNumber?: string;
  authorizedAt?: string;
  protocolXml?: string;
}

/** Resultado de consulta CT-e. */
export interface CteConsultaResponse {
  statusCode: string;
  statusMessage: string;
  accessKey?: string;
  protocolNumber?: string;
  protocolXml?: string;
  eventXmls: string[];
}

/** Parseia recepção síncrona CT-e. */
export function parseCteAuthorizationResponse(xml: string): CteAuthorizationResponse {
  const body = stripSoapEnvelope(xml);
  const protocolXml = extractRawTag(body, "protCTe");
  const scope = protocolXml ? (extractInnerContent(protocolXml, "infProt") ?? protocolXml) : body;
  const statusCode = extractTagValue(scope, "cStat") ?? extractTagValue(body, "cStat");
  if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in CT-e reception response");
  return {
    statusCode,
    statusMessage: extractTagValue(scope, "xMotivo") ?? extractTagValue(body, "xMotivo") ?? "",
    accessKey: protocolXml ? extractTagValue(scope, "chCTe") : undefined,
    protocolNumber: protocolXml ? extractTagValue(scope, "nProt") : undefined,
    authorizedAt: protocolXml ? extractTagValue(scope, "dhRecbto") : undefined,
    protocolXml,
  };
}

export const parse_cte_authorization_response = parseCteAuthorizationResponse;

/** Parseia consulta CT-e. */
export function parseCteConsultaResponse(xml: string): CteConsultaResponse {
  const body = stripSoapEnvelope(xml);
  const statusCode = extractTagValue(body, "cStat");
  if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in CT-e consulta response");
  const protocolXml = extractRawTag(body, "protCTe");
  const scope = protocolXml ? (extractInnerContent(protocolXml, "infProt") ?? protocolXml) : body;
  return {
    statusCode,
    statusMessage: extractTagValue(body, "xMotivo") ?? "",
    accessKey: extractTagValue(scope, "chCTe"),
    protocolNumber: protocolXml ? extractTagValue(scope, "nProt") : undefined,
    protocolXml,
    eventXmls: extractAllRawTags(body, "procEventoCTe"),
  };
}

export const parse_cte_consulta_response = parseCteConsultaResponse;

/** Parseia status CT-e. */
export function parseCteStatusResponse(xml: string): StatusResponse {
  try {
    return parseStatusResponse(xml);
  } catch {
    const body = stripSoapEnvelope(xml);
    const statusCode = extractTagValue(body, "cStat");
    if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in CT-e status response");
    return { statusCode, statusMessage: extractTagValue(body, "xMotivo") ?? "", averageTime: extractTagValue(body, "tMed") };
  }
}

export const parse_cte_status_response = parseCteStatusResponse;
