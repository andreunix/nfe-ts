import { NFE_NAMESPACE, NFE_VERSION } from "../../fiscal-core/constants.ts";
import { FiscalError } from "../../fiscal-core/error.ts";
import { getStateCode } from "../../fiscal-core/state_codes.ts";
import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";
import { stripXmlDeclaration, taxIdXmlTag, validateAccessKey } from "./helpers.ts";

/** Envolve uma NF-e assinada em `<enviNFe>` para autorização. */
export function buildAutorizacaoRequest(xml: string, lotId: string, sync: boolean, _compressed = false): string {
  if (!xml) throw new Error("XML content is required for authorization request");
  return `<enviNFe xmlns="${NFE_NAMESPACE}" versao="${NFE_VERSION}"><idLote>${lotId}</idLote><indSinc>${sync ? 1 : 0}</indSinc>${stripXmlDeclaration(xml)}</enviNFe>`;
}

/** Envolve lote de NF-e assinadas em `<enviNFe>`. */
export function buildAutorizacaoBatchRequest(xmls: string[], idLote: string, indSinc: number): string {
  if (xmls.length === 0) throw FiscalError.validation("At least one NF-e XML is required for batch authorization");
  if (xmls.length > 50) throw FiscalError.validation(`Batch authorization accepts at most 50 NF-e documents, got ${xmls.length}`);
  if (indSinc === 1 && xmls.length > 1) throw FiscalError.validation(`Synchronous mode (indSinc=1) accepts only 1 NF-e, got ${xmls.length}`);
  const body = xmls.map(stripXmlDeclaration).join("");
  return `<enviNFe xmlns="${NFE_NAMESPACE}" versao="${NFE_VERSION}"><idLote>${idLote}</idLote><indSinc>${indSinc}</indSinc>${body}</enviNFe>`;
}

/** XML de consulta de status do serviço NF-e. */
export function buildStatusRequest(uf: string, environment: SefazEnvironment): string {
  const cuf = getStateCode(uf);
  return `<consStatServ xmlns="${NFE_NAMESPACE}" versao="${NFE_VERSION}"><tpAmb>${environment}</tpAmb><cUF>${cuf}</cUF><xServ>STATUS</xServ></consStatServ>`;
}

/** XML de consulta de situação por chave de acesso. */
export function buildConsultaRequest(accessKey: string, environment: SefazEnvironment): string {
  validateAccessKey(accessKey);
  return `<consSitNFe xmlns="${NFE_NAMESPACE}" versao="${NFE_VERSION}"><tpAmb>${environment}</tpAmb><xServ>CONSULTAR</xServ><chNFe>${accessKey}</chNFe></consSitNFe>`;
}

/** XML de consulta de recibo de lote assíncrono. */
export function buildConsultaReciboRequest(receipt: string, environment: SefazEnvironment): string {
  if (!receipt) throw new Error("Receipt number (recibo) is required");
  return `<consReciNFe xmlns="${NFE_NAMESPACE}" versao="${NFE_VERSION}"><tpAmb>${environment}</tpAmb><nRec>${receipt}</nRec></consReciNFe>`;
}

/** XML de inutilização de faixa numérica. */
export function buildInutilizacaoRequest(year: number, taxId: string, model: string, series: number, startNumber: number, endNumber: number, justification: string, environment: SefazEnvironment, uf: string): string {
  const cuf = getStateCode(uf);
  const digits = taxId.replace(/\D/g, "");
  const padded = digits.padStart(14, "0");
  const id = `ID${cuf}${String(year).padStart(2, "0")}${padded}${model.padStart(2, "0")}${String(series).padStart(3, "0")}${String(startNumber).padStart(9, "0")}${String(endNumber).padStart(9, "0")}`;
  const taxTag = digits.length === 11 ? `<CPF>${digits}</CPF>` : `<CNPJ>${digits}</CNPJ>`;
  return `<inutNFe xmlns="${NFE_NAMESPACE}" versao="${NFE_VERSION}"><infInut Id="${id}"><tpAmb>${environment}</tpAmb><xServ>INUTILIZAR</xServ><cUF>${cuf}</cUF><ano>${String(year).padStart(2, "0")}</ano>${taxTag}<mod>${model}</mod><serie>${series}</serie><nNFIni>${startNumber}</nNFIni><nNFFin>${endNumber}</nNFFin><xJust>${justification}</xJust></infInut></inutNFe>`;
}

/** XML de distribuição DF-e por ultNSU, NSU específico ou chave de acesso. */
export function buildDistDfeRequest(uf: string, taxId: string, nsu: string | undefined, accessKey: string | undefined, environment: SefazEnvironment): string {
  const cuf = getStateCode(uf);
  const queryTag = accessKey
    ? (/^\d{44}$/.test(accessKey) ? `<consChNFe><chNFe>${accessKey}</chNFe></consChNFe>` : `<consNSU><NSU>${accessKey}</NSU></consNSU>`)
    : nsu
      ? (nsu === "000000000000000" || nsu.startsWith("0") ? `<distNSU><ultNSU>${nsu}</ultNSU></distNSU>` : `<consNSU><NSU>${nsu}</NSU></consNSU>`)
      : "<distNSU><ultNSU>000000000000000</ultNSU></distNSU>";
  return `<distDFeInt xmlns="${NFE_NAMESPACE}" versao="1.01"><tpAmb>${environment}</tpAmb><cUFAutor>${cuf}</cUFAutor>${taxIdXmlTag(taxId)}${queryTag}</distDFeInt>`;
}

/** XML de consulta cadastral. */
export function buildCadastroRequest(uf: string, searchType: string, searchValue: string): string {
  const filter = searchType === "CNPJ" ? `<CNPJ>${searchValue}</CNPJ>` : searchType === "IE" ? `<IE>${searchValue}</IE>` : searchType === "CPF" ? `<CPF>${searchValue}</CPF>` : "";
  return `<ConsCad xmlns="${NFE_NAMESPACE}" versao="2.00"><infCons><xServ>CONS-CAD</xServ><UF>${uf}</UF>${filter}</infCons></ConsCad>`;
}

/** XML de administração de CSC NFC-e. */
export function buildCscRequest(environment: SefazEnvironment, indOp: number, cnpj: string, cscId?: string, cscCode?: string): string {
  const raizCnpj = cnpj.replace(/\D/g, "").slice(0, 8);
  const dados = indOp === 3 ? `<dadosCsc><idCsc>${cscId ?? ""}</idCsc><codigoCsc>${cscCode ?? ""}</codigoCsc></dadosCsc>` : "";
  return `<admCscNFCe versao="1.00" xmlns="${NFE_NAMESPACE}"><tpAmb>${environment}</tpAmb><indOp>${indOp}</indOp><raizCNPJ>${raizCnpj}</raizCNPJ>${dados}</admCscNFCe>`;
}

export const build_autorizacao_request = buildAutorizacaoRequest;
export const build_autorizacao_batch_request = buildAutorizacaoBatchRequest;
export const build_status_request = buildStatusRequest;
export const build_consulta_request = buildConsultaRequest;
export const build_consulta_recibo_request = buildConsultaReciboRequest;
export const build_inutilizacao_request = buildInutilizacaoRequest;
export const build_dist_dfe_request = buildDistDfeRequest;
export const build_cadastro_request = buildCadastroRequest;
export const build_csc_request = buildCscRequest;

