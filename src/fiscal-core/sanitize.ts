/** Remove caracteres aceitos por XML, mas rejeitados com frequência pela SEFAZ. */
export function replaceUnacceptableCharacters(value: string): string {
  return value
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tabela de transliteração simples para remover acentos em textos enviados à SEFAZ. */
const accentMap: Record<string, string> = {
  Á: "A", À: "A", Â: "A", Ã: "A", Ä: "A", Å: "A",
  á: "a", à: "a", â: "a", ã: "a", ä: "a", å: "a",
  É: "E", È: "E", Ê: "E", Ë: "E",
  é: "e", è: "e", ê: "e", ë: "e",
  Í: "I", Ì: "I", Î: "I", Ï: "I",
  í: "i", ì: "i", î: "i", ï: "i",
  Ó: "O", Ò: "O", Ô: "O", Õ: "O", Ö: "O",
  ó: "o", ò: "o", ô: "o", õ: "o", ö: "o",
  Ú: "U", Ù: "U", Û: "U", Ü: "U",
  ú: "u", ù: "u", û: "u", ü: "u",
  Ç: "C", ç: "c", Ñ: "N", ñ: "n",
};

/** Remove acentos e caracteres fora de ASCII imprimível, preservando texto legível. */
export function sanitizeAscii(value: string): string {
  return replaceUnacceptableCharacters(
    Array.from(value, (char) => accentMap[char] ?? char).join("").replace(/[^\x20-\x7E]/g, ""),
  );
}

/** Alias em snake_case para paridade com o Rust. */
export const sanitize_to_ascii = sanitizeAscii;

/** Sanitiza textos entre tags XML sem alterar a estrutura das tags. */
export function sanitizeXmlText(xml: string): string {
  return xml.replace(/>([^<]+)</g, (_, text: string) => `>${sanitizeAscii(text)}<`);
}

/** Alias em snake_case para paridade com o Rust. */
export const sanitize_xml_text = sanitizeXmlText;

/** Retorna apenas os dígitos de uma string. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}
