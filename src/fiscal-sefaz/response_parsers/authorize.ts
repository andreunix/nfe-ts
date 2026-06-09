import { FiscalError } from "../../fiscal-core/error.ts";
import { extractInnerContent, extractRawTag, extractTagValue, stripSoapEnvelope } from "./helpers.ts";
import type { AuthorizationResponse } from "./types.ts";

/** Parseia resposta de autorização NF-e (`retEnviNFe`). */
export function parseAutorizacaoResponse(xml: string): AuthorizationResponse {
  const body = stripSoapEnvelope(xml);
  const receiptNumber = extractTagValue(body, "nRec");
  const protocolXml = extractRawTag(body, "protNFe");

  if (protocolXml) {
    const scope = extractInnerContent(protocolXml, "infProt") ?? protocolXml;
    const statusCode = extractTagValue(scope, "cStat");
    if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in <protNFe>");
    return {
      statusCode,
      statusMessage: extractTagValue(scope, "xMotivo") ?? "",
      protocolNumber: extractTagValue(scope, "nProt"),
      protocolXml,
      authorizedAt: extractTagValue(scope, "dhRecbto"),
      receiptNumber,
    };
  }

  const statusCode = extractTagValue(body, "cStat");
  if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in authorization response");
  return {
    statusCode,
    statusMessage: extractTagValue(body, "xMotivo") ?? "Unknown",
    receiptNumber,
  };
}

export const parse_autorizacao_response = parseAutorizacaoResponse;
