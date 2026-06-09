import { describe, expect, test } from "bun:test";
import { generateKeyPairSync } from "node:crypto";
import forge from "node-forge";
import {
  SignatureAlgorithm,
  canonicalizeXml,
  ensureModernPfx,
  extractElementId,
  getCertificateInfo,
  loadCertificate,
  rsaSha1Base64,
  rsaSha1Verify,
  signEventXml,
  signXml,
  signXmlWithAlgorithm,
} from "../../src/fiscal-crypto/index.ts";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();

function createTestPfx(password: string): Uint8Array {
  const keys = forge.pki.rsa.generateKeyPair(1024);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date("2024-01-01T00:00:00Z");
  cert.validity.notAfter = new Date("2030-01-01T00:00:00Z");
  const attrs = [{ name: "commonName", value: "Fiscal JS Test" }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], password, { algorithm: "3des" });
  const der = forge.asn1.toDer(asn1).getBytes();
  return Uint8Array.from(der, (char) => char.charCodeAt(0));
}

describe("fiscal-crypto", () => {
  test("canonicaliza XML e extrai Id do elemento assinado", () => {
    const xml = "<?xml version=\"1.0\"?><infNFe b=\"2\" Id=\"NFe1\" a=\"1\"/>";

    expect(extractElementId(xml, "infNFe")).toBe("NFe1");
    expect(canonicalizeXml(xml)).toBe("<infNFe Id=\"NFe1\" a=\"1\" b=\"2\"></infNFe>");
  });

  test("assina e verifica bytes com RSA-SHA1", () => {
    const signature = rsaSha1Base64("dados", privateKeyPem);

    expect(signature.length).toBeGreaterThan(100);
    expect(rsaSha1Verify("dados", signature, publicKeyPem)).toBe(true);
    expect(rsaSha1Verify("outros", signature, publicKeyPem)).toBe(false);
  });

  test("assina NF-e inserindo Signature dentro de NFe", () => {
    const xml = "<NFe xmlns=\"http://www.portalfiscal.inf.br/nfe\"><infNFe Id=\"NFe123\"><ide><cUF>35</cUF></ide></infNFe></NFe>";
    const signed = signXml(xml, privateKeyPem, publicKeyPem);

    expect(signed).toContain("<Signature xmlns=\"http://www.w3.org/2000/09/xmldsig#\">");
    expect(signed).toContain("<Reference URI=\"#NFe123\">");
    expect(signed).toContain("<SignatureMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#rsa-sha1\">");
    expect(signed.indexOf("</infNFe>")).toBeLessThan(signed.indexOf("<Signature"));
    expect(signed.indexOf("<Signature")).toBeLessThan(signed.indexOf("</NFe>"));
  });

  test("assina evento e suporta SHA-256 quando solicitado", () => {
    const evento = "<evento><infEvento Id=\"ID110111\"><tpEvento>110111</tpEvento></infEvento></evento>";
    const signedEvent = signEventXml(evento, privateKeyPem, publicKeyPem);
    const signedSha256 = signXmlWithAlgorithm(
      "<NFe><infNFe Id=\"NFe256\"><ide></ide></infNFe></NFe>",
      privateKeyPem,
      publicKeyPem,
      SignatureAlgorithm.Sha256,
    );

    expect(signedEvent).toContain("<Reference URI=\"#ID110111\">");
    expect(signedSha256).toContain("http://www.w3.org/2001/04/xmldsig-more#rsa-sha256");
    expect(signedSha256).toContain("http://www.w3.org/2001/04/xmlenc#sha256");
  });

  test("carrega PFX, extrai metadados e usa PEMs para assinatura XML", () => {
    const pfx = createTestPfx("senha");
    const modern = ensureModernPfx(pfx, "senha");
    const cert = loadCertificate(modern, "senha");
    const info = getCertificateInfo(modern, "senha");

    expect(cert.private_key).toContain("BEGIN");
    expect(cert.certificate).toContain("BEGIN CERTIFICATE");
    expect(info.common_name).toBe("Fiscal JS Test");

    const xml = "<NFe><infNFe Id=\"NFePFX\"><ide></ide></infNFe></NFe>";
    const signed = signXml(xml, String(cert.private_key), String(cert.certificate));

    expect(signed).toContain("<Reference URI=\"#NFePFX\">");
  });
});
