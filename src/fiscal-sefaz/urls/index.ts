import { SefazEnvironment, InvoiceModel } from "../../fiscal-core/types/enums.ts";

type EnvUrls = Record<string, string>;

const NFE_PROD: Record<string, EnvUrls> = {
  SP: {
    NfeStatusServico: "https://nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx",
    NfeAutorizacao: "https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
    NfeRetAutorizacao: "https://nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx",
    NfeConsultaProtocolo: "https://nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx",
    NfeInutilizacao: "https://nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx",
    RecepcaoEvento: "https://nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx",
    NfeConsultaCadastro: "https://nfe.fazenda.sp.gov.br/ws/cadconsultacadastro4.asmx",
  },
  SVRS: {
    NfeStatusServico: "https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
    NfeAutorizacao: "https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
    NfeRetAutorizacao: "https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
    NfeConsultaProtocolo: "https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
    NfeInutilizacao: "https://nfe.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx",
    RecepcaoEvento: "https://nfe.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx",
  },
  AN: {
    NfeDistribuicaoDFe: "https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx",
    NfeConsultaDest: "https://www.nfe.fazenda.gov.br/NFeConsultaDest/NFeConsultaDest.asmx",
    NfeDownloadNF: "https://www.nfe.fazenda.gov.br/NfeDownloadNF/NfeDownloadNF.asmx",
  },
};

const NFE_HOM: Record<string, EnvUrls> = {
  SP: {
    NfeStatusServico: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx",
    NfeAutorizacao: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
    NfeRetAutorizacao: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx",
    NfeConsultaProtocolo: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx",
    NfeInutilizacao: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx",
    RecepcaoEvento: "https://homologacao.nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx",
    NfeConsultaCadastro: "https://homologacao.nfe.fazenda.sp.gov.br/ws/cadconsultacadastro4.asmx",
  },
  SVRS: {
    NfeStatusServico: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
    NfeAutorizacao: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
    NfeRetAutorizacao: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
    NfeConsultaProtocolo: "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
    NfeInutilizacao: "https://nfe-homologacao.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx",
    RecepcaoEvento: "https://nfe-homologacao.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx",
  },
  AN: {
    NfeDistribuicaoDFe: "https://hom.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx",
    NfeConsultaDest: "https://hom.nfe.fazenda.gov.br/NFeConsultaDest/NFeConsultaDest.asmx",
    NfeDownloadNF: "https://hom.nfe.fazenda.gov.br/NfeDownloadNF/NfeDownloadNF.asmx",
  },
};

const SVRS_STATES = new Set(["AC", "AL", "AP", "DF", "ES", "PB", "PI", "RJ", "RN", "RO", "RR", "SC", "SE", "TO", "RS"]);

/** Retorna o autorizador de contingência SVC para a UF. */
export function getStateContingencyAuthorizer(uf: string): "SVC-AN" | "SVC-RS" {
  return ["AC", "AL", "AP", "DF", "ES", "MG", "PB", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"].includes(uf.toUpperCase()) ? "SVC-AN" : "SVC-RS";
}

function authorizer(uf: string): string {
  const upper = uf.toUpperCase();
  if (upper === "AN") return "AN";
  if (upper === "SP") return "SP";
  return SVRS_STATES.has(upper) ? "SVRS" : upper;
}

/** Resolve URL SEFAZ NF-e/NFC-e por UF, ambiente e serviço. */
export function getSefazUrl(uf: string, environment: SefazEnvironment, service: string): string | undefined {
  const table = environment === SefazEnvironment.Production ? NFE_PROD : NFE_HOM;
  return table[authorizer(uf)]?.[service] ?? table.SVRS?.[service];
}

/** Resolve URL considerando modelo fiscal. */
export function getSefazUrlForModel(uf: string, environment: SefazEnvironment, service: string, model: InvoiceModel | number): string | undefined {
  if (Number(model) === InvoiceModel.Nfce) return getNfceUrl(uf, environment, service);
  return getSefazUrl(uf, environment, service);
}

/** Resolve serviço nacional AN. */
export function getAnUrl(environment: SefazEnvironment, service: string): string | undefined {
  return getSefazUrl("AN", environment, service);
}

/** Resolve URL de contingência SVC usando o autorizador alternativo. */
export function getSefazContingencyUrl(uf: string, environment: SefazEnvironment, service: string): string | undefined {
  const auth = getStateContingencyAuthorizer(uf) === "SVC-AN" ? "AN" : "SVRS";
  return getSefazUrl(auth, environment, service);
}

/** Resolve URL NFC-e quando conhecida; cai para URL NF-e quando o serviço é comum. */
export function getNfceUrl(uf: string, environment: SefazEnvironment, service: string): string | undefined {
  const upper = uf.toUpperCase();
  if (upper === "SP" && service === "NfeAutorizacao") {
    return environment === SefazEnvironment.Production ? "https://nfce.fazenda.sp.gov.br/ws/NFeAutorizacao4.asmx" : "https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeAutorizacao4.asmx";
  }
  return getSefazUrl(uf, environment, service);
}

/** URL de consulta pública NFC-e. */
export function getNfceConsultUrl(uf: string, environment: SefazEnvironment): string | undefined {
  const upper = uf.toUpperCase();
  if (upper === "SP") return environment === SefazEnvironment.Production ? "https://www.nfce.fazenda.sp.gov.br/consulta" : "https://www.homologacao.nfce.fazenda.sp.gov.br/consulta";
  return undefined;
}

/** URL base de QR Code NFC-e. */
export function getNfceQrUrl(uf: string, environment: SefazEnvironment): string | undefined {
  const upper = uf.toUpperCase();
  if (upper === "SP") return environment === SefazEnvironment.Production ? "https://www.nfce.fazenda.sp.gov.br/qrcode" : "https://www.homologacao.nfce.fazenda.sp.gov.br/qrcode";
  return undefined;
}

export const get_sefaz_url = getSefazUrl;
export const get_sefaz_url_for_model = getSefazUrlForModel;
export const get_an_url = getAnUrl;
export const get_state_contingency_authorizer = getStateContingencyAuthorizer;
export const get_sefaz_contingency_url = getSefazContingencyUrl;
export const get_nfce_url = getNfceUrl;
export const get_nfce_consult_url = getNfceConsultUrl;
export const get_nfce_qr_url = getNfceQrUrl;

