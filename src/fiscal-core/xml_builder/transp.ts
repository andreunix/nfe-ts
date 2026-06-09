import type { FiscalRecord } from "../core.ts";
import { genericFiscalGroup } from "../tax_element.ts";
import { rawTag, tag } from "../xml_utils.ts";

/** Monta o grupo `<transp>` de transporte. */
export function buildTransp(data?: FiscalRecord): string {
  if (!data) return rawTag("transp", tag("modFrete", "9"));
  const carrier = data.carrier as FiscalRecord | undefined;
  const vehicle = data.vehicle as FiscalRecord | undefined;
  const volumes = Array.isArray(data.volumes) ? data.volumes as FiscalRecord[] : [];
  const children = [
    tag("modFrete", String(data.mod_frete ?? data.modFrete ?? "9")),
    carrier ? rawTag("transporta", genericFiscalGroup(carrier)) : "",
    vehicle ? rawTag("veicTransp", genericFiscalGroup(vehicle)) : "",
    ...volumes.map((volume) => rawTag("vol", genericFiscalGroup(volume))),
  ];
  return rawTag("transp", children.join(""));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_transp = buildTransp;
