import type { FiscalRecord } from "./core.ts";
import { genericFiscalGroup } from "./tax_element.ts";
import { rawTag, tag } from "./xml_utils.ts";

/** Dados do Imposto Seletivo (`IS`). */
export class IsData {
  cst_is: string;
  c_class_trib_is: string;
  v_is: string;
  v_bc_is?: string;
  p_is?: string;
  p_is_espec?: string;
  u_trib?: string;
  q_trib?: string;
  [key: string]: unknown;

  constructor(cstIs: string, cClassTribIs: string, vIs: string) {
    this.cst_is = cstIs;
    this.c_class_trib_is = cClassTribIs;
    this.v_is = vIs;
  }

  vBcIs(value: string): this { this.v_bc_is = value; return this; }
  v_bc_is_set(value: string): this { return this.vBcIs(value); }
  pIs(value: string): this { this.p_is = value; return this; }
  p_is_set(value: string): this { return this.pIs(value); }
  pIsEspec(value: string): this { this.p_is_espec = value; return this; }
  p_is_espec_set(value: string): this { return this.pIsEspec(value); }
  uTrib(value: string): this { this.u_trib = value; return this; }
  u_trib_set(value: string): this { return this.uTrib(value); }
  qTrib(value: string): this { this.q_trib = value; return this; }
  q_trib_set(value: string): this { return this.qTrib(value); }
  buildXml(): string { return buildIsXml(this); }
  build_xml(): string { return this.buildXml(); }
}

/** Gera XML do grupo IS. */
export function buildIsXml(data: FiscalRecord): string {
  const body = [
    tag("CSTIS", String(data.cst_is ?? data.CSTIS ?? "")),
    tag("cClassTribIS", String(data.c_class_trib_is ?? data.cClassTribIS ?? "")),
    data.v_bc_is ? tag("vBCIS", String(data.v_bc_is)) : "",
    data.p_is ? tag("pIS", String(data.p_is)) : "",
    data.p_is_espec ? tag("pISEspec", String(data.p_is_espec)) : "",
    data.u_trib ? tag("uTrib", String(data.u_trib)) : "",
    data.q_trib ? tag("qTrib", String(data.q_trib)) : "",
    tag("vIS", String(data.v_is ?? data.vIS ?? "")),
  ].join("");
  return rawTag("IS", body || genericFiscalGroup(data));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_is_xml = buildIsXml;
