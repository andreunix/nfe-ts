import type { FiscalRecord } from "../core.ts";
import { rawTag, tag } from "../xml_utils.ts";
import { buildAddressFields } from "./emit.ts";
import { TaxId } from "./tax_id.ts";

/** Monta o grupo `<dest>` do destinatário quando houver dados. */
export function buildDest(data: FiscalRecord): string | undefined {
  const recipient = data.recipient as FiscalRecord | undefined;
  if (!recipient) return undefined;
  const tax = String(recipient.tax_id ?? recipient.taxId ?? "");
  const children = [
    tax ? new TaxId(tax).toXmlTag() : "",
    tag("xNome", String(recipient.name ?? recipient.xNome ?? "")),
    rawTag("enderDest", buildAddressFields(recipient)),
    tag("indIEDest", String(recipient.ind_ie_dest ?? recipient.indIEDest ?? 9)),
    recipient.state_tax_id || recipient.ie ? tag("IE", String(recipient.state_tax_id ?? recipient.ie)) : "",
    recipient.email ? tag("email", String(recipient.email)) : "",
  ];
  return rawTag("dest", children.join(""));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_dest = buildDest;
