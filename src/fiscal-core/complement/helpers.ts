import { extractXmlElement, extractXmlTagValue } from "../xml_utils.ts";

/** Remove quebras de linha para comparação/concatenação XML. */
export function stripNewlines(value: string): string {
  return value.replace(/[\r\n]+/g, "");
}

/** Extrai uma tag XML completa. */
export const extractTag = extractXmlElement;
/** Extrai conteúdo textual de uma tag XML simples. */
export const extractTagInnerContent = extractXmlTagValue;
export const strip_newlines = stripNewlines;
export const extract_tag = extractTag;
export const extract_tag_inner_content = extractTagInnerContent;
