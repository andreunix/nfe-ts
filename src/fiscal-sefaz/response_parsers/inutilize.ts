import { FiscalError } from "../../fiscal-core/error.ts";
import { extractInnerContent, extractTagValue, stripSoapEnvelope } from "./helpers.ts";
import type { InutilizacaoResponse } from "./types.ts";

/** Parseia resposta de inutilização NF-e. */
export function parseInutilizacaoResponse(xml: string): InutilizacaoResponse {
  const body = stripSoapEnvelope(xml);
  const scope = extractInnerContent(body, "infInut") ?? body;
  const cStat = extractTagValue(scope, "cStat");
  if (!cStat) throw FiscalError.xmlParsing("missing <cStat> in inutilização response");
  return {
    tpAmb: extractTagValue(scope, "tpAmb") ?? "",
    verAplic: extractTagValue(scope, "verAplic") ?? "",
    cStat,
    xMotivo: extractTagValue(scope, "xMotivo") ?? "Unknown",
    cUf: extractTagValue(scope, "cUF") ?? "",
    ano: extractTagValue(scope, "ano") ?? "",
    cnpj: extractTagValue(scope, "CNPJ") ?? "",
    cpf: extractTagValue(scope, "CPF"),
    modelo: extractTagValue(scope, "mod") ?? "",
    serie: extractTagValue(scope, "serie") ?? "",
    nNfIni: extractTagValue(scope, "nNFIni") ?? "",
    nNfFin: extractTagValue(scope, "nNFFin") ?? "",
    dhRecbto: extractTagValue(scope, "dhRecbto"),
    nProt: extractTagValue(scope, "nProt"),
  };
}

export const parse_inutilizacao_response = parseInutilizacaoResponse;
