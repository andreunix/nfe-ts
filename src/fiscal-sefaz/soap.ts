import { gzipSync } from "node:zlib";
import { NFE_WSDL_NS, SOAP_ENVELOPE_NS } from "../fiscal-core/constants.ts";
import { getStateCode } from "../fiscal-core/state_codes.ts";
import type { ServiceMeta } from "./services.ts";

const envelopeOpen = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="${SOAP_ENVELOPE_NS}">`;

/** Monta o namespace WSDL de uma operação SEFAZ. */
function wsdlNamespace(meta: ServiceMeta): string {
  return `${NFE_WSDL_NS}/${meta.operation}`;
}

/** Monta envelope SOAP 1.2 no formato usado pelo sped-nfe. */
export function buildEnvelope(requestXml: string, uf: string, meta: ServiceMeta): string {
  getStateCode(uf);
  const ns = wsdlNamespace(meta);
  return `${envelopeOpen}<soap:Body><nfeDadosMsg xmlns="${ns}">${requestXml}</nfeDadosMsg></soap:Body></soap:Envelope>`;
}

/** Monta envelope SOAP com `nfeCabecMsg`, usado por serviços legados como cadastro. */
export function buildEnvelopeWithHeader(requestXml: string, uf: string, meta: ServiceMeta): string {
  const cuf = getStateCode(uf);
  const ns = wsdlNamespace(meta);
  return `${envelopeOpen}<soap:Header><nfeCabecMsg xmlns="${ns}"><cUF>${cuf}</cUF><versaoDados>${meta.version}</versaoDados></nfeCabecMsg></soap:Header><soap:Body><nfeDadosMsg xmlns="${ns}">${requestXml}</nfeDadosMsg></soap:Body></soap:Envelope>`;
}

/** Monta envelope SOAP com corpo gzip+base64 em `nfeDadosMsgZip`. */
export function buildEnvelopeCompressed(requestXml: string, uf: string, meta: ServiceMeta): string {
  getStateCode(uf);
  const ns = wsdlNamespace(meta);
  const b64 = gzipSync(Buffer.from(requestXml), { level: 9 }).toString("base64");
  return `${envelopeOpen}<soap:Body><nfeDadosMsgZip xmlns="${ns}">${b64}</nfeDadosMsgZip></soap:Body></soap:Envelope>`;
}

/** Monta envelope SOAP especial do serviço nacional de distribuição DF-e. */
export function buildEnvelopeDistDfe(requestXml: string, uf: string, meta: ServiceMeta): string {
  getStateCode(uf);
  const ns = wsdlNamespace(meta);
  return `${envelopeOpen}<soap:Body><nfeDistDFeInteresse xmlns="${ns}"><nfeDadosMsg xmlns="${ns}">${requestXml}</nfeDadosMsg></nfeDistDFeInteresse></soap:Body></soap:Envelope>`;
}

/** Monta URI de action para o `Content-Type` SOAP 1.2. */
export function buildAction(meta: ServiceMeta): string {
  return `${NFE_WSDL_NS}/${meta.operation}/${meta.method}`;
}

export const build_envelope = buildEnvelope;
export const build_envelope_with_header = buildEnvelopeWithHeader;
export const build_envelope_compressed = buildEnvelopeCompressed;
export const build_envelope_dist_dfe = buildEnvelopeDistDfe;
export const build_action = buildAction;

