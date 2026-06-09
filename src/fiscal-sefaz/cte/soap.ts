import { gzipSync } from "node:zlib";
import { SOAP_ENVELOPE_NS } from "../../fiscal-core/constants.ts";
import { CTE_NAMESPACE, type CteServiceMeta } from "./index.ts";

const envelopeOpen = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="${SOAP_ENVELOPE_NS}">`;

function ns(meta: CteServiceMeta): string {
  return `${CTE_NAMESPACE}/wsdl/${meta.operation}`;
}

/** Envelope SOAP CT-e usando `<cteDadosMsg>`. */
export function buildEnvelope(requestXml: string, meta: CteServiceMeta): string {
  return buildEnvelopeNamed(requestXml, meta, "cteDadosMsg");
}

/** Envelope SOAP CT-e com nome de corpo customizado, usado por GTV-e. */
export function buildEnvelopeNamed(requestXml: string, meta: CteServiceMeta, bodyElem: string): string {
  return `${envelopeOpen}<soap:Body><${bodyElem} xmlns="${ns(meta)}">${requestXml}</${bodyElem}></soap:Body></soap:Envelope>`;
}

/** Envelope CT-e com payload gzip+base64 dentro de `<cteDadosMsg>`. */
export function buildEnvelopeCompressed(requestXml: string, meta: CteServiceMeta): string {
  const b64 = gzipSync(Buffer.from(requestXml), { level: 9 }).toString("base64");
  return `${envelopeOpen}<soap:Body><cteDadosMsg xmlns="${ns(meta)}">${b64}</cteDadosMsg></soap:Body></soap:Envelope>`;
}

/** URI de action CT-e. */
export function buildAction(meta: CteServiceMeta): string {
  return `${CTE_NAMESPACE}/wsdl/${meta.operation}/${meta.method}`;
}

export const build_envelope = buildEnvelope;
export const build_envelope_named = buildEnvelopeNamed;
export const build_envelope_compressed = buildEnvelopeCompressed;
export const build_action = buildAction;

