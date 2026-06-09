import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";
import { brtTimestamp } from "../request_builders/helpers.ts";
import { CTE_NAMESPACE, CTE_VERSION } from "./index.ts";

export const EV_CCE = 110110;
export const EV_CANCELAMENTO = 110111;
export const EV_PREST_DESACORDO = 610110;

/** Um grupo `infCorrecao` de evento CCe CT-e. */
export interface CteCorrecao {
  grupoAlterado: string;
  campoAlterado: string;
  valorAlterado: string;
  nroItemAlterado?: string;
}

function taxIdTag(taxId: string): string {
  const digits = taxId.replace(/\D/g, "");
  return digits.length === 11 ? `<CPF>${digits}</CPF>` : `<CNPJ>${digits}</CNPJ>`;
}

function buildEvento(chCte: string, tpEvento: number, seq: number, taxId: string, environment: SefazEnvironment, detInner: string): string {
  if (!/^\d{44}$/.test(chCte)) throw new Error("CT-e access key must be exactly 44 digits");
  const id = `ID${tpEvento}${chCte}${String(seq).padStart(3, "0")}`;
  return `<eventoCTe xmlns="${CTE_NAMESPACE}" versao="${CTE_VERSION}"><infEvento Id="${id}"><cOrgao>${chCte.slice(0, 2)}</cOrgao><tpAmb>${environment}</tpAmb>${taxIdTag(taxId)}<chCTe>${chCte}</chCTe><dhEvento>${brtTimestamp()}</dhEvento><tpEvento>${tpEvento}</tpEvento><nSeqEvento>${seq}</nSeqEvento><detEvento versaoEvento="${CTE_VERSION}">${detInner}</detEvento></infEvento></eventoCTe>`;
}

/** Evento de cancelamento CT-e. */
export function buildCteCancelamento(chCte: string, protocol: string, justification: string, seq: number, taxId: string, environment: SefazEnvironment): string {
  const len = [...justification].length;
  if (len < 15 || len > 255) throw new Error(`cancellation justification (xJust) must be 15-255 chars, got ${len}`);
  const det = `<evCancCTe><descEvento>Cancelamento</descEvento><nProt>${protocol}</nProt><xJust>${justification}</xJust></evCancCTe>`;
  return buildEvento(chCte, EV_CANCELAMENTO, seq, taxId, environment, det);
}

/** Evento de Carta de Correção CT-e. */
export function buildCteCce(chCte: string, correcoes: CteCorrecao[], seq: number, taxId: string, environment: SefazEnvironment): string {
  if (correcoes.length === 0) throw new Error("CCe requires at least one infCorrecao group");
  const cond = "A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, de 15 de dezembro de 1970 e pode ser utilizada para regularizacao de erro ocorrido na emissao de documento fiscal, desde que o erro nao esteja relacionado com: I - as variaveis que determinam o valor do imposto tais como: base de calculo, aliquota, diferenca de preco, quantidade, valor da operacao ou da prestacao; II - a correcao de dados cadastrais que implique mudanca do remetente ou do destinatario; III - a data de emissao ou de saida.";
  const grupos = correcoes.map((c) => `<infCorrecao><grupoAlterado>${c.grupoAlterado}</grupoAlterado><campoAlterado>${c.campoAlterado}</campoAlterado><valorAlterado>${c.valorAlterado}</valorAlterado><nroItemAlterado>${c.nroItemAlterado ?? "1"}</nroItemAlterado></infCorrecao>`).join("");
  return buildEvento(chCte, EV_CCE, seq, taxId, environment, `<evCCeCTe><descEvento>Carta de Correcao</descEvento>${grupos}<xCondUso>${cond}</xCondUso></evCCeCTe>`);
}

/** Evento de prestação do serviço em desacordo. */
export function buildCteDesacordo(chCte: string, xObs: string, seq: number, taxId: string, environment: SefazEnvironment): string {
  return buildEvento(chCte, EV_PREST_DESACORDO, seq, taxId, environment, `<evPrestDesacordo><descEvento>Prestacao do Servico em Desacordo</descEvento><indDesacordoOper>1</indDesacordoOper><xObs>${xObs}</xObs></evPrestDesacordo>`);
}

export const build_cte_cancelamento = buildCteCancelamento;
export const build_cte_cce = buildCteCce;
export const build_cte_desacordo = buildCteDesacordo;

