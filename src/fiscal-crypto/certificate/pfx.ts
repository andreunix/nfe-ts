import { X509Certificate } from "node:crypto";
import forge from "node-forge";
import { FiscalError } from "../../fiscal-core/error.ts";
import type { CertificateData, CertificateInfo } from "../../fiscal-core/types/index.ts";

/** Algoritmo de hash usado no digest XML-DSig e na assinatura RSA. */
export enum SignatureAlgorithm {
  /** RSA-SHA1 legado, mantido por compatibilidade fiscal. */
  Sha1 = "Sha1",
  /** RSA-SHA256 exigido por certificados ICP-Brasil v5 em alguns cenários. */
  Sha256 = "Sha256",
}

/**
 * Garante que um PFX seja legível no runtime TypeScript.
 *
 * No Rust isso usa OpenSSL para reexportar PFX legado RC2. O runtime
 * TypeScript não expõe reexportação PKCS#12 equivalente, mas `node-forge`
 * consegue validar e ler o PFX. Se a leitura funcionar, os bytes originais são
 * retornados para preservar o contrato.
 */
export function ensureModernPfx(pfxBuffer: Uint8Array, passphrase: string): Uint8Array {
  parsePkcs12(pfxBuffer, passphrase);
  return new Uint8Array(pfxBuffer);
}

export const ensure_modern_pfx = ensureModernPfx;

/**
 * Carrega certificado de um PFX/PKCS#12.
 *
 * Extrai a chave privada e o certificado em PEM. O objeto também mantém o PFX
 * original e a senha para clientes HTTP que precisem do material bruto.
 */
export function loadCertificate(pfxBuffer: Uint8Array, passphrase: string): CertificateData {
  const parsed = parsePkcs12(pfxBuffer, passphrase);
  const privateKey = findPrivateKey(parsed);
  const certificate = findCertificate(parsed);

  if (!privateKey) throw FiscalError.certificate("PFX does not contain a private key");
  if (!certificate) throw FiscalError.certificate("PFX does not contain a certificate");

  const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
  const certificatePem = forge.pki.certificateToPem(certificate);

  return {
    private_key: privateKeyPem,
    privateKey: privateKeyPem,
    certificate: certificatePem,
    cert: certificatePem,
    pfx: new Uint8Array(pfxBuffer),
    password: passphrase,
  };
}

export const load_certificate = loadCertificate;

/**
 * Extrai metadados de um PFX/PKCS#12 ou de um certificado PEM/DER.
 */
export function getCertificateInfo(certificateBuffer: Uint8Array | string, passphrase = ""): CertificateInfo {
  try {
    const cert = typeof certificateBuffer === "string" && certificateBuffer.includes("BEGIN CERTIFICATE")
      ? new X509Certificate(certificateBuffer)
      : certificateFromBuffer(certificateBuffer, passphrase);
    return certificateInfo(cert);
  } catch (error) {
    throw FiscalError.certificate(`Failed to read certificate info: ${String(error)}`);
  }
}

export const get_certificate_info = getCertificateInfo;

function parsePkcs12(pfxBuffer: Uint8Array, passphrase: string): forge.pkcs12.Pkcs12Pfx {
  try {
    const der = forge.util.createBuffer(uint8ToBinary(pfxBuffer));
    const asn1 = forge.asn1.fromDer(der);
    return forge.pkcs12.pkcs12FromAsn1(asn1, false, passphrase);
  } catch (error) {
    throw FiscalError.certificate(`Failed to parse PFX (wrong password?): ${String(error)}`);
  }
}

function findPrivateKey(p12: forge.pkcs12.Pkcs12Pfx): forge.pki.PrivateKey | undefined {
  const shroudedKeyBag = forge.pki.oids.pkcs8ShroudedKeyBag as string;
  const keyBag = forge.pki.oids.keyBag as string;
  const bags = [
    ...((p12.getBags({ bagType: shroudedKeyBag })[shroudedKeyBag] ?? []) as forge.pkcs12.Bag[]),
    ...((p12.getBags({ bagType: keyBag })[keyBag] ?? []) as forge.pkcs12.Bag[]),
  ];
  return bags.find((bag) => bag.key)?.key;
}

function findCertificate(p12: forge.pkcs12.Pkcs12Pfx): forge.pki.Certificate | undefined {
  const certBag = forge.pki.oids.certBag as string;
  const bags = (p12.getBags({ bagType: certBag })[certBag] ?? []) as forge.pkcs12.Bag[];
  return bags.find((bag) => bag.cert)?.cert;
}

function certificateFromBuffer(buffer: Uint8Array | string, passphrase: string): X509Certificate {
  if (typeof buffer === "string") return new X509Certificate(buffer);

  try {
    const p12 = parsePkcs12(buffer, passphrase);
    const cert = findCertificate(p12);
    if (!cert) throw FiscalError.certificate("PFX does not contain a certificate");
    return new X509Certificate(forge.pki.certificateToPem(cert));
  } catch {
    return new X509Certificate(buffer);
  }
}

function certificateInfo(cert: X509Certificate): CertificateInfo {
  return {
    common_name: cert.subject.match(/CN=([^,\n]+)/)?.[1] ?? cert.subject,
    valid_from: cert.validFrom,
    valid_until: cert.validTo,
    serial_number: cert.serialNumber,
    issuer: cert.issuer.match(/CN=([^,\n]+)/)?.[1] ?? cert.issuer,
    subject: cert.subject,
  };
}

function uint8ToBinary(input: Uint8Array): string {
  let out = "";
  for (const byte of input) out += String.fromCharCode(byte);
  return out;
}
