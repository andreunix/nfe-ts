/** Resultado de autorização NF-e (`retEnviNFe`). */
export interface AuthorizationResponse {
  statusCode: string;
  statusMessage: string;
  protocolNumber?: string;
  protocolXml?: string;
  authorizedAt?: string;
  receiptNumber?: string;
}

/** Resultado de status de serviço SEFAZ (`retConsStatServ`). */
export interface StatusResponse {
  statusCode: string;
  statusMessage: string;
  averageTime?: string;
}

/** Resultado de evento de cancelamento NF-e (`retEvento`). */
export interface CancellationResponse {
  statusCode: string;
  statusMessage: string;
  protocolNumber?: string;
  signedEventXml: string;
  rawResponse: string;
}

/** Resultado de distribuição DF-e (`retDistDFeInt`). */
export interface DistDFeResponse {
  statusCode: string;
  statusMessage: string;
  ultNsu?: string;
  maxNsu?: string;
  rawXml: string;
}

/** Resultado de inutilização (`retInutNFe`). */
export interface InutilizacaoResponse {
  tpAmb: string;
  verAplic: string;
  cStat: string;
  xMotivo: string;
  cUf: string;
  ano: string;
  cnpj: string;
  cpf?: string;
  modelo: string;
  serie: string;
  nNfIni: string;
  nNfFin: string;
  dhRecbto?: string;
  nProt?: string;
}

/** Token CSC de NFC-e. */
export interface CscToken {
  idCsc: string;
  csc: string;
}

/** Resultado de administração CSC NFC-e (`retAdmCscNFCe`). */
export interface CscResponse {
  tpAmb: string;
  indOp: string;
  cStat: string;
  xMotivo: string;
  tokens: CscToken[];
}

/** Resultado de consulta de cadastro (`retConsCad`). */
export interface CadastroResponse {
  statusCode: string;
  statusMessage: string;
  ie?: string;
  situacao?: string;
  nome?: string;
  rawXml: string;
}

/** Protocolo individual em consulta recibo NF-e. */
export interface ProtocolInfo {
  tpAmb: string;
  verAplic: string;
  chNfe: string;
  dhRecbto?: string;
  nProt?: string;
  digVal?: string;
  cStat: string;
  xMotivo: string;
}

/** Resultado de consulta recibo (`retConsReciNFe`). */
export interface ConsultaReciboResponse {
  tpAmb: string;
  verAplic: string;
  nRec: string;
  cStat: string;
  xMotivo: string;
  cUf: string;
  protocols: ProtocolInfo[];
}

/** Resultado de consulta situação (`retConsSitNFe`). */
export interface ConsultaSituacaoResponse {
  tpAmb: string;
  verAplic: string;
  cStat: string;
  xMotivo: string;
  cUf: string;
  chNfe?: string;
  protocolXml?: string;
  eventXmls: string[];
}
