import { FiscalError } from "../../fiscal-core/error.ts";
import { extractTagValue, stripSoapEnvelope } from "./helpers.ts";
import type { StatusResponse } from "./types.ts";

/** Parseia status de serviço SEFAZ. */
export function parseStatusResponse(xml: string): StatusResponse {
  const body = stripSoapEnvelope(xml);
  const statusCode = extractTagValue(body, "cStat");
  if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in status response");
  return {
    statusCode,
    statusMessage: extractTagValue(body, "xMotivo") ?? "Unknown",
    averageTime: extractTagValue(body, "tMed"),
  };
}

export const parse_status_response = parseStatusResponse;
