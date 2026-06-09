import type { FiscalRecord } from "../core.ts";
import { genericFiscalGroup } from "../tax_element.ts";
import { rawTag, tag } from "../xml_utils.ts";
import { TaxId } from "./tax_id.ts";

/** Monta campos comuns de endereço a partir de um objeto fiscal. */
export function buildAddressFields(data: FiscalRecord): string {
  return [
    tag("xLgr", String(data.street ?? data.x_lgr ?? data.xLgr ?? "")),
    tag("nro", String(data.street_number ?? data.nro ?? "S/N")),
    data.complement || data.x_cpl ? tag("xCpl", String(data.complement ?? data.x_cpl)) : "",
    tag("xBairro", String(data.district ?? data.x_bairro ?? data.xBairro ?? "")),
    tag("cMun", String(data.city_code ?? data.c_mun ?? data.cMun ?? "")),
    tag("xMun", String(data.city_name ?? data.x_mun ?? data.xMun ?? "")),
    tag("UF", String(data.state_code ?? data.uf ?? data.UF ?? "")),
    tag("CEP", String(data.zip_code ?? data.cep ?? "")),
    tag("cPais", String(data.country_code ?? data.c_pais ?? "1058")),
    tag("xPais", String(data.country_name ?? data.x_pais ?? "BRASIL")),
    data.phone || data.fone ? tag("fone", String(data.phone ?? data.fone)) : "",
  ].join("");
}

/** Alias em snake_case para paridade com o Rust. */
export const build_address_fields = buildAddressFields;

/** Monta o grupo `<emit>` do emitente. */
export function buildEmit(data: FiscalRecord): string {
  const issuer = (data.issuer ?? data) as FiscalRecord;
  const taxId = new TaxId(String(issuer.tax_id ?? issuer.taxId ?? ""));
  const children = [
    taxId.toXmlTag(),
    tag("xNome", String(issuer.legal_name ?? issuer.name ?? issuer.xNome ?? "")),
    issuer.trade_name || issuer.xFant ? tag("xFant", String(issuer.trade_name ?? issuer.xFant)) : "",
    rawTag("enderEmit", buildAddressFields(issuer)),
    tag("IE", String(issuer.state_tax_id ?? issuer.ie ?? "")),
    issuer.iest ? tag("IEST", String(issuer.iest)) : "",
    issuer.im ? tag("IM", String(issuer.im)) : "",
    issuer.cnae ? tag("CNAE", String(issuer.cnae)) : "",
    tag("CRT", String(issuer.tax_regime ?? issuer.crt ?? 3)),
  ];
  return rawTag("emit", children.join("") || genericFiscalGroup(issuer));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_emit = buildEmit;
