import { FiscalError } from "../fiscal-core/error.ts";
import { CTE_NAMESPACE, CTE_VERSION } from "./constants.ts";

export function isValidXml(content: string): boolean {
  const trimmed = content.trim().replace(/^\uFEFF/, "");
  if (!trimmed || !trimmed.startsWith("<")) return false;
  const lower = trimmed.toLowerCase();
  if (lower.includes("<!doctype html>") || lower.includes("</html>")) return false;
  try {
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
  } catch {
    return false;
  }
}

export const is_valid_xml = isValidXml;

export function validateCteXml(xml: string): void {
  if (!xml.trim()) throw FiscalError.xmlParsing("Validação CT-e: a string do CT-e está vazia");
  if (!isValidXml(xml)) throw FiscalError.xmlParsing("A string passada não é um XML válido");

  const errors: string[] = [];
  if (!xml.includes("<CTe")) errors.push("Elemento raiz <CTe> ausente");
  if (!xml.includes("<infCte")) errors.push("Elemento <infCte> ausente");
  if (!xml.includes(CTE_NAMESPACE)) errors.push(`Namespace CT-e ausente (${CTE_NAMESPACE})`);

  const infCteStart = xml.indexOf("<infCte");
  if (infCteStart >= 0) {
    const inf = xml.slice(infCteStart);
    const versao = findAttr(inf, "versao");
    if (versao === undefined) errors.push("Atributo versao ausente em <infCte>");
    else if (versao !== CTE_VERSION) errors.push(`Versão do XML (${versao}) não corresponde à esperada (${CTE_VERSION})`);
    const id = findAttr(inf, "Id");
    if (id === undefined) errors.push("Atributo Id ausente em <infCte>");
    else if (!/^CTe\d{44}$/.test(id)) errors.push(`Id de <infCte> inválido (${id}): esperado "CTe" + 44 dígitos`);
  }

  for (const [needle, label] of [["<ide", "<ide>"], ["<emit", "<emit>"], ["<vPrest", "<vPrest>"], ["<imp", "<imp>"], ["<infCTeNorm", "<infCTeNorm>"]] as const) {
    if (!xml.includes(needle)) errors.push(`Bloco obrigatório ${label} ausente`);
  }
  if (!xml.includes("<Signature")) errors.push("Assinatura digital <Signature> ausente");
  if (errors.length > 0) throw FiscalError.xmlParsing(`Validação estrutural do CT-e falhou: ${errors.join("; ")}`);
}

export const validate_cte_xml = validateCteXml;

function findAttr(xml: string, attr: string): string | undefined {
  const match = xml.match(new RegExp(`${attr}="([^"]*)"`));
  return match?.[1];
}
