import { FiscalError } from "../../fiscal-core/error.ts";
import { extractAllRawTags, extractInnerContent, extractRawTag, extractTagValue, stripSoapEnvelope } from "../response_parsers/helpers.ts";
import { parseStatusResponse, type StatusResponse } from "../response_parsers/index.ts";

export type { StatusResponse };

/** Resultado de autorização MDF-e. */
export interface MdfeAuthorizationResponse {
  statusCode: string;
  statusMessage: string;
  accessKey?: string;
  protocolNumber?: string;
  authorizedAt?: string;
  protocolXml?: string;
}

/** Resultado de consulta MDF-e. */
export interface MdfeConsultaResponse {
  statusCode: string;
  statusMessage: string;
  accessKey?: string;
  protocolNumber?: string;
  protocolXml?: string;
  eventXmls: string[];
}

/** Parseia status MDF-e. */
export function parseMdfeStatusResponse(xml: string): StatusResponse {
  return parseStatusResponse(xml);
}

export const parse_mdfe_status_response = parseMdfeStatusResponse;

/** Parseia recepção MDF-e. */
export function parseMdfeAuthorizationResponse(xml: string): MdfeAuthorizationResponse {
  const body = stripSoapEnvelope(xml);
  const protocolXml = extractRawTag(body, "protMDFe");
  const scope = protocolXml ? (extractInnerContent(protocolXml, "infProt") ?? protocolXml) : body;
  const statusCode = extractTagValue(scope, "cStat") ?? extractTagValue(body, "cStat");
  if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in MDF-e reception response");
  return {
    statusCode,
    statusMessage: extractTagValue(scope, "xMotivo") ?? extractTagValue(body, "xMotivo") ?? "",
    accessKey: protocolXml ? extractTagValue(scope, "chMDFe") : undefined,
    protocolNumber: protocolXml ? extractTagValue(scope, "nProt") : undefined,
    authorizedAt: protocolXml ? extractTagValue(scope, "dhRecbto") : undefined,
    protocolXml,
  };
}

export const parse_mdfe_authorization_response = parseMdfeAuthorizationResponse;

/** Parseia consulta MDF-e. */
export function parseMdfeConsultaResponse(xml: string): MdfeConsultaResponse {
  const body = stripSoapEnvelope(xml);
  const statusCode = extractTagValue(body, "cStat");
  if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in MDF-e consulta response");
  const protocolXml = extractRawTag(body, "protMDFe");
  const scope = protocolXml ? (extractInnerContent(protocolXml, "infProt") ?? protocolXml) : body;
  return {
    statusCode,
    statusMessage: extractTagValue(body, "xMotivo") ?? "",
    accessKey: extractTagValue(scope, "chMDFe"),
    protocolNumber: protocolXml ? extractTagValue(scope, "nProt") : undefined,
    protocolXml,
    eventXmls: extractAllRawTags(body, "procEventoMDFe"),
  };
}

export const parse_mdfe_consulta_response = parseMdfeConsultaResponse;
