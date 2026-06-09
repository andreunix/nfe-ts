import { createHash, createSign, createVerify } from "node:crypto";
import { FiscalError } from "../../fiscal-core/error.ts";
import { canonicalizeXml, ensureInheritedNamespace, extractElement, extractElementId, removeSignatureElement } from "./c14n.ts";
import { SignatureAlgorithm } from "./pfx.ts";

/** Assina uma NF-e usando RSA-SHA1 enveloped XML-DSig. */
export function signXml(xml: string, privateKey: string, certificate: string): string {
  return signXmlWithAlgorithm(xml, privateKey, certificate, SignatureAlgorithm.Sha1);
}

export const sign_xml = signXml;

/** Assina uma NF-e com algoritmo selecionável entre SHA-1 e SHA-256. */
export function signXmlWithAlgorithm(xml: string, privateKey: string, certificate: string, algorithm: SignatureAlgorithm): string {
  return signXmlGeneric(xml, privateKey, certificate, "infNFe", "NFe", algorithm);
}

export const sign_xml_with_algorithm = signXmlWithAlgorithm;

/** Assina evento NF-e dentro de `<evento>`. */
export function signEventXml(xml: string, privateKey: string, certificate: string): string {
  return signEventXmlWithAlgorithm(xml, privateKey, certificate, SignatureAlgorithm.Sha1);
}

export const sign_event_xml = signEventXml;

/** Assina evento NF-e com algoritmo selecionável. */
export function signEventXmlWithAlgorithm(xml: string, privateKey: string, certificate: string, algorithm: SignatureAlgorithm): string {
  return signXmlGeneric(xml, privateKey, certificate, "infEvento", "evento", algorithm);
}

export const sign_event_xml_with_algorithm = signEventXmlWithAlgorithm;

/** Assina XML de inutilização NF-e. */
export function signInutilizacaoXml(xml: string, privateKey: string, certificate: string): string {
  return signInutilizacaoXmlWithAlgorithm(xml, privateKey, certificate, SignatureAlgorithm.Sha1);
}

export const sign_inutilizacao_xml = signInutilizacaoXml;

/** Assina XML de inutilização NF-e com algoritmo selecionável. */
export function signInutilizacaoXmlWithAlgorithm(xml: string, privateKey: string, certificate: string, algorithm: SignatureAlgorithm): string {
  return signXmlGeneric(xml, privateKey, certificate, "infInut", "inutNFe", algorithm);
}

export const sign_inutilizacao_xml_with_algorithm = signInutilizacaoXmlWithAlgorithm;

export const signMdfeXml = (xml: string, privateKey: string, certificate: string): string =>
  signMdfeXmlWithAlgorithm(xml, privateKey, certificate, SignatureAlgorithm.Sha1);
export const sign_mdfe_xml = signMdfeXml;
export const signMdfeXmlWithAlgorithm = (xml: string, privateKey: string, certificate: string, algorithm: SignatureAlgorithm): string =>
  signXmlGeneric(xml, privateKey, certificate, "infMDFe", "MDFe", algorithm);
export const sign_mdfe_xml_with_algorithm = signMdfeXmlWithAlgorithm;

export const signCteXml = (xml: string, privateKey: string, certificate: string): string =>
  signCteXmlWithAlgorithm(xml, privateKey, certificate, SignatureAlgorithm.Sha1);
export const sign_cte_xml = signCteXml;
export const signCteXmlWithAlgorithm = (xml: string, privateKey: string, certificate: string, algorithm: SignatureAlgorithm): string =>
  signXmlGeneric(xml, privateKey, certificate, "infCte", "CTe", algorithm);
export const sign_cte_xml_with_algorithm = signCteXmlWithAlgorithm;

export const signCteosXml = (xml: string, privateKey: string, certificate: string): string =>
  signCteosXmlWithAlgorithm(xml, privateKey, certificate, SignatureAlgorithm.Sha1);
export const sign_cteos_xml = signCteosXml;
export const signCteosXmlWithAlgorithm = (xml: string, privateKey: string, certificate: string, algorithm: SignatureAlgorithm): string =>
  signXmlGeneric(xml, privateKey, certificate, "infCte", "CTeOS", algorithm);
export const sign_cteos_xml_with_algorithm = signCteosXmlWithAlgorithm;

export const signGtveXml = (xml: string, privateKey: string, certificate: string): string =>
  signGtveXmlWithAlgorithm(xml, privateKey, certificate, SignatureAlgorithm.Sha1);
export const sign_gtve_xml = signGtveXml;
export const signGtveXmlWithAlgorithm = (xml: string, privateKey: string, certificate: string, algorithm: SignatureAlgorithm): string =>
  signXmlGeneric(xml, privateKey, certificate, "infCte", "GTVe", algorithm);
export const sign_gtve_xml_with_algorithm = signGtveXmlWithAlgorithm;

export const signBpeXml = (xml: string, privateKey: string, certificate: string): string =>
  signBpeXmlWithAlgorithm(xml, privateKey, certificate, SignatureAlgorithm.Sha1);
export const sign_bpe_xml = signBpeXml;
export const signBpeXmlWithAlgorithm = (xml: string, privateKey: string, certificate: string, algorithm: SignatureAlgorithm): string =>
  signXmlGeneric(xml, privateKey, certificate, "infBPe", "BPe", algorithm);
export const sign_bpe_xml_with_algorithm = signBpeXmlWithAlgorithm;

export const signDpsXml = (xml: string, privateKey: string, certificate: string): string =>
  signDpsXmlWithAlgorithm(xml, privateKey, certificate, SignatureAlgorithm.Sha1);
export const sign_dps_xml = signDpsXml;
export const signDpsXmlWithAlgorithm = (xml: string, privateKey: string, certificate: string, algorithm: SignatureAlgorithm): string =>
  signXmlGeneric(xml, privateKey, certificate, "infDPS", "DPS", algorithm);
export const sign_dps_xml_with_algorithm = signDpsXmlWithAlgorithm;

/** Assina evento NFS-e Nacional (`pedRegEvento`) sobre `<infPedReg>`. */
export const signNfseEventoXml = (xml: string, privateKey: string, certificate: string): string =>
  signXmlGeneric(xml, privateKey, certificate, "infPedReg", "pedRegEvento", SignatureAlgorithm.Sha1);
export const sign_nfse_evento_xml = signNfseEventoXml;

/** Assina lote RPS São Paulo sobre o documento inteiro com Reference URI vazia. */
export function signSpLoteXml(xml: string, rootTag: string, privateKeyPem: string, certificatePem: string): string {
  const withoutSig = removeSignatureElement(xml);
  const canonical = canonicalizeXml(withoutSig);
  const digest = computeDigest(new TextEncoder().encode(canonical), SignatureAlgorithm.Sha1);
  const signedInfo = buildSignedInfoRef("", digest, SignatureAlgorithm.Sha1);
  const canonicalSignedInfo = signedInfo.replace("<SignedInfo>", "<SignedInfo xmlns=\"http://www.w3.org/2000/09/xmldsig#\">");
  const signatureValue = rsaSignBase64(canonicalSignedInfo, privateKeyPem, SignatureAlgorithm.Sha1);
  const signatureXml = buildSignatureElement(signedInfo, signatureValue, extractCertBase64(certificatePem));
  const closing = `</${rootTag}>`;
  const pos = xml.lastIndexOf(closing);
  if (pos < 0) throw FiscalError.certificate(`<${rootTag}> closing não encontrado`);
  return `${xml.slice(0, pos)}${signatureXml}${xml.slice(pos)}`;
}

export const sign_sp_lote_xml = signSpLoteXml;

/** Verifica uma assinatura RSA-SHA1 em Base64 usando certificado ou chave pública PEM. */
export function rsaSha1Verify(data: Uint8Array | string, signatureB64: string, certificatePem: string): boolean {
  try {
    const verifier = createVerify("RSA-SHA1");
    verifier.update(data);
    verifier.end();
    return verifier.verify(certificatePem, signatureB64, "base64");
  } catch (error) {
    throw FiscalError.certificate(`RSA-SHA1 verify failed: ${String(error)}`);
  }
}

export const rsa_sha1_verify = rsaSha1Verify;

/** Assina bytes crus com RSA-SHA1 e devolve Base64. */
export function rsaSha1Base64(data: Uint8Array | string, privateKeyPem: string): string {
  return rsaSignBase64(data, privateKeyPem, SignatureAlgorithm.Sha1);
}

export const rsa_sha1_base64 = rsaSha1Base64;

/** Assina ABRASF sobre `<InfDeclaracaoPrestacaoServico>` dentro de `<Rps>`. */
export const signAbrasfXml = (xml: string, privateKey: string, certificate: string): string =>
  signXmlGeneric(xml, privateKey, certificate, "InfDeclaracaoPrestacaoServico", "Rps", SignatureAlgorithm.Sha1);
export const sign_abrasf_xml = signAbrasfXml;

export const signMdfeEventXml = (xml: string, privateKey: string, certificate: string): string =>
  signMdfeEventXmlWithAlgorithm(xml, privateKey, certificate, SignatureAlgorithm.Sha1);
export const sign_mdfe_event_xml = signMdfeEventXml;
export const signMdfeEventXmlWithAlgorithm = (xml: string, privateKey: string, certificate: string, algorithm: SignatureAlgorithm): string =>
  signXmlGeneric(xml, privateKey, certificate, "infEvento", "eventoMDFe", algorithm);
export const sign_mdfe_event_xml_with_algorithm = signMdfeEventXmlWithAlgorithm;

export const signCteEventXml = (xml: string, privateKey: string, certificate: string): string =>
  signCteEventXmlWithAlgorithm(xml, privateKey, certificate, SignatureAlgorithm.Sha1);
export const sign_cte_event_xml = signCteEventXml;
export const signCteEventXmlWithAlgorithm = (xml: string, privateKey: string, certificate: string, algorithm: SignatureAlgorithm): string =>
  signXmlGeneric(xml, privateKey, certificate, "infEvento", "eventoCTe", algorithm);
export const sign_cte_event_xml_with_algorithm = signCteEventXmlWithAlgorithm;

/** Assinatura XML-DSig genérica usada pelos documentos fiscais. */
function signXmlGeneric(xml: string, privateKeyPem: string, certificatePem: string, signedTag: string, parentTag: string, algorithm: SignatureAlgorithm): string {
  const id = extractElementId(xml, signedTag);
  const signedElement = extractElement(xml, signedTag);
  if (!signedElement) throw FiscalError.certificate(`<${signedTag}> element not found in XML`);

  const withoutSig = removeSignatureElement(signedElement);
  const withInheritedNs = ensureInheritedNamespace(withoutSig, xml, signedTag);
  const canonical = canonicalizeXml(withInheritedNs);
  const digest = computeDigest(new TextEncoder().encode(canonical), algorithm);
  const signedInfo = buildSignedInfo(id, digest, algorithm);
  const canonicalSignedInfo = signedInfo.replace("<SignedInfo>", "<SignedInfo xmlns=\"http://www.w3.org/2000/09/xmldsig#\">");
  const signatureValue = rsaSignBase64(canonicalSignedInfo, privateKeyPem, algorithm);
  const signatureXml = buildSignatureElement(signedInfo, signatureValue, extractCertBase64(certificatePem));
  const closing = `</${parentTag}>`;
  const pos = xml.lastIndexOf(closing);
  if (pos < 0) throw FiscalError.certificate(`<${parentTag}> closing tag not found in XML`);
  return `${xml.slice(0, pos)}${signatureXml}${xml.slice(pos)}`;
}

/** Calcula digest Base64 com SHA-1 ou SHA-256. */
export function computeDigest(data: Uint8Array, algorithm: SignatureAlgorithm): string {
  const hash = createHash(algorithm === SignatureAlgorithm.Sha256 ? "sha256" : "sha1");
  hash.update(data);
  return hash.digest("base64");
}

export const compute_digest = computeDigest;

function buildSignedInfo(referenceId: string, digestValue: string, algorithm: SignatureAlgorithm): string {
  return buildSignedInfoRef(`#${referenceId}`, digestValue, algorithm);
}

function buildSignedInfoRef(referenceUri: string, digestValue: string, algorithm: SignatureAlgorithm): string {
  const signatureMethodUri = algorithm === SignatureAlgorithm.Sha256
    ? "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"
    : "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
  const digestMethodUri = algorithm === SignatureAlgorithm.Sha256
    ? "http://www.w3.org/2001/04/xmlenc#sha256"
    : "http://www.w3.org/2000/09/xmldsig#sha1";

  return `<SignedInfo><CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></CanonicalizationMethod><SignatureMethod Algorithm="${signatureMethodUri}"></SignatureMethod><Reference URI="${referenceUri}"><Transforms><Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"></Transform><Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></Transform></Transforms><DigestMethod Algorithm="${digestMethodUri}"></DigestMethod><DigestValue>${digestValue}</DigestValue></Reference></SignedInfo>`;
}

function buildSignatureElement(signedInfo: string, signatureValue: string, certBase64: string): string {
  return `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">${signedInfo}<SignatureValue>${signatureValue}</SignatureValue><KeyInfo><X509Data><X509Certificate>${certBase64}</X509Certificate></X509Data></KeyInfo></Signature>`;
}

/** Remove cabeçalho/rodapé PEM e espaços do certificado. */
export function extractCertBase64(certPem: string): string {
  return certPem
    .replace("-----BEGIN CERTIFICATE-----", "")
    .replace("-----END CERTIFICATE-----", "")
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s+/g, "");
}

export const extract_cert_base64 = extractCertBase64;

function rsaSignBase64(data: Uint8Array | string, privateKeyPem: string, algorithm: SignatureAlgorithm): string {
  try {
    const signer = createSign(algorithm === SignatureAlgorithm.Sha256 ? "RSA-SHA256" : "RSA-SHA1");
    signer.update(data);
    signer.end();
    return signer.sign(privateKeyPem, "base64");
  } catch (error) {
    throw FiscalError.certificate(`RSA signing failed: ${String(error)}`);
  }
}
