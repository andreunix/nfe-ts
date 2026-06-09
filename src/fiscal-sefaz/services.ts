/**
 * Metadados dos web services SEFAZ.
 *
 * Cada serviço NF-e/NFC-e precisa de tres informações para montar SOAP:
 * nome do metodo, operação WSDL e versão do XML em `versaoDados`.
 */
export interface ServiceMeta {
  /** Nome do metodo SOAP exposto pelo web service. */
  method: string;
  /** Operação WSDL usada no namespace SOAP. */
  operation: string;
  /** Versão dos dados enviada no cabeçalho ou wrapper. */
  version: string;
}

/** Serviços NF-e/NFC-e conhecidos pela camada SEFAZ. */
export enum SefazService {
  StatusServico = "StatusServico",
  Autorizacao = "Autorizacao",
  RetAutorizacao = "RetAutorizacao",
  ConsultaProtocolo = "ConsultaProtocolo",
  Inutilizacao = "Inutilizacao",
  RecepcaoEvento = "RecepcaoEvento",
  DistribuicaoDFe = "DistribuicaoDFe",
  ConsultaCadastro = "ConsultaCadastro",
  CscNFCe = "CscNFCe",
  RecepcaoEPEC = "RecepcaoEPEC",
  EPECStatusServico = "EPECStatusServico",
  RecepcaoEpecNfce = "RecepcaoEpecNfce",
  EpecNfceStatusServico = "EpecNfceStatusServico",
  NfeConsultaDest = "NfeConsultaDest",
  NfeDownloadNF = "NfeDownloadNF",
}

const META: Record<SefazService, ServiceMeta> = {
  [SefazService.StatusServico]: { method: "nfeStatusServicoNF", operation: "NFeStatusServico4", version: "4.00" },
  [SefazService.Autorizacao]: { method: "nfeAutorizacaoLote", operation: "NFeAutorizacao4", version: "4.00" },
  [SefazService.RetAutorizacao]: { method: "nfeRetAutorizacaoLote", operation: "NFeRetAutorizacao4", version: "4.00" },
  [SefazService.ConsultaProtocolo]: { method: "nfeConsultaNF", operation: "NFeConsultaProtocolo4", version: "4.00" },
  [SefazService.Inutilizacao]: { method: "nfeInutilizacaoNF", operation: "NFeInutilizacao4", version: "4.00" },
  [SefazService.RecepcaoEvento]: { method: "nfeRecepcaoEvento", operation: "NFeRecepcaoEvento4", version: "1.00" },
  [SefazService.DistribuicaoDFe]: { method: "nfeDistDFeInteresse", operation: "NFeDistribuicaoDFe", version: "1.01" },
  [SefazService.ConsultaCadastro]: { method: "consultaCadastro", operation: "CadConsultaCadastro4", version: "2.00" },
  [SefazService.CscNFCe]: { method: "admCscNFCe", operation: "CscNFCe", version: "1.00" },
  [SefazService.RecepcaoEPEC]: { method: "nfeRecepcaoEvento", operation: "RecepcaoEvento", version: "1.00" },
  [SefazService.EPECStatusServico]: { method: "nfeStatusServicoNF2", operation: "NfeStatusServico2", version: "4.00" },
  [SefazService.RecepcaoEpecNfce]: { method: "nfeRecepcaoEvento", operation: "RecepcaoEvento", version: "1.00" },
  [SefazService.EpecNfceStatusServico]: { method: "nfeStatusServicoNF2", operation: "NfeStatusServico2", version: "4.00" },
  [SefazService.NfeConsultaDest]: { method: "nfeConsultaNFDest", operation: "NfeConsultaDest", version: "1.01" },
  [SefazService.NfeDownloadNF]: { method: "nfeDownloadNF", operation: "NfeDownloadNF", version: "4.00" },
};

const URL_KEYS: Record<SefazService, string> = {
  [SefazService.StatusServico]: "NfeStatusServico",
  [SefazService.Autorizacao]: "NfeAutorizacao",
  [SefazService.RetAutorizacao]: "NfeRetAutorizacao",
  [SefazService.ConsultaProtocolo]: "NfeConsultaProtocolo",
  [SefazService.Inutilizacao]: "NfeInutilizacao",
  [SefazService.RecepcaoEvento]: "RecepcaoEvento",
  [SefazService.DistribuicaoDFe]: "NfeDistribuicaoDFe",
  [SefazService.ConsultaCadastro]: "NfeConsultaCadastro",
  [SefazService.CscNFCe]: "CscNFCe",
  [SefazService.RecepcaoEPEC]: "RecepcaoEPEC",
  [SefazService.EPECStatusServico]: "EPECStatusServico",
  [SefazService.RecepcaoEpecNfce]: "RecepcaoEPEC",
  [SefazService.EpecNfceStatusServico]: "EPECStatusServico",
  [SefazService.NfeConsultaDest]: "NfeConsultaDest",
  [SefazService.NfeDownloadNF]: "NfeDownloadNF",
};

/** Retorna os metadados SOAP do serviço. */
export function getServiceMeta(service: SefazService): ServiceMeta {
  return META[service];
}

/** Retorna a chave usada nas tabelas de URL. */
export function getServiceUrlKey(service: SefazService): string {
  return URL_KEYS[service];
}

export const get_service_meta = getServiceMeta;
export const get_service_url_key = getServiceUrlKey;

