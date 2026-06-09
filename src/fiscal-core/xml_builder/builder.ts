import type { FiscalRecord } from "../core.ts";
import { FiscalError } from "../error.ts";
import { Cents } from "../newtypes/monetary.ts";
import { getStateCode } from "../state_codes.ts";
import { CalculationMethod, EmissionType, InvoiceModel, SchemaVersion, SefazEnvironment } from "../types/enums.ts";
import type { InvoiceXmlResult } from "../types/index.ts";
import { rawTag } from "../xml_utils.ts";
import { buildAccessKey, formatYearMonth, generateNumericCode } from "./access_key.ts";
import { buildDest } from "./dest.ts";
import { buildDet } from "./det/index.ts";
import { buildEmit } from "./emit.ts";
import { buildIde } from "./ide.ts";
import { buildPag } from "./pag.ts";
import { buildTotal } from "./total.ts";
import { buildTransp } from "./transp.ts";
import { buildAutXml, buildCobr, buildDelivery, buildWithdrawal } from "./optional.ts";

/** Marcador de estado: nota em montagem. */
export class Draft {}
/** Marcador de estado: XML gerado, ainda sem assinatura. */
export class Built {}
/** Marcador de estado: XML assinado. */
export class Signed {}

/** Builder encadeável para montar XML NF-e/NFC-e. */
export class InvoiceBuilder<State = Draft> {
  private data: FiscalRecord;
  private resultXml?: string;
  private resultAccessKey?: string;
  private resultSignedXml?: string;

  /** Cria um builder em estado de rascunho. */
  constructor(issuer: FiscalRecord, environment: SefazEnvironment | number, model: InvoiceModel | number) {
    this.data = {
      issuer,
      environment,
      model,
      schema_version: SchemaVersion.PL009,
      series: 1,
      number: 1,
      emission_type: EmissionType.Normal,
      issued_at: new Date(),
      operation_nature: "VENDA",
      items: [],
      payments: [],
      calculation_method: CalculationMethod.V2,
    };
  }

  /** Fábrica equivalente a `InvoiceBuilder::new` do Rust. */
  static new(issuer: FiscalRecord, environment: SefazEnvironment | number, model: InvoiceModel | number): InvoiceBuilder<Draft> {
    return new InvoiceBuilder<Draft>(issuer, environment, model);
  }

  private set(key: string, value: unknown): this {
    this.data[key] = value;
    return this;
  }

  series(value: number): this { return this.set("series", value); }
  invoiceNumber(value: number): this { return this.set("number", value); }
  invoice_number(value: number): this { return this.invoiceNumber(value); }
  emissionType(value: EmissionType | number): this { return this.set("emission_type", value); }
  emission_type(value: EmissionType | number): this { return this.emissionType(value); }
  schemaVersion(value: SchemaVersion): this { return this.set("schema_version", value); }
  schema_version(value: SchemaVersion): this { return this.schemaVersion(value); }
  issuedAt(value: Date | string): this { return this.set("issued_at", value); }
  issued_at(value: Date | string): this { return this.issuedAt(value); }
  operationNature(value: string): this { return this.set("operation_nature", value); }
  operation_nature(value: string): this { return this.operationNature(value); }
  addItem(item: FiscalRecord): this { (this.data.items as FiscalRecord[]).push(item); return this; }
  add_item(item: FiscalRecord): this { return this.addItem(item); }
  items(items: FiscalRecord[]): this { return this.set("items", items); }
  recipient(value: FiscalRecord): this { return this.set("recipient", value); }
  payments(value: FiscalRecord[]): this { return this.set("payments", value); }
  changeAmount(value: Cents | number): this { return this.set("change_amount", value); }
  change_amount(value: Cents | number): this { return this.changeAmount(value); }
  transport(value: FiscalRecord): this { return this.set("transport", value); }
  billing(value: FiscalRecord): this { return this.set("billing", value); }
  withdrawal(value: FiscalRecord): this { return this.set("withdrawal", value); }
  delivery(value: FiscalRecord): this { return this.set("delivery", value); }
  authorizedXml(value: FiscalRecord[]): this { return this.set("authorized_xml", value); }
  authorized_xml(value: FiscalRecord[]): this { return this.authorizedXml(value); }
  additionalInfo(value: FiscalRecord): this { return this.set("additional_info", value); }
  additional_info(value: FiscalRecord): this { return this.additionalInfo(value); }
  onlyAscii(value: boolean): this { return this.set("only_ascii", value); }
  only_ascii(value: boolean): this { return this.onlyAscii(value); }
  calculationMethod(value: CalculationMethod): this { return this.set("calculation_method", value); }
  calculation_method(value: CalculationMethod): this { return this.calculationMethod(value); }
  vNfTotOverride(value: Cents | number): this { return this.set("v_nf_tot_override", value); }
  v_nf_tot_override(value: Cents | number): this { return this.vNfTotOverride(value); }

  /** Gera o XML e transiciona conceitualmente para estado `Built`. */
  build(): InvoiceBuilder<Built> {
    const result = buildFromData(this.data);
    const built = new InvoiceBuilder<Built>(this.data.issuer as FiscalRecord, this.data.environment as number, this.data.model as number);
    built.data = { ...this.data };
    built.resultXml = result.xml as string;
    built.resultAccessKey = result.access_key as string;
    return built;
  }

  /** Retorna o XML não assinado depois de `build()`. */
  xml(): string {
    if (!this.resultXml) throw FiscalError.xmlGeneration("XML ainda não foi gerado.");
    return this.resultXml;
  }

  /** Retorna a chave de acesso depois de `build()`. */
  accessKey(): string {
    if (!this.resultAccessKey) throw FiscalError.xmlGeneration("Chave de acesso ainda não foi gerada.");
    return this.resultAccessKey;
  }

  access_key(): string {
    return this.accessKey();
  }

  /** Aplica uma função de assinatura ao XML gerado. */
  signWith(signer: (xml: string) => string): InvoiceBuilder<Signed> {
    const signed = new InvoiceBuilder<Signed>(this.data.issuer as FiscalRecord, this.data.environment as number, this.data.model as number);
    signed.data = { ...this.data };
    signed.resultXml = this.xml();
    signed.resultAccessKey = this.accessKey();
    signed.resultSignedXml = signer(this.xml());
    return signed;
  }

  sign_with(signer: (xml: string) => string): InvoiceBuilder<Signed> {
    return this.signWith(signer);
  }

  /** Retorna o XML assinado depois de `signWith()`. */
  signedXml(): string {
    if (!this.resultSignedXml) throw FiscalError.xmlGeneration("XML ainda não foi assinado.");
    return this.resultSignedXml;
  }

  signed_xml(): string {
    return this.signedXml();
  }

  /** Retorna o XML não assinado, mesmo em estado assinado. */
  unsignedXml(): string {
    return this.xml();
  }

  unsigned_xml(): string {
    return this.unsignedXml();
  }
}

/** Monta XML diretamente a partir de um objeto completo de dados. */
export function buildFromData(data: FiscalRecord): InvoiceXmlResult {
  const issuer = (data.issuer ?? {}) as FiscalRecord;
  const stateCode = String(issuer.state_code ?? issuer.stateCode ?? "SP");
  const stateIbge = getStateCode(stateCode);
  const numericCode = String(data.numeric_code ?? generateNumericCode());
  const accessKey = buildAccessKey({
    state_code: stateIbge,
    year_month: String(data.year_month ?? formatYearMonth(data.issued_at as string | Date | undefined)),
    tax_id: String(issuer.tax_id ?? issuer.taxId ?? ""),
    model: data.model as never,
    series: data.series as never,
    number: (data.number ?? data.invoice_number) as never,
    emission_type: data.emission_type as never,
    numeric_code: numericCode,
  });
  const items = (Array.isArray(data.items) ? data.items : []) as FiscalRecord[];
  const dets = items.map((item, index) => buildDet(item, index + 1));
  const totalProducts = items.reduce((sum, item) => sum + Number(item.total_price ?? item.v_prod ?? item.vProd ?? 0), 0);
  const infChildren = [
    buildIde({ ...data, state_ibge: stateIbge }, numericCode, accessKey),
    buildEmit(data),
    buildDest(data) ?? "",
    ...(Array.isArray(data.authorized_xml) ? (data.authorized_xml as FiscalRecord[]).map(buildAutXml) : []),
    ...(data.withdrawal ? [buildWithdrawal(data.withdrawal as FiscalRecord)] : []),
    ...(data.delivery ? [buildDelivery(data.delivery as FiscalRecord)] : []),
    ...dets.map((det) => det.xml),
    buildTotal(totalProducts, {}, {}, data),
    buildTransp(data.transport as FiscalRecord | undefined),
    buildPag(data.payments as FiscalRecord[] | undefined, data.change_amount),
    ...(data.billing ? [buildCobr(data.billing as FiscalRecord)] : []),
  ].join("");
  const infNFe = rawTag("infNFe", { Id: `NFe${accessKey}`, versao: "4.00" }, infChildren);
  const xml = rawTag("NFe", { xmlns: "http://www.portalfiscal.inf.br/nfe" }, infNFe);
  return { xml, access_key: accessKey, accessKey };
}

/** Alias em snake_case para paridade com o Rust. */
export const build_from_data = buildFromData;
