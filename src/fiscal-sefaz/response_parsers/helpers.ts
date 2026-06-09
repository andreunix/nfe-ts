import { XMLParser } from "fast-xml-parser";

/** Parser XML tolerante usado apenas para validar forma básica quando útil. */
export const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: false,
});

/** Remove envelope SOAP e prefixos comuns sem alterar fragmentos internos relevantes. */
export function stripSoapEnvelope(xml: string): string {
  let body = extractInnerContent(xml, "Body") ?? xml;
  for (const prefix of ["nfe:", "nfeResultMsg:", "cte:", "mdfe:"]) {
    body = removeNsPrefix(body, prefix);
  }
  return body;
}

export const strip_soap_envelope = stripSoapEnvelope;

/** Extrai o texto do primeiro elemento pelo nome local, ignorando prefixo namespace. */
export function extractTagValue(xml: string, localName: string): string | undefined {
  const inner = extractInnerContent(xml, localName);
  if (inner === undefined) return undefined;
  return inner.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

export const extract_tag_value = extractTagValue;

/** Extrai todos os valores textuais de uma tag simples. */
export function extractAllTagValues(xml: string, localName: string): string[] {
  return extractAllRawTags(xml, localName)
    .map((tag) => extractInnerContent(tag, localName))
    .filter((value): value is string => value !== undefined);
}

export const extract_all_tag_values = extractAllTagValues;

/** Extrai todos os fragmentos raw `<local>...</local>`, aceitando prefixos. */
export function extractAllRawTags(xml: string, localName: string): string[] {
  const out: string[] = [];
  let base = 0;
  while (base < xml.length) {
    const span = rawTagSpan(xml.slice(base), localName);
    if (!span) break;
    out.push(xml.slice(base + span.openStart, base + span.closeEnd));
    base += span.closeEnd;
  }
  return out;
}

export const extract_all_raw_tags = extractAllRawTags;

/** Extrai o primeiro fragmento raw da tag informada. */
export function extractRawTag(xml: string, localName: string): string | undefined {
  const span = rawTagSpan(xml, localName);
  if (!span) return undefined;
  return xml.slice(span.openStart, span.closeEnd);
}

export const extract_raw_tag = extractRawTag;

/** Extrai o conteúdo interno da primeira tag informada. */
export function extractInnerContent(xml: string, localName: string): string | undefined {
  const span = rawTagSpan(xml, localName);
  if (!span) return undefined;
  return xml.slice(span.contentStart, span.contentEnd);
}

export const extract_inner_content = extractInnerContent;

interface TagSpan {
  openStart: number;
  contentStart: number;
  contentEnd: number;
  closeEnd: number;
}

function rawTagSpan(xml: string, localName: string): TagSpan | undefined {
  let from = 0;
  let openStart = -1;
  let contentStart = -1;

  while (from < xml.length) {
    const ltRel = xml.slice(from).indexOf("<");
    if (ltRel < 0) return undefined;
    const lt = from + ltRel;
    const gtRel = xml.slice(lt).indexOf(">");
    if (gtRel < 0) return undefined;
    const gt = lt + gtRel;
    const tag = xml.slice(lt + 1, gt);
    if (tag.startsWith("/") || tag.startsWith("?") || tag.startsWith("!")) {
      from = gt + 1;
      continue;
    }
    const name = tag.split(/\s+/)[0] ?? tag;
    if (localPart(name) === localName) {
      openStart = lt;
      contentStart = gt + 1;
      break;
    }
    from = gt + 1;
  }

  let search = contentStart;
  while (search < xml.length) {
    const closeRel = xml.slice(search).indexOf("</");
    if (closeRel < 0) return undefined;
    const close = search + closeRel;
    const closeGtRel = xml.slice(close).indexOf(">");
    if (closeGtRel < 0) return undefined;
    const closeGt = close + closeGtRel;
    const name = xml.slice(close + 2, closeGt);
    if (localPart(name) === localName) {
      return { openStart, contentStart, contentEnd: close, closeEnd: closeGt + 1 };
    }
    search = closeGt + 1;
  }

  return undefined;
}

function localPart(name: string): string {
  return name.includes(":") ? (name.split(":").pop() ?? name) : name;
}

function removeNsPrefix(xml: string, prefix: string): string {
  return xml.replaceAll(`<${prefix}`, "<").replaceAll(`</${prefix}`, "</");
}
