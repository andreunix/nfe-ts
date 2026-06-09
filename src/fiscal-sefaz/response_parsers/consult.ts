import { FiscalError } from "../../fiscal-core/error.ts";
import { extractAllRawTags, extractInnerContent, extractRawTag, extractTagValue, stripSoapEnvelope } from "./helpers.ts";
import type { ConsultaReciboResponse, ConsultaSituacaoResponse, ProtocolInfo } from "./types.ts";

/** Parseia consulta de recibo NF-e (`retConsReciNFe`). */
export function parseConsultaReciboResponse(xml: string): ConsultaReciboResponse {
  const body = stripSoapEnvelope(xml);
  const cStat = extractTagValue(body, "cStat");
  if (!cStat) throw FiscalError.xmlParsing("missing <cStat> in consulta recibo response");

  const protocols: ProtocolInfo[] = [];
  for (const protXml of extractAllRawTags(body, "protNFe")) {
    const scope = extractInnerContent(protXml, "infProt") ?? protXml;
    const protCStat = extractTagValue(scope, "cStat");
    if (!protCStat) continue;
    protocols.push({
      tpAmb: extractTagValue(scope, "tpAmb") ?? "",
      verAplic: extractTagValue(scope, "verAplic") ?? "",
      chNfe: extractTagValue(scope, "chNFe") ?? "",
      dhRecbto: extractTagValue(scope, "dhRecbto"),
      nProt: extractTagValue(scope, "nProt"),
      digVal: extractTagValue(scope, "digVal"),
      cStat: protCStat,
      xMotivo: extractTagValue(scope, "xMotivo") ?? "",
    });
  }

  return {
    tpAmb: extractTagValue(body, "tpAmb") ?? "",
    verAplic: extractTagValue(body, "verAplic") ?? "",
    nRec: extractTagValue(body, "nRec") ?? "",
    cStat,
    xMotivo: extractTagValue(body, "xMotivo") ?? "",
    cUf: extractTagValue(body, "cUF") ?? "",
    protocols,
  };
}

export const parse_consulta_recibo_response = parseConsultaReciboResponse;

/** Parseia consulta situação NF-e (`retConsSitNFe`). */
export function parseConsultaSituacaoResponse(xml: string): ConsultaSituacaoResponse {
  const body = stripSoapEnvelope(xml);
  const cStat = extractTagValue(body, "cStat");
  if (!cStat) throw FiscalError.xmlParsing("missing <cStat> in consulta situação response");
  return {
    tpAmb: extractTagValue(body, "tpAmb") ?? "",
    verAplic: extractTagValue(body, "verAplic") ?? "",
    cStat,
    xMotivo: extractTagValue(body, "xMotivo") ?? "",
    cUf: extractTagValue(body, "cUF") ?? "",
    chNfe: extractTagValue(body, "chNFe"),
    protocolXml: extractRawTag(body, "protNFe"),
    eventXmls: extractAllRawTags(body, "retEvento"),
  };
}

export const parse_consulta_situacao_response = parseConsultaSituacaoResponse;
