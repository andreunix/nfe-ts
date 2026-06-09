import { FiscalError } from "../fiscal-core/error.ts";
import { extractXmlTagValue } from "../fiscal-core/xml_utils.ts";
import { MDFE_NAMESPACE, MDFE_VERSION } from "./constants.ts";

export function isValidMdfeXml(content: string): boolean {
  const trimmed = content.trim().replace(/^\uFEFF/, "");
  if (!trimmed || !trimmed.startsWith("<")) return false;
  const lower = trimmed.toLowerCase();
  if (lower.includes("<!doctype html>") || lower.includes("</html>")) return false;

  const stack: string[] = [];
  let hadElement = false;
  const tagPattern = /<\/?([A-Za-z_][\w:.-]*)(?:\s[^>]*)?>/g;
  for (const match of trimmed.matchAll(tagPattern)) {
    const full = match[0];
    const name = match[1]!;
    if (full.startsWith("<?") || full.startsWith("<!")) continue;
    hadElement = true;
    if (full.endsWith("/>")) continue;
    if (full.startsWith("</")) {
      if (stack.pop() !== name) return false;
    } else {
      stack.push(name);
    }
  }
  return hadElement && stack.length === 0;
}

export const is_valid_mdfe_xml = isValidMdfeXml;

export function validateMdfeXml(xml: string): void {
  if (!xml.trim()) throw FiscalError.xmlParsing("Validação MDF-e: a string do MDF-e está vazia");
  if (!isValidMdfeXml(xml)) throw FiscalError.xmlParsing("A string passada não é um XML válido");

  const errors: string[] = [];
  if (!xml.includes("<MDFe")) errors.push("Elemento raiz <MDFe> ausente");
  if (!xml.includes("<infMDFe")) errors.push("Elemento <infMDFe> ausente");
  if (!xml.includes(MDFE_NAMESPACE)) errors.push(`Namespace MDF-e ausente (${MDFE_NAMESPACE})`);

  const infStart = xml.indexOf("<infMDFe");
  if (infStart >= 0) {
    const inf = xml.slice(infStart);
    const version = findAttr(inf, "versao");
    if (version === undefined) errors.push("Atributo versao ausente em <infMDFe>");
    else if (version !== MDFE_VERSION) errors.push(`Versão do XML (${version}) não corresponde à versão esperada (${MDFE_VERSION})`);

    const id = findAttr(inf, "Id");
    if (id === undefined || !id.startsWith("MDFe")) errors.push("Atributo Id com chave de acesso ausente em <infMDFe>");
    else {
      const key = id.slice(4);
      if (!/^\d{44}$/.test(key)) errors.push(`Chave de acesso inválida: esperado 44 dígitos, encontrado '${key}'`);
    }
  }

  for (const tagName of ["cUF", "tpAmb", "tpEmit", "mod", "serie", "nMDF", "cMDF", "cDV", "modal", "dhEmi", "tpEmis", "procEmi", "verProc", "UFIni", "UFFim"]) {
    if (extractXmlTagValue(xml, tagName) === undefined) errors.push(`Tag obrigatória <${tagName}> ausente em <ide>`);
  }

  if (extractXmlTagValue(xml, "xNome") === undefined) errors.push("Tag obrigatória <xNome> ausente em <emit>");
  if (extractXmlTagValue(xml, "CNPJ") === undefined && extractXmlTagValue(xml, "CPF") === undefined) errors.push("Tag <CNPJ> ou <CPF> ausente em <emit>");
  if (!xml.includes("<enderEmit")) errors.push("Bloco <enderEmit> ausente");
  if (!xml.includes("<infModal")) errors.push("Bloco <infModal> ausente");
  if (!xml.includes("<infDoc")) errors.push("Bloco <infDoc> ausente");
  if (!xml.includes("<tot")) errors.push("Bloco <tot> ausente");
  if (!xml.includes("<Signature")) errors.push("Assinatura digital <Signature> ausente");

  if (errors.length > 0) throw FiscalError.xmlParsing(`Este XML não é válido. ${errors.join("; ")}`);
}

export const validate_mdfe_xml = validateMdfeXml;

function findAttr(xml: string, attr: string): string | undefined {
  return xml.match(new RegExp(`${attr}="([^"]*)"`))?.[1];
}
