import { NFE_NAMESPACE, NFE_VERSION } from "../../fiscal-core/constants.ts";
import { FiscalError } from "../../fiscal-core/error.ts";
import { getStateCode } from "../../fiscal-core/state_codes.ts";
import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";
import { extractTagValue } from "../response_parsers/helpers.ts";
import { eventTypes } from "./event_core.ts";
import { buildEventXmlWithOrg, extractSection } from "./helpers.ts";

/** Dados extraídos da NF-e para montar evento EPEC. */
export interface EpecData {
  accessKey: string;
  cOrgaoAutor: string;
  verAplic: string;
  dhEmi: string;
  tpNf: string;
  emitIe: string;
  destUf: string;
  destIdTag: string;
  destIe?: string;
  vNf: string;
  vIcms: string;
  vSt: string;
  taxId: string;
}

function accessKeyFromInfNfe(xml: string, label: string): string {
  const header = /<infNFe\b[^>]*\bId="([^"]+)"/u.exec(xml)?.[1];
  if (!header) throw FiscalError.xmlParsing(`Missing Id attribute in <infNFe> in ${label} XML`);
  const key = header.startsWith("NFe") ? header.slice(3) : header;
  if (key.length !== 44) throw FiscalError.xmlParsing(`Invalid access key length: expected 44, got ${key.length}`);
  return key;
}

/** Extrai dados necessários para EPEC NF-e a partir do XML assinado. */
export function extractEpecData(nfeXml: string, verAplicOverride?: string): EpecData {
  const accessKey = accessKeyFromInfNfe(nfeXml, "NF-e");
  const emit = extractSection(nfeXml, "emit");
  const dest = extractSection(nfeXml, "dest");
  const total = extractSection(nfeXml, "total");
  if (!emit) throw FiscalError.xmlParsing("Missing <emit> section in NF-e XML");
  if (!dest) throw FiscalError.xmlParsing("Missing <dest> section in NF-e XML");
  if (!total) throw FiscalError.xmlParsing("Missing <total> section in NF-e XML");
  const emitIe = extractTagValue(emit, "IE");
  const taxId = extractTagValue(emit, "CNPJ") ?? extractTagValue(emit, "CPF");
  const destUf = extractTagValue(dest, "UF");
  const destIdTag = extractTagValue(dest, "CNPJ") ? `<CNPJ>${extractTagValue(dest, "CNPJ")}</CNPJ>` : extractTagValue(dest, "CPF") ? `<CPF>${extractTagValue(dest, "CPF")}</CPF>` : extractTagValue(dest, "idEstrangeiro") ? `<idEstrangeiro>${extractTagValue(dest, "idEstrangeiro")}</idEstrangeiro>` : undefined;
  const vNf = extractTagValue(total, "vNF");
  const vIcms = extractTagValue(total, "vICMS");
  const vSt = extractTagValue(total, "vST");
  const dhEmi = extractTagValue(nfeXml, "dhEmi");
  const tpNf = extractTagValue(nfeXml, "tpNF");
  if (!emitIe || !taxId || !destUf || !destIdTag || !vNf || !vIcms || !vSt || !dhEmi || !tpNf) throw FiscalError.xmlParsing("Missing required EPEC data in NF-e XML");
  return {
    accessKey,
    cOrgaoAutor: accessKey.slice(0, 2),
    verAplic: verAplicOverride && verAplicOverride.length > 0 ? verAplicOverride : (extractTagValue(nfeXml, "verProc") ?? ""),
    dhEmi,
    tpNf,
    emitIe,
    destUf,
    destIdTag,
    destIe: extractTagValue(dest, "IE") ?? undefined,
    vNf,
    vIcms,
    vSt,
    taxId,
  };
}

/** Monta evento EPEC NF-e enviado ao Ambiente Nacional. */
export function buildEpecRequest(epecData: EpecData, environment: SefazEnvironment): string {
  const destIe = epecData.destIe ? `<IE>${epecData.destIe}</IE>` : "";
  const additional = `<cOrgaoAutor>${epecData.cOrgaoAutor}</cOrgaoAutor><tpAutor>1</tpAutor><verAplic>${epecData.verAplic}</verAplic><dhEmi>${epecData.dhEmi}</dhEmi><tpNF>${epecData.tpNf}</tpNF><IE>${epecData.emitIe}</IE><dest><UF>${epecData.destUf}</UF>${epecData.destIdTag}${destIe}<vNF>${epecData.vNf}</vNF><vICMS>${epecData.vIcms}</vICMS><vST>${epecData.vSt}</vST></dest>`;
  return buildEventXmlWithOrg(epecData.accessKey, eventTypes.EPEC, 1, epecData.taxId, environment, additional, "91");
}

/** Consulta status do serviço EPEC NFC-e. */
export function buildEpecNfceStatusRequest(uf: string, environment: SefazEnvironment): string {
  const cuf = getStateCode(uf);
  return `<consStatServ xmlns="${NFE_NAMESPACE}" versao="${NFE_VERSION}"><tpAmb>${environment}</tpAmb><cUF>${cuf}</cUF><xServ>STATUS</xServ></consStatServ>`;
}

/** Dados extraídos da NFC-e para montar evento EPEC NFC-e. */
export interface EpecNfceData extends Omit<EpecData, "destUf" | "destIdTag" | "vSt"> {
  destUf?: string;
  destIdTag?: string;
}

/** Extrai dados necessários para EPEC NFC-e a partir do XML assinado. */
export function extractEpecNfceData(nfceXml: string, verAplicOverride?: string): EpecNfceData {
  const accessKey = accessKeyFromInfNfe(nfceXml, "NFC-e");
  const emit = extractSection(nfceXml, "emit");
  const dest = extractSection(nfceXml, "dest");
  const total = extractSection(nfceXml, "total");
  if (!emit) throw FiscalError.xmlParsing("Missing <emit> section in NFC-e XML");
  if (!total) throw FiscalError.xmlParsing("Missing <total> section in NFC-e XML");
  const emitIe = extractTagValue(emit, "IE");
  const taxId = extractTagValue(emit, "CNPJ") ?? extractTagValue(emit, "CPF");
  const vNf = extractTagValue(total, "vNF");
  const vIcms = extractTagValue(total, "vICMS");
  const dhEmi = extractTagValue(nfceXml, "dhEmi");
  const tpNf = extractTagValue(nfceXml, "tpNF");
  if (!emitIe || !taxId || !vNf || !vIcms || !dhEmi || !tpNf) throw FiscalError.xmlParsing("Missing required EPEC NFC-e data in XML");
  const destIdTag = dest
    ? extractTagValue(dest, "CNPJ") ? `<CNPJ>${extractTagValue(dest, "CNPJ")}</CNPJ>` : extractTagValue(dest, "CPF") ? `<CPF>${extractTagValue(dest, "CPF")}</CPF>` : extractTagValue(dest, "idEstrangeiro") ? `<idEstrangeiro>${extractTagValue(dest, "idEstrangeiro")}</idEstrangeiro>` : undefined
    : undefined;
  return {
    accessKey,
    cOrgaoAutor: accessKey.slice(0, 2),
    verAplic: verAplicOverride && verAplicOverride.length > 0 ? verAplicOverride : (extractTagValue(nfceXml, "verProc") ?? ""),
    dhEmi,
    tpNf,
    emitIe,
    destUf: dest ? extractTagValue(dest, "UF") ?? undefined : undefined,
    destIdTag,
    destIe: dest ? extractTagValue(dest, "IE") ?? undefined : undefined,
    vNf,
    vIcms,
    taxId,
  };
}

/** Monta evento EPEC específico para NFC-e. */
export function buildEpecNfceRequest(epecData: EpecNfceData, environment: SefazEnvironment): string {
  const dest = epecData.destIdTag ? `<dest><UF>${epecData.destUf ?? epecData.cOrgaoAutor}</UF>${epecData.destIdTag}${epecData.destIe ? `<IE>${epecData.destIe}</IE>` : ""}</dest>` : "";
  const additional = `<cOrgaoAutor>${epecData.cOrgaoAutor}</cOrgaoAutor><tpAutor>1</tpAutor><verAplic>${epecData.verAplic}</verAplic><dhEmi>${epecData.dhEmi}</dhEmi><tpNF>${epecData.tpNf}</tpNF><IE>${epecData.emitIe}</IE>${dest}<vNF>${epecData.vNf}</vNF><vICMS>${epecData.vIcms}</vICMS>`;
  return buildEventXmlWithOrg(epecData.accessKey, eventTypes.EPEC, 1, epecData.taxId, environment, additional, epecData.cOrgaoAutor);
}

export const extract_epec_data = extractEpecData;
export const build_epec_request = buildEpecRequest;
export const build_epec_nfce_status_request = buildEpecNfceStatusRequest;
export const extract_epec_nfce_data = extractEpecNfceData;
export const build_epec_nfce_request = buildEpecNfceRequest;

