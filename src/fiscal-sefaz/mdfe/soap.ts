import { gzipSync } from "node:zlib";
import { SOAP_ENVELOPE_NS } from "../../fiscal-core/constants.ts";
import { MDFE_NAMESPACE, type MdfeServiceMeta } from "./index.ts";

const envelopeOpen = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="${SOAP_ENVELOPE_NS}">`;

function ns(meta: MdfeServiceMeta): string {
  return `${MDFE_NAMESPACE}/wsdl/${meta.operation}`;
}

/** Envelope SOAP MDF-e usando `<mdfeDadosMsg>`. */
export function buildEnvelope(requestXml: string, meta: MdfeServiceMeta): string {
  return `${envelopeOpen}<soap:Body><mdfeDadosMsg xmlns="${ns(meta)}">${requestXml}</mdfeDadosMsg></soap:Body></soap:Envelope>`;
}

/** Envelope MDF-e com payload gzip+base64 ainda dentro de `<mdfeDadosMsg>`. */
export function buildEnvelopeCompressed(requestXml: string, meta: MdfeServiceMeta): string {
  const b64 = gzipSync(Buffer.from(requestXml), { level: 9 }).toString("base64");
  return `${envelopeOpen}<soap:Body><mdfeDadosMsg xmlns="${ns(meta)}">${b64}</mdfeDadosMsg></soap:Body></soap:Envelope>`;
}

/** URI de action MDF-e. */
export function buildAction(meta: MdfeServiceMeta): string {
  return `${MDFE_NAMESPACE}/wsdl/${meta.operation}/${meta.method}`;
}

export const build_envelope = buildEnvelope;
export const build_envelope_compressed = buildEnvelopeCompressed;
export const build_action = buildAction;

