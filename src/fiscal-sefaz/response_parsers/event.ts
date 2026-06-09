import { FiscalError } from "../../fiscal-core/error.ts";
import { extractInnerContent, extractTagValue, stripSoapEnvelope } from "./helpers.ts";
import type { CancellationResponse } from "./types.ts";

/** Parseia resposta de evento de cancelamento NF-e. */
export function parseCancellationResponse(xml: string): CancellationResponse {
  const body = stripSoapEnvelope(xml);
  const scope = extractInnerContent(body, "infEvento") ?? body;
  const statusCode = extractTagValue(scope, "cStat");
  if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in cancellation response");
  return {
    statusCode,
    statusMessage: extractTagValue(scope, "xMotivo") ?? "Unknown",
    protocolNumber: extractTagValue(scope, "nProt"),
    signedEventXml: "",
    rawResponse: "",
  };
}

export const parse_cancellation_response = parseCancellationResponse;
