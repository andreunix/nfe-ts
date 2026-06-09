import { FiscalError } from "../../fiscal-core/error.ts";
import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";
import { brtTimestamp } from "../request_builders/helpers.ts";
import { extractTagValue, stripSoapEnvelope } from "../response_parsers/helpers.ts";
import { MDFE_NAMESPACE, MDFE_VERSION } from "./index.ts";

export const EV_ENCERRAMENTO = 110112;
export const EV_CANCELAMENTO = 110111;
export const EV_INCLUSAO_CONDUTOR = 110114;
export const EV_INCLUSAO_DFE = 110115;

function taxIdTag(taxId: string): string {
  const digits = taxId.replace(/\D/g, "");
  return digits.length === 11 ? `<CPF>${digits}</CPF>` : `<CNPJ>${digits}</CNPJ>`;
}

function buildEvento(chMdfe: string, tpEvento: number, seq: number, taxId: string, environment: SefazEnvironment, detInner: string, cOrgao?: string): string {
  if (!/^\d{44}$/.test(chMdfe)) throw new Error("MDF-e access key must be exactly 44 digits");
  const id = `ID${tpEvento}${chMdfe}${String(seq).padStart(2, "0")}`;
  return `<eventoMDFe xmlns="${MDFE_NAMESPACE}" versao="${MDFE_VERSION}"><infEvento Id="${id}"><cOrgao>${cOrgao ?? chMdfe.slice(0, 2)}</cOrgao><tpAmb>${environment}</tpAmb>${taxIdTag(taxId)}<chMDFe>${chMdfe}</chMDFe><dhEvento>${brtTimestamp()}</dhEvento><tpEvento>${tpEvento}</tpEvento><nSeqEvento>${seq}</nSeqEvento><detEvento versaoEvento="${MDFE_VERSION}">${detInner}</detEvento></infEvento></eventoMDFe>`;
}

/** Monta evento MDF-e de encerramento (`110112`). */
export function buildMdfeEncerramento(chMdfe: string, protocol: string, dtEnc: string, cUf: string, cMun: string, seq: number, taxId: string, environment: SefazEnvironment): string {
  const det = `<evEncMDFe><descEvento>Encerramento</descEvento><nProt>${protocol}</nProt><dtEnc>${dtEnc}</dtEnc><cUF>${cUf}</cUF><cMun>${cMun}</cMun></evEncMDFe>`;
  return buildEvento(chMdfe, EV_ENCERRAMENTO, seq, taxId, environment, det);
}

/** Monta evento MDF-e de cancelamento (`110111`). */
export function buildMdfeCancelamento(chMdfe: string, protocol: string, justification: string, seq: number, taxId: string, environment: SefazEnvironment): string {
  const len = [...justification].length;
  if (len < 15 || len > 255) throw new Error(`cancellation justification (xJust) must be 15-255 chars, got ${len}`);
  const det = `<evCancMDFe><descEvento>Cancelamento</descEvento><nProt>${protocol}</nProt><xJust>${justification}</xJust></evCancMDFe>`;
  return buildEvento(chMdfe, EV_CANCELAMENTO, seq, taxId, environment, det);
}

/** Monta evento MDF-e de inclusão de condutor (`110114`). */
export function buildMdfeInclusaoCondutor(chMdfe: string, driverName: string, driverCpf: string, seq: number, taxId: string, environment: SefazEnvironment): string {
  const cpf = driverCpf.replace(/\D/g, "");
  const det = `<evIncCondutorMDFe><descEvento>Inclusao Condutor</descEvento><condutor><xNome>${driverName}</xNome><CPF>${cpf}</CPF></condutor></evIncCondutorMDFe>`;
  return buildEvento(chMdfe, EV_INCLUSAO_CONDUTOR, seq, taxId, environment, det);
}

/** Grupo de descarga para inclusão de DF-e no MDF-e. */
export interface IncDfeDischarge {
  cMunDescarga: string;
  xMunDescarga: string;
  nfeKeys: string[];
}

/** Monta evento MDF-e de inclusão de DF-e (`110115`). */
export function buildMdfeInclusaoDfe(chMdfe: string, protocol: string, cMunCarrega: string, xMunCarrega: string, discharges: IncDfeDischarge[], seq: number, taxId: string, environment: SefazEnvironment): string {
  if (discharges.length === 0) throw new Error("Inclusão de DF-e requires at least one discharge municipality");
  const infDocs = discharges.map((d) => `<infDoc><cMunDescarga>${d.cMunDescarga}</cMunDescarga><xMunDescarga>${d.xMunDescarga}</xMunDescarga>${d.nfeKeys.map((key) => `<chNFe>${key}</chNFe>`).join("")}</infDoc>`).join("");
  const det = `<evIncDFeMDFe><descEvento>Inclusao DF-e</descEvento><nProt>${protocol}</nProt><cMunCarrega>${cMunCarrega}</cMunCarrega><xMunCarrega>${xMunCarrega}</xMunCarrega>${infDocs}</evIncDFeMDFe>`;
  return buildEvento(chMdfe, EV_INCLUSAO_DFE, seq, taxId, environment, det);
}

/** Resultado de evento MDF-e. */
export interface MdfeEventResponse {
  statusCode: string;
  statusMessage: string;
  eventType?: string;
  accessKey?: string;
  protocolNumber?: string;
  registeredAt?: string;
  signedEventXml: string;
  rawResponse: string;
  isRegistered(): boolean;
  is_registered(): boolean;
}

/** Parseia resposta de evento MDF-e. */
export function parseMdfeEventResponse(xml: string): MdfeEventResponse {
  const body = stripSoapEnvelope(xml);
  const statusCode = extractTagValue(body, "cStat");
  if (!statusCode) throw FiscalError.xmlParsing("missing <cStat> in MDF-e event response");
  return {
    statusCode,
    statusMessage: extractTagValue(body, "xMotivo") ?? "",
    eventType: extractTagValue(body, "tpEvento"),
    accessKey: extractTagValue(body, "chMDFe"),
    protocolNumber: extractTagValue(body, "nProt"),
    registeredAt: extractTagValue(body, "dhRegEvento"),
    signedEventXml: "",
    rawResponse: "",
    isRegistered() {
      return this.statusCode === "135" || this.statusCode === "136";
    },
    is_registered() {
      return this.isRegistered();
    },
  };
}

export const parse_mdfe_event_response = parseMdfeEventResponse;
export const build_mdfe_encerramento = buildMdfeEncerramento;
export const build_mdfe_cancelamento = buildMdfeCancelamento;
export const build_mdfe_inclusao_condutor = buildMdfeInclusaoCondutor;
export const build_mdfe_inclusao_dfe = buildMdfeInclusaoDfe;
