import { FiscalError } from "../../fiscal-core/error.ts";

/**
 * Extrai o atributo `Id` do primeiro elemento `<tagName ...>`.
 *
 * A assinatura XML-DSig fiscal referencia esse Id no `Reference URI="#..."`.
 */
export function extractElementId(xml: string, tagName: string): string {
  const tagStart = xml.indexOf(`<${tagName}`);
  if (tagStart < 0) {
    throw FiscalError.certificate(`Could not find <${tagName}> element with Id attribute in XML`);
  }

  const rest = xml.slice(tagStart);
  const tagEnd = rest.indexOf(">");
  if (tagEnd < 0) {
    throw FiscalError.certificate(`<${tagName}> tag is malformed`);
  }

  const tagContent = rest.slice(0, tagEnd);
  const match = tagContent.match(/\bId="([^"]+)"/);
  if (!match?.[1]) {
    throw FiscalError.certificate(`Could not find <${tagName}> element with Id attribute in XML`);
  }

  return match[1];
}

export const extract_element_id = extractElementId;

/**
 * Garante que o elemento assinado carregue o namespace herdado do ancestral.
 *
 * A canonicalização inclusiva considera namespaces em escopo; quando o XML tem
 * `xmlns` no pai e não no elemento assinado, inserimos esse namespace no recorte.
 */
export function ensureInheritedNamespace(element: string, fullXml: string, tagName: string): string {
  const openEnd = element.indexOf(">");
  const openTag = element.slice(0, openEnd < 0 ? element.length : openEnd);
  if (openTag.includes("xmlns=")) return element;

  const tagPos = fullXml.indexOf(`<${tagName}`);
  const before = tagPos >= 0 ? fullXml.slice(0, tagPos) : "";
  const nsStart = before.lastIndexOf("xmlns=\"");
  if (nsStart < 0) return element;

  const nsValStart = nsStart + "xmlns=\"".length;
  const nsValEnd = fullXml.slice(nsValStart).indexOf("\"");
  if (nsValEnd < 0) return element;

  const nsValue = fullXml.slice(nsValStart, nsValStart + nsValEnd);
  const insertPos = element.search(/[\s>]/);
  const pos = insertPos < 0 ? openEnd : insertPos;
  return `${element.slice(0, pos)} xmlns="${nsValue}"${element.slice(pos)}`;
}

export const ensure_inherited_namespace = ensureInheritedNamespace;

/** Extrai o elemento completo `<tagName ...>...</tagName>` do XML. */
export function extractElement(xml: string, tagName: string): string | undefined {
  const start = xml.indexOf(`<${tagName}`);
  if (start < 0) return undefined;
  const close = `</${tagName}>`;
  const end = xml.indexOf(close, start);
  if (end < 0) return undefined;
  return xml.slice(start, end + close.length);
}

export const extract_element = extractElement;

/** Remove uma assinatura enveloped já presente antes de recalcular digest. */
export function removeSignatureElement(xml: string): string {
  const sigStart = xml.indexOf("<Signature");
  if (sigStart < 0) return xml;
  const relEnd = xml.slice(sigStart).indexOf("</Signature>");
  if (relEnd < 0) return xml;
  const sigEnd = sigStart + relEnd + "</Signature>".length;
  return `${xml.slice(0, sigStart)}${xml.slice(sigEnd)}`;
}

export const remove_signature_element = removeSignatureElement;

/**
 * Canonicalização XML C14N 1.0 simplificada.
 *
 * Reproduz o subset usado na crate Rust: remove declaração XML, ordena
 * atributos e expande tags autocontidas.
 */
export function canonicalizeXml(xml: string): string {
  let input = xml;
  const declStart = input.indexOf("<?xml");
  if (declStart >= 0) {
    const declEnd = input.slice(declStart).indexOf("?>");
    if (declEnd >= 0) input = input.slice(declStart + declEnd + 2).trimStart();
  }

  return input.replace(/<([^!?/][^>\s/]*)([^>]*?)(\/?)>/g, (full, tagName: string, attrs: string, selfClose: string) => {
    const parsed = parseAttributes(attrs.trim());
    if (parsed.length === 0) {
      return selfClose ? `<${tagName}></${tagName}>` : full;
    }

    const nsAttrs = parsed.filter(([name]) => name === "xmlns" || name.startsWith("xmlns:"));
    const regAttrs = parsed.filter(([name]) => name !== "xmlns" && !name.startsWith("xmlns:"));
    nsAttrs.sort(([a], [b]) => (a === "xmlns" ? -1 : b === "xmlns" ? 1 : lexicalCompare(a, b)));
    regAttrs.sort(([a], [b]) => lexicalCompare(a, b));
    const attrText = [...nsAttrs, ...regAttrs].map(([name, value]) => ` ${name}="${value}"`).join("");
    return selfClose ? `<${tagName}${attrText}></${tagName}>` : `<${tagName}${attrText}>`;
  });
}

export const canonicalize_xml = canonicalizeXml;

/** Parser mínimo de atributos com aspas simples ou duplas. */
export function parseAttributes(attrs: string): Array<[string, string]> {
  const result: Array<[string, string]> = [];
  const re = /([^\s=]+)\s*=\s*(["'])(.*?)\2/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(attrs))) {
    if (match[1] !== undefined && match[3] !== undefined) result.push([match[1], match[3]]);
  }
  return result;
}

export const parse_attributes = parseAttributes;

/** Ordenação lexical byte-like, equivalente ao `str::cmp` usado no Rust. */
function lexicalCompare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
