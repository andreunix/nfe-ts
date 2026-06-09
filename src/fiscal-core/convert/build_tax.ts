import { rawTag } from "../xml_utils.ts";
import type { TxtEntity } from "./types.ts";

/** Monta um grupo de imposto genérico a partir de uma entidade TXT. */
export function buildTax(entity: TxtEntity): string {
  return rawTag(entity.ref, entity.fields.map((field, index) => `<f${index + 1}>${field}</f${index + 1}>`).join(""));
}
