import type { FiscalRecord } from "../core.ts";
import { formatCents2 } from "../format_utils.ts";
import { Cents } from "../newtypes/monetary.ts";
import { rawTag, tag } from "../xml_utils.ts";

function money(value: unknown): string {
  if (value instanceof Cents) return formatCents2(value.value);
  if (typeof value === "number") return formatCents2(value);
  return String(value ?? "0.00");
}

/** Monta o grupo `<pag>` com seus `<detPag>`. */
export function buildPag(payments: FiscalRecord[] = [], changeAmount?: unknown): string {
  const dets = payments.length > 0 ? payments : [{ method: "90", amount: 0 }];
  const children = dets.map((payment) => rawTag("detPag", [
    payment.ind_pag ? tag("indPag", String(payment.ind_pag)) : "",
    tag("tPag", String(payment.method ?? payment.t_pag ?? payment.tPag ?? "90")),
    payment.x_pag ? tag("xPag", String(payment.x_pag)) : "",
    tag("vPag", money(payment.amount ?? payment.v_pag ?? payment.vPag ?? 0)),
  ].join("")));
  if (changeAmount !== undefined) children.push(tag("vTroco", money(changeAmount)));
  return rawTag("pag", children.join(""));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_pag = buildPag;
