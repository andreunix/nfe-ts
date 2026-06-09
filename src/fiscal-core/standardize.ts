import { FiscalError } from "./error.ts";
import { validateXml } from "./xml_utils.ts";

const ROOT_TAG_LIST = [
  "distDFeInt",
  "resNFe",
  "resEvento",
  "envEvento",
  "ConsCad",
  "consSitNFe",
  "consReciNFe",
  "downloadNFe",
  "enviNFe",
  "inutNFe",
  "admCscNFCe",
  "consStatServ",
  "retDistDFeInt",
  "retEnvEvento",
  "retConsCad",
  "retConsSitNFe",
  "retConsReciNFe",
  "retDownloadNFe",
  "retEnviNFe",
  "retInutNFe",
  "retAdmCscNFCe",
  "retConsStatServ",
  "procInutNFe",
  "procEventoNFe",
  "procNFe",
  "nfeProc",
  "NFe",
] as const;

/** Identifica o tipo de XML NF-e pelo elemento raiz conhecido. */
export function identifyXmlType(xml: string): string {
  const trimmed = xml.trim();
  if (!trimmed) throw FiscalError.xml("XML is empty.");
  validateXml(trimmed);
  const root = trimmed.match(/^<\?xml[^>]*\?>\s*<([A-Za-z_][\w:.-]*)|^<([A-Za-z_][\w:.-]*)/);
  const rootName = stripNamespace(root?.[1] ?? root?.[2] ?? "");
  if ((ROOT_TAG_LIST as readonly string[]).includes(rootName)) return rootName;
  throw FiscalError.xml("Document does not belong to the NFe project.");
}

/** Alias em snake_case para paridade com o Rust. */
export const identify_xml_type = identifyXmlType;

/** Converte XML NF-e para string JSON. */
export function xmlToJson(xml: string): string {
  return JSON.stringify(xmlToValue(xml));
}

/** Alias em snake_case para paridade com o Rust. */
export const xml_to_json = xmlToJson;

/** Converte XML NF-e para árvore JavaScript dinâmica. */
export function xmlToValue(xml: string): unknown {
  const rootType = identifyXmlType(xml);
  const parsed = parseXmlValue(xml.trim());
  if (isRecord(parsed) && rootType in parsed) return parsed[rootType];
  return parsed;
}

/** Alias em snake_case para paridade com o Rust. */
export const xml_to_value = xmlToValue;

/** Converte XML NF-e para objeto no topo. */
export function xmlToMap(xml: string): Record<string, unknown> {
  const value = xmlToValue(xml);
  if (!isRecord(value)) throw FiscalError.xml("Top-level XML value is not an object.");
  return value;
}

/** Alias em snake_case para paridade com o Rust. */
export const xml_to_map = xmlToMap;

function parseXmlValue(xml: string): unknown {
  const cleaned = xml.replace(/^\s*<\?xml[^>]*\?>\s*/i, "");
  const rootMatch = cleaned.match(/^<([A-Za-z_][\w:.-]*)([^>]*)>([\s\S]*)<\/\1>$/);
  if (!rootMatch) return {};
  const [, rawName, rawAttrs, inner] = rootMatch;
  const name = stripNamespace(rawName!);
  return { [name]: elementToValue(rawAttrs ?? "", inner ?? "") };
}

function elementToValue(rawAttrs: string, inner: string): unknown {
  const attrs = parseAttrs(rawAttrs);
  const childMatches = Array.from(inner.matchAll(/<([A-Za-z_][\w:.-]*)([^>]*)>([\s\S]*?)<\/\1>/g));
  if (childMatches.length === 0) {
    const text = decodeXml(inner.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1").trim());
    return Object.keys(attrs).length > 0 ? { ...attrs, ...(text ? { value: text } : {}) } : text;
  }
  const result: Record<string, unknown> = { ...attrs };
  for (const match of childMatches) {
    const childName = stripNamespace(match[1]!);
    const childValue = elementToValue(match[2] ?? "", match[3] ?? "");
    const previous = result[childName];
    if (previous === undefined) result[childName] = childValue;
    else if (Array.isArray(previous)) previous.push(childValue);
    else result[childName] = [previous, childValue];
  }
  return result;
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of raw.matchAll(/\s+([A-Za-z_:][\w:.-]*)="([^"]*)"/g)) {
    const key = match[1]!;
    if (key === "xmlns" || key.startsWith("xmlns:")) continue;
    attrs[stripNamespace(key)] = decodeXml(match[2] ?? "");
  }
  return attrs;
}

function stripNamespace(name: string): string {
  return name.includes(":") ? name.split(":").at(-1)! : name;
}

function decodeXml(value: string): string {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
