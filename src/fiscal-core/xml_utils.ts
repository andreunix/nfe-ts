import type { FiscalRecord, Primitive } from "./core.ts";
import { FiscalError } from "./error.ts";

/** Mapa de atributos XML, com valores primitivos que serão escapados. */
export type XmlAttrs = Record<string, Primitive>;
/** Conteúdo aceito por um nó XML: texto, nó filho ou lista de filhos. */
export type XmlChildren = Primitive | XmlNode | Array<Primitive | XmlNode>;
/**
 * Conteúdo aceito por uma tag XML.
 *
 * Equivalente TypeScript do enum `TagContent` do Rust: texto simples, nó XML já
 * montado ou lista de conteúdos filhos.
 */
export type TagContent = XmlChildren;

/** Escapa caracteres especiais XML em texto e atributos. */
export function escapeXml(value: Primitive): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

/** Alias em snake_case para paridade com o Rust. */
export const escape_xml = escapeXml;

/** Extrai o texto do primeiro elemento simples `<tag>valor</tag>`. */
export function extractXmlTagValue(xml: string, tagName: string): string | undefined {
  const open = `<${tagName}>`;
  const close = `</${tagName}>`;
  const start = xml.indexOf(open);
  if (start < 0) return undefined;
  const bodyStart = start + open.length;
  const end = xml.indexOf(close, bodyStart);
  if (end < 0) return undefined;
  return xml.slice(bodyStart, end);
}

/** Alias em snake_case para paridade com o Rust. */
export const extract_xml_tag_value = extractXmlTagValue;

/** Extrai o primeiro elemento XML completo, incluindo abertura, conteúdo e fechamento. */
export function extractXmlElement(xml: string, tagName: string): string | undefined {
  const start = xml.search(new RegExp(`<${tagName}(\\s|>)`));
  if (start < 0) return undefined;
  const close = `</${tagName}>`;
  const end = xml.indexOf(close, start);
  if (end < 0) return undefined;
  return xml.slice(start, end + close.length);
}

/** Representa um nó XML mínimo usado pelos builders fiscais. */
export class XmlNode {
  /** Nome da tag XML. */
  readonly name: string;
  /** Atributos da tag XML. */
  readonly attrs: XmlAttrs;
  /** Conteúdo textual ou nós filhos. */
  readonly children: Array<Primitive | XmlNode>;
  /** Indica se textos primitivos devem passar por escape XML. */
  readonly escapeText: boolean;

  /** Cria um nó XML com atributos e conteúdo opcionais. */
  constructor(name: string, attrs: XmlAttrs = {}, children: XmlChildren = [], escapeText = true) {
    this.name = name;
    this.attrs = attrs;
    this.children = Array.isArray(children) ? children : [children];
    this.escapeText = escapeText;
  }

  /** Serializa o nó e seus filhos para XML compacto. */
  toString(): string {
    const attrs = Object.entries(this.attrs)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
      .join("");
    const body = this.children
      .filter((child) => child !== undefined && child !== null)
      .map((child) => {
        if (child instanceof XmlNode) return child.toString();
        if (!this.escapeText) return String(child);
        const text = String(child ?? "");
        return text.startsWith("<") && text.endsWith(">") ? text : escapeXml(child);
      })
      .join("");
    return `<${this.name}${attrs}>${body}</${this.name}>`;
  }
}

/** Cria uma tag XML escapando automaticamente conteúdo textual. */
export function tag(name: string, attrs: XmlAttrs | XmlChildren = {}, children?: XmlChildren): string {
  if (children === undefined) return new XmlNode(name, {}, attrs as XmlChildren).toString();
  return new XmlNode(name, attrs as XmlAttrs, children).toString();
}

/** Cria uma tag XML preservando o conteúdo interno como XML bruto. */
export function rawTag(name: string, attrs: XmlAttrs | string = {}, rawChildren?: string): string {
  if (rawChildren === undefined) return new XmlNode(name, {}, attrs as string, false).toString();
  return new XmlNode(name, attrs as XmlAttrs, rawChildren, false).toString();
}

/** Converte um objeto em uma sequência de tags, respeitando uma ordem opcional. */
export function tagsFromObject(data: FiscalRecord, order?: string[]): string {
  const keys = order ?? Object.keys(data);
  return keys
    .map((key) => [key, data[key]] as const)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => Array.isArray(value)
      ? value.map((item) => buildXmlFromRecord(key, item)).join("")
      : buildXmlFromRecord(key, value))
    .join("");
}

/** Converte valor primitivo, objeto ou array para XML usando o nome de tag informado. */
export function buildXmlFromRecord(name: string, value: unknown): string {
  if (value instanceof XmlNode) return tag(name, value.toString());
  if (Array.isArray(value)) return value.map((item) => buildXmlFromRecord(name, item)).join("");
  if (typeof value === "object" && value !== null) return rawTag(name, tagsFromObject(value as FiscalRecord));
  return tag(name, String(value ?? ""));
}

/** Formata XML compacto em linhas indentadas para depuração e inspeção. */
export function prettyPrintXml(xml: string): string {
  const tokens = xml.match(/<[^>]+>|[^<]+/g) ?? [];
  let depth = 0;
  const lines: string[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]?.trim();
    if (!token) continue;
    if (token.startsWith("<?")) {
      lines.push(token);
      continue;
    }
    if (token.startsWith("</")) {
      depth = Math.max(0, depth - 1);
      lines.push(`${"  ".repeat(depth)}${token}`);
      continue;
    }
    const next = tokens[index + 1]?.trim();
    const after = tokens[index + 2]?.trim();
    if (token.startsWith("<") && next && !next.startsWith("<") && after?.startsWith("</")) {
      lines.push(`${"  ".repeat(depth)}${token}${next}${after}`);
      index += 2;
      continue;
    }
    lines.push(`${"  ".repeat(depth)}${token}`);
    if (token.startsWith("<") && !token.endsWith("/>") && !token.startsWith("</")) depth += 1;
  }

  return lines.join("\n");
}

/** Alias em snake_case para paridade com o Rust. */
export const pretty_print_xml = prettyPrintXml;

/** Remove caracteres XML inválidos de uma string. */
export function removeInvalidXmlChars(input: string): string {
  return input.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]/gu, "");
}

/** Alias em snake_case para paridade com o Rust. */
export const remove_invalid_xml_chars = removeInvalidXmlChars;

/** Substitui caracteres problemáticos para XML/SEFAZ por versões aceitas. */
export function replaceUnacceptableCharacters(input: string): string {
  return removeInvalidXmlChars(input)
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Alias em snake_case para paridade com o Rust. */
export const replace_unacceptable_characters = replaceUnacceptableCharacters;

/** Limpa XML para transporte/assinatura, opcionalmente removendo declaração XML. */
export function clearXmlString(input: string, removeEncodingTag = false): string {
  let xml = removeInvalidXmlChars(input).trim();
  if (removeEncodingTag) {
    xml = xml.replace(/^\s*<\?xml[^>]*\?>\s*/i, "");
  }
  return xml.replace(/>\s+</g, "><");
}

/** Alias em snake_case para paridade com o Rust. */
export const clear_xml_string = clearXmlString;

/** Valida uma string XML de forma leve, verificando abertura e fechamento básicos. */
export function validateXml(xml: string): void {
  const trimmed = xml.trim();
  if (!trimmed) throw FiscalError.xml("XML vazio.");
  if (!trimmed.startsWith("<")) throw FiscalError.xml("Documento inválido: não parece XML.");
  const stack: string[] = [];
  const tagPattern = /<\/?([A-Za-z_][\w:.-]*)(?:\s[^>]*)?>/g;
  for (const match of trimmed.matchAll(tagPattern)) {
    const full = match[0];
    const name = match[1]!;
    if (full.startsWith("<?") || full.startsWith("<!")) continue;
    if (full.endsWith("/>")) continue;
    if (full.startsWith("</")) {
      const last = stack.pop();
      if (last !== name) throw FiscalError.xml(`XML malformado: esperado fechamento de ${last ?? "nenhuma tag"}, recebeu ${name}.`);
    } else {
      stack.push(name);
    }
  }
  if (stack.length > 0) throw FiscalError.xml(`XML malformado: tag ${stack.at(-1)} não foi fechada.`);
}

/** Alias em snake_case para paridade com o Rust. */
export const validate_xml = validateXml;
