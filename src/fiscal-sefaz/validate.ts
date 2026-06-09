import { XMLParser } from "fast-xml-parser";
import { FiscalError } from "../fiscal-core/error.ts";
import { extractTagValue } from "./response_parsers/helpers.ts";

const parser = new XMLParser({ ignoreAttributes: false });

/** Resultado de validação cruzando XML enviado e resposta autorizada. */
export interface ValidationResult {
  accessKey: string;
  protocolNumber: string;
  digestValue: string;
  statusCode: string;
  statusMessage: string;
  valid: boolean;
}

/** Verifica se o conteúdo é XML parseável. */
export function isValidXml(content: string): boolean {
  try {
    parser.parse(content);
    return true;
  } catch {
    return false;
  }
}

/** Validação sintática básica de XML NF-e. */
export function validateNfeXml(xml: string, _version = "4.00"): void {
  if (!isValidXml(xml)) throw FiscalError.xmlParsing("Invalid NF-e XML");
  if (!xml.includes("<NFe") && !xml.includes("<nfeProc")) throw FiscalError.validation("XML does not look like NF-e");
}

/** Extrai chave, digest e Id da NF-e. */
export function extractNfeValidationData(nfeXml: string): [string, string, string] {
  const id = /<infNFe\b[^>]*\bId="([^"]+)"/u.exec(nfeXml)?.[1];
  if (!id) throw FiscalError.xmlParsing("Missing Id attribute in <infNFe>");
  const accessKey = id.startsWith("NFe") ? id.slice(3) : id;
  const digest = extractTagValue(nfeXml, "DigestValue");
  if (!digest) throw FiscalError.xmlParsing("Missing <DigestValue>");
  return [accessKey, digest, id];
}

/** Confere dados principais entre requisição NF-e e resposta de autorização. */
export function validateAuthorizedNfe(requestXml: string, responseXml: string): ValidationResult {
  const [accessKey, digestValue] = extractNfeValidationData(requestXml);
  const responseKey = extractTagValue(responseXml, "chNFe");
  const statusCode = extractTagValue(responseXml, "cStat") ?? "";
  const statusMessage = extractTagValue(responseXml, "xMotivo") ?? "";
  const protocolNumber = extractTagValue(responseXml, "nProt") ?? "";
  return {
    accessKey,
    protocolNumber,
    digestValue,
    statusCode,
    statusMessage,
    valid: responseKey === accessKey && statusCode === "100" && protocolNumber.length > 0,
  };
}

/** Validação sintática básica de payload de requisição. */
export function validateRequestXml(xml: string, _version: string, method: string): void {
  if (!isValidXml(xml)) throw FiscalError.xmlParsing(`Invalid XML for ${method}`);
}

export const is_valid_xml = isValidXml;
export const validate_nfe_xml = validateNfeXml;
export const extract_nfe_validation_data = extractNfeValidationData;
export const validate_authorized_nfe = validateAuthorizedNfe;
export const validate_request_xml = validateRequestXml;

