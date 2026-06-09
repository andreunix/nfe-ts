import { escapeXml } from "../xml_utils.ts";
import type { Fields, TxtEntity } from "./types.ts";
import { getStructure } from "./structures_dispatch.ts";

/** Converte campos posicionais em objeto nomeado conforme definição da entidade. */
export function fieldsToStd(fields: string[], structDef: string): Fields {
  const names = structDef.split("|");
  const result: Fields = {};
  for (let index = 1; index < names.length - 1; index += 1) {
    const name = names[index];
    const value = fields[index - 1] ?? "";
    if (name && value) result[name] = value;
  }
  return result;
}

/** Cria uma tag XML simples sem escapar o nome. */
export function xmlTag(name: string, content: string): string {
  return `<${name}>${content}</${name}>`;
}

/** Adiciona uma tag filha escapando conteúdo quando o valor existe. */
export function addChild(children: string[], name: string, value?: string): void {
  if (value) children.push(`<${name}>${escapeXml(value)}</${name}>`);
}

/** Garante casas decimais fixas em uma string numérica. */
export function padDecimal(value: string, places: number): string {
  if (!value) return "";
  const [integer, fraction = ""] = value.split(".");
  return `${integer}.${fraction.padEnd(places, "0").slice(0, places)}`;
}

/** Valida estruturalmente linhas TXT de forma compatível com a API Rust. */
export function validateTxtLines(lines: string[], layout: string): string[] {
  const errors: string[] = [];
  let currentStructure: Record<string, string> | undefined;

  for (const row of lines) {
    if (!row) continue;
    const fields = row.split("|");
    const ref = fields[0]?.toUpperCase() ?? "";
    if (!ref || ref === "NOTAFISCAL") continue;
    if (!row.endsWith("|")) {
      errors.push(`ERRO: Todas as linhas devem terminar com pipe. [${row}]`);
      continue;
    }
    if (ref === "A") currentStructure = getStructure(fields[1] ?? "4.00", layout);
    if (!currentStructure) {
      errors.push("ERRO: O TXT não contém um marcador A");
      continue;
    }
    if (!currentStructure[ref]) {
      errors.push(`ERRO: Essa referência não está definida. [${row}]`);
    }
    if (/[<>"'\t\r]/.test(row)) {
      errors.push(`ERRO: Existem caracteres especiais não permitidos na entidade [${row}]`);
    }
  }

  return errors;
}

/** Parseia linhas TXT em entidades brutas. */
export function parseEntities(lines: string[]): TxtEntity[] {
  return lines.filter(Boolean).map((raw) => {
    const parts = raw.split("|");
    return { ref: (parts.shift() ?? "").toUpperCase(), fields: parts.slice(0, -1), raw };
  });
}
