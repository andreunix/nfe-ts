import type { FiscalRecord } from "../core.ts";
import { getStateCode } from "../state_codes.ts";
import { rawTag, tag } from "../xml_utils.ts";

/** Formata data/hora para NF-e com offset brasileiro explícito. */
export function formatDatetimeNfe(date: Date | string, stateCode = "SP"): string {
  const dt = typeof date === "string" ? new Date(date) : date;
  const offset = ["AC"].includes(stateCode) ? "-05:00" : ["AM", "RO", "RR", "MT", "MS"].includes(stateCode) ? "-04:00" : "-03:00";
  return `${dt.toISOString().slice(0, 19)}${offset}`;
}

/** Alias em snake_case para paridade com o Rust. */
export const format_datetime_nfe = formatDatetimeNfe;

/** Monta o grupo `<ide>` de identificação da NF-e/NFC-e. */
export function buildIde(data: FiscalRecord, numericCode?: string, accessKey?: string): string {
  const issuer = (data.issuer ?? {}) as FiscalRecord;
  const state = String(issuer.state_code ?? issuer.stateCode ?? "SP");
  const stateIbge = String(data.state_ibge ?? getStateCode(state));
  const issuedAt = data.issued_at ?? data.issuedAt ?? new Date();
  const children = [
    tag("cUF", stateIbge),
    tag("cNF", String(numericCode ?? data.numeric_code ?? data.numericCode ?? "00000000")),
    tag("natOp", String(data.operation_nature ?? data.operationNature ?? "VENDA")),
    tag("mod", String(data.model ?? 55)),
    tag("serie", String(data.series ?? 1)),
    tag("nNF", String(data.number ?? data.invoice_number ?? 1)),
    tag("dhEmi", formatDatetimeNfe(issuedAt as string | Date, state)),
    tag("tpNF", String(data.operation_type ?? data.operationType ?? 1)),
    tag("idDest", String(data.destination_indicator ?? data.destinationIndicator ?? 1)),
    tag("cMunFG", String(issuer.city_code ?? issuer.cityCode ?? "")),
    tag("tpImp", String(data.print_format ?? data.printFormat ?? 1)),
    tag("tpEmis", String(data.emission_type ?? data.emissionType ?? 1)),
    tag("cDV", accessKey ? accessKey.slice(43, 44) : String(data.check_digit ?? data.checkDigit ?? "")),
    tag("tpAmb", String(data.environment ?? 2)),
    tag("finNFe", String(data.purpose_code ?? data.purposeCode ?? 1)),
    tag("indFinal", String(data.consumer_type ?? data.consumerType ?? 0)),
    tag("indPres", String(data.buyer_presence ?? data.buyerPresence ?? 0)),
    tag("procEmi", String(data.emission_process ?? data.emissionProcess ?? 0)),
    tag("verProc", String(data.ver_proc ?? data.verProc ?? "fiscal-js")),
  ];
  return rawTag("ide", children.join(""));
}

/** Alias em snake_case para paridade com o Rust. */
export const build_ide = buildIde;
