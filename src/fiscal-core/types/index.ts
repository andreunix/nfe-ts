import type { FiscalRecord } from "../core.ts";
import type { Cents, Rate, Rate4 } from "../newtypes/monetary.ts";

/**
 * Estruturas públicas de dados NF-e/NFC-e.
 *
 * Nesta etapa da porta, esses tipos preservam a superfície pública dos structs
 * Rust como registros abertos. A separação por nomes mantém os contratos de
 * domínio claros enquanto a modelagem TypeScript pode evoluir gradualmente.
 */
export * from "./enums.ts";

/** Base aberta para todos os dados fiscais. */
export interface FiscalData extends FiscalRecord {}

/** Dados cadastrais e endereço do emitente. */
export interface IssuerData extends FiscalData {
  tax_id?: string;
  taxId?: string;
  legal_name?: string;
  name?: string;
  trade_name?: string;
  state_code?: string;
  city_code?: string;
  street?: string;
  street_number?: string;
  district?: string;
  city_name?: string;
  zip_code?: string;
  state_tax_id?: string;
  tax_regime?: number;
}
/** Dados cadastrais e endereço do destinatário. */
export interface RecipientData extends FiscalData {
  tax_id?: string;
  taxId?: string;
  name?: string;
  state_code?: string;
  state_tax_id?: string;
  street?: string;
  street_number?: string;
  district?: string;
  city_code?: string;
  city_name?: string;
  zip_code?: string;
  email?: string;
  ind_ie_dest?: string | number;
}
/** Dados de justificativa e início de contingência no documento. */
export interface ContingencyData extends FiscalData {
  reason?: string;
  at?: Date | string;
}
/** Dados de pagamento (`pag`/`detPag`). */
export interface PaymentData extends FiscalData {
  method?: string;
  amount?: Cents | number | string;
  ind_pag?: string;
  x_pag?: string;
}
/** Detalhes de cartão dentro do pagamento. */
export interface PaymentCardDetail extends FiscalData {
  integ_type?: string;
  card_tax_id?: string;
  card_brand?: string;
  auth_code?: string;
}
/** Documento fiscal referenciado. */
export type ReferenceDoc = FiscalData | string;
/** Dados da transportadora. */
export interface CarrierData extends FiscalData {}
/** ICMS retido no transporte. */
export interface RetainedIcmsTransp extends FiscalData {}
/** Dados gerais de transporte. */
export interface TransportData extends FiscalData {
  mod_frete?: string | number;
  carrier?: CarrierData;
  vehicle?: VehicleData;
  volumes?: VolumeData[];
}
/** Dados de veículo de transporte. */
export interface VehicleData extends FiscalData {}
/** Dados de volumes transportados. */
export interface VolumeData extends FiscalData {}
/** Grupo de cobrança/faturamento. */
export interface BillingData extends FiscalData {
  invoice?: BillingInvoice;
  installments?: Installment[];
}
/** Dados da fatura. */
export interface BillingInvoice extends FiscalData {}
/** Dados de duplicata/parcela. */
export interface Installment extends FiscalData {}
/** Informações adicionais do documento. */
export interface AdditionalInfo extends FiscalData {
  taxpayer_note?: string;
  tax_authority_note?: string;
}
/** Dados de exportação. */
export interface ExportData extends FiscalData {}
/** Campo textual nomeado usado em observações. */
export interface FieldText extends FiscalData {
  field?: string;
  text?: string;
}
/** Dados de intermediador de transação. */
export interface IntermediaryData extends FiscalData {}
/** Dados de local de retirada ou entrega. */
export interface LocationData extends FiscalData {}
/** Referência a processo administrativo ou judicial. */
export interface ProcessRef extends FiscalData {}
/** Dados de compra/pedido/contrato. */
export interface PurchaseData extends FiscalData {}
/** Responsável técnico pelo sistema emissor. */
export interface TechResponsibleData extends FiscalData {}
/** Dados de crédito presumido. */
export interface GCredData extends FiscalData {}
/** Dados de tributos retidos. */
export interface RetTribData extends FiscalData {}
/** Dados completos de um item da nota. */
export interface InvoiceItemData extends FiscalData {
  product_code?: string;
  description?: string;
  name?: string;
  ncm?: string;
  cfop?: string;
  unit?: string;
  quantity?: string | number;
  unit_price?: Cents | number | string;
  total_price?: Cents | number | string;
  taxable_unit?: string;
  taxable_quantity?: string | number;
  taxable_unit_price?: Cents | number | string;
  icms?: FiscalRecord;
  pis?: FiscalRecord;
  cofins?: FiscalRecord;
  ipi?: FiscalRecord;
  ii?: FiscalRecord;
  ind_tot?: string | number;
}
/** Totais ISSQN informados no documento. */
export interface IssqnTotData extends FiscalData {}
/** Dados de ICMS monofásico. */
export interface IcmsMonoData extends FiscalData {
  q_bc_mono?: number;
  ad_rem_icms?: Rate | number;
  v_icms_mono?: Cents | number;
}
/** Certificado digital em memória. */
export interface CertificateData extends FiscalData {
  private_key?: string;
  privateKey?: string;
  certificate?: string;
  cert?: string;
  pfx?: string | Uint8Array;
  password?: string;
}
/** Metadados extraídos do certificado. */
export interface CertificateInfo extends FiscalData {
  common_name?: string;
  valid_from?: string;
  valid_until?: string;
  serial_number?: string;
  issuer?: string;
  subject?: string;
}
/** Parâmetros usados para compor chave de acesso. */
export interface AccessKeyParams extends FiscalData {
  state_code?: string;
  year_month?: string;
  tax_id?: string;
  model?: number | string;
  series?: number | string;
  number?: number | string;
  emission_type?: number | string;
  numeric_code?: string;
}
/** XML autorizado com metadados do emitente. */
export interface AuthorizedXml extends FiscalData {}
/** Dados agregados para construir uma NF-e/NFC-e. */
export interface InvoiceBuildData extends FiscalData {
  issuer?: IssuerData;
  environment?: number;
  model?: number;
  schema_version?: string;
  series?: number;
  number?: number;
  emission_type?: number;
  issued_at?: Date | string;
  operation_nature?: string;
  items?: InvoiceItemData[];
  recipient?: RecipientData;
  payments?: PaymentData[];
  transport?: TransportData;
}
/** Resultado da construção de XML da nota. */
export interface InvoiceXmlResult extends FiscalData {
  xml?: string;
  access_key?: string;
  accessKey?: string;
}
/** Dados agropecuários PL_010. */
export interface AgropecuarioData extends FiscalData {}
/** Dados de defensivo agropecuário. */
export interface AgropecuarioDefensivoData extends FiscalData {}
/** Dados de guia agropecuária. */
export interface AgropecuarioGuiaData extends FiscalData {}
/** Dados do grupo cana. */
export interface CanaData extends FiscalData {}
/** Dados de compra governamental. */
export interface CompraGovData extends FiscalData {}
/** Dados de dedução. */
export interface DeducData extends FiscalData {}
/** Dados de fornecimento diário. */
export interface ForDiaData extends FiscalData {}
/** Dados de pagamento antecipado. */
export interface PagAntecipadoData extends FiscalData {}
/** Adição de declaração de importação. */
export interface AdiData extends FiscalData {}
/** Dados de armas. */
export interface ArmaData extends FiscalData {}
/** Dados de CIDE. */
export interface CideData extends FiscalData {}
/** Dados de combustíveis. */
export interface CombData extends FiscalData {}
/** Documento fiscal eletrônico referenciado por item. */
export interface DFeReferenciadoData extends FiscalData {}
/** Detalhe de exportação por item. */
export interface DetExportData extends FiscalData {}
/** Declaração de importação. */
export interface DiData extends FiscalData {}
/** Dados de encerrante de combustível. */
export interface EncerranteData extends FiscalData {}
/** Dados de imposto devolvido. */
export interface ImpostoDevolData extends FiscalData {}
/** Dados de medicamentos. */
export interface MedData extends FiscalData {}
/** Campo de observação por item. */
export interface ObsField extends FiscalData {}
/** Observações do item. */
export interface ObsItemData extends FiscalData {}
/** Origem de combustível. */
export interface OrigCombData extends FiscalData {}
/** Dados de rastreabilidade. */
export interface RastroData extends FiscalData {}
/** Dados específicos de veículos novos. */
export interface VeicProdData extends FiscalData {}
