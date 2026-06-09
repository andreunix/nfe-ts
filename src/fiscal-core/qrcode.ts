import { FiscalError } from "./error.ts";
import { AccessKey } from "./newtypes/access_key.ts";
import { QrCodeVersion, SefazEnvironment } from "./types/enums.ts";
import { rawTag, tag } from "./xml_utils.ts";
import { sha1Hex } from "./crypto.ts";

/** Parâmetros para montar a URL de QR Code da NFC-e. */
export interface NfceQrCodeParams {
  /** Chave de acesso da NFC-e com 44 dígitos. */
  accessKey: string;
  /** Versão do QR Code; por padrão usa V2. */
  version?: QrCodeVersion | number;
  /** Ambiente SEFAZ usado na emissão. */
  environment: SefazEnvironment | number;
  /** URL base de consulta QR Code da UF autorizadora. */
  qrCodeBaseUrl: string;
  /** Token CSC fornecido pela SEFAZ. */
  cscToken?: string;
  /** Identificador do CSC fornecido pela SEFAZ. */
  cscId?: string;
  /** Data/hora de emissão usada no QR Code v1. */
  issuedAt?: string;
  /** Valor total da nota usado no QR Code v1. */
  totalValue?: string;
  /** Valor total de ICMS usado no QR Code v1. */
  totalIcms?: string;
  /** Digest da assinatura usado no QR Code v1. */
  digestValue?: string;
  /** Documento do destinatário quando exigido no QR Code v1. */
  destDocument?: string;
  /** Nome do parâmetro do documento do destinatário. */
  destIdType?: string;
  /** Função opcional para assinar/hashar o payload, usada em testes ou integrações. */
  signFn?: (payload: string) => string;
}

/** Parâmetros para inserir `<infNFeSupl>` no XML NFC-e. */
export interface PutQRTagParams {
  /** XML da NFC-e que receberá a tag suplementar. */
  xml: string;
  /** URL completa do QR Code. */
  qrCodeUrl: string;
  /** URL de consulta por chave. */
  consultUrl: string;
}

/** Monta a URL de QR Code NFC-e nas versões 1 ou 2. */
export function buildNfceQrCodeUrl(params: NfceQrCodeParams): string {
  const accessKey = new AccessKey(params.accessKey).toString();
  const version = Number(params.version ?? QrCodeVersion.V2);
  const baseUrl = params.qrCodeBaseUrl.replace(/[?&]+$/, "");

  if (version === 1) {
    const required = [params.environment, params.issuedAt, params.totalValue, params.totalIcms, params.digestValue, params.cscToken, params.cscId];
    if (required.some((value) => value === undefined || value === "")) {
      throw FiscalError.validation("NFC-e QR Code v1 requires issuedAt, totalValue, totalIcms, digestValue, cscToken, and cscId.");
    }
    const query = new URLSearchParams({
      chNFe: accessKey,
      nVersao: "100",
      tpAmb: String(params.environment),
      dhEmi: params.issuedAt!,
      vNF: params.totalValue!,
      vICMS: params.totalIcms!,
      digVal: params.digestValue!,
      cIdToken: params.cscId!,
    });
    if (params.destDocument) query.set(params.destIdType ?? "doc", params.destDocument);
    query.set("cHashQRCode", (params.signFn ?? sha1Hex)(`${query.toString()}${params.cscToken}`).toUpperCase());
    return `${baseUrl}?${query.toString()}`;
  }

  if (!params.cscToken || !params.cscId) throw FiscalError.validation("NFC-e QR Code v2 requires cscToken and cscId.");
  const payload = `${accessKey}|2|${params.environment}|${params.cscId}`;
  const hash = (params.signFn ?? sha1Hex)(`${payload}${params.cscToken}`).toUpperCase();
  return `${baseUrl}?${new URLSearchParams({ p: `${payload}|${hash}` }).toString()}`;
}
export const build_nfce_qr_code_url = buildNfceQrCodeUrl;

/** Monta a URL de consulta NFC-e por chave de acesso. */
export function buildNfceConsultUrl(baseUrl: string, accessKey: string, environment?: SefazEnvironment | number): string {
  const key = new AccessKey(accessKey).toString();
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("chNFe", key);
    if (environment !== undefined) url.searchParams.set("tpAmb", String(environment));
    return url.toString();
  } catch {
    const separator = baseUrl.includes("?") ? "&" : "?";
    const env = environment === undefined ? "" : `&tpAmb=${encodeURIComponent(String(environment))}`;
    return `${baseUrl}${separator}chNFe=${encodeURIComponent(key)}${env}`;
  }
}
export const build_nfce_consult_url = buildNfceConsultUrl;

/** Insere ou substitui o grupo `<infNFeSupl>` dentro do XML NFC-e. */
export function putQrTag(params: PutQRTagParams): string {
  const infNFeSupl = rawTag("infNFeSupl", `${rawTag("qrCode", `<![CDATA[${params.qrCodeUrl}]]>`)}${tag("urlChave", params.consultUrl)}`);
  if (params.xml.includes("<infNFeSupl>")) {
    return params.xml.replace(/<infNFeSupl>[\s\S]*?<\/infNFeSupl>/, infNFeSupl);
  }
  if (!params.xml.includes("</NFe>")) throw FiscalError.xml("Cannot inject QR tag: missing </NFe>.");
  return params.xml.replace("</NFe>", `${infNFeSupl}</NFe>`);
}
export const put_qr_tag = putQrTag;
