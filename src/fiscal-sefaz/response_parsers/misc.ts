import { FiscalError } from "../../fiscal-core/error.ts";
import { extractAllTagValues, extractInnerContent, extractTagValue, stripSoapEnvelope } from "./helpers.ts";
import type { CadastroResponse, CscResponse, DistDFeResponse } from "./types.ts";

/** Parseia resposta de distribuição DF-e. */
export function parseDistDfeResponse(xml: string): DistDFeResponse {
  const body = stripSoapEnvelope(xml);
  const statusCode = extractTagValue(body, "cStat");
  if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in DistDFe response");
  return {
    statusCode,
    statusMessage: extractTagValue(body, "xMotivo") ?? "Unknown",
    ultNsu: extractTagValue(body, "ultNSU"),
    maxNsu: extractTagValue(body, "maxNSU"),
    rawXml: body,
  };
}

export const parse_dist_dfe_response = parseDistDfeResponse;

/** Parseia resposta de cadastro (`retConsCad`). */
export function parseCadastroResponse(xml: string): CadastroResponse {
  const body = stripSoapEnvelope(xml);
  const scope = extractInnerContent(body, "infCons") ?? body;
  const statusCode = extractTagValue(scope, "cStat");
  if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in Cadastro response");
  const cad = extractInnerContent(scope, "infCad") ?? scope;
  return {
    statusCode,
    statusMessage: extractTagValue(scope, "xMotivo") ?? "Unknown",
    ie: extractTagValue(cad, "IE"),
    situacao: extractTagValue(cad, "cSit"),
    nome: extractTagValue(cad, "xNome"),
    rawXml: body,
  };
}

export const parse_cadastro_response = parseCadastroResponse;

/** Parseia resposta de administração CSC NFC-e. */
export function parseCscResponse(xml: string): CscResponse {
  const body = stripSoapEnvelope(xml);
  const scope = extractInnerContent(body, "retInfCsc") ?? body;
  const cStat = extractTagValue(scope, "cStat");
  if (!cStat) throw FiscalError.xmlParsing("missing <cStat> in CSC response");
  const ids = extractAllTagValues(scope, "idCsc");
  const cscs = extractAllTagValues(scope, "CSC");
  return {
    tpAmb: extractTagValue(scope, "tpAmb") ?? "",
    indOp: extractTagValue(scope, "indOp") ?? "",
    cStat,
    xMotivo: extractTagValue(scope, "xMotivo") ?? "",
    tokens: ids.map((idCsc, index) => ({ idCsc, csc: cscs[index] ?? "" })),
  };
}

export const parse_csc_response = parseCscResponse;
