export interface Endpoints {
  homologacao: string;
  producao: string;
}

export interface ProviderMetadata {
  nome: string;
  municipios: readonly string[];
  endpoints?: Endpoints;
  soap_action?: string;
}

export const DSF: ProviderMetadata = {
  nome: "DSF",
  municipios: ["3552205"],
  endpoints: {
    homologacao: "https://homolsod.dsfweb.com.br/notafiscal-abrasfv203-ws/NotaFiscalSoap",
    producao: "https://notafiscal.sorocaba.sp.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap",
  },
  soap_action: "",
};

export const GINFES: ProviderMetadata = {
  nome: "GINFES",
  municipios: ["3518800"],
  endpoints: {
    homologacao: "https://homologacao.ginfes.com.br/ServiceGinfesImpl",
    producao: "https://producao.ginfes.com.br/ServiceGinfesImpl",
  },
  soap_action: "",
};

export const SIGISS: ProviderMetadata = {
  nome: "SigISS",
  municipios: ["3513801"],
  endpoints: {
    homologacao: "https://testecaraguatatuba.meumunicipio.online/abrasf/ws/nfs",
    producao: "https://caraguatatuba.meumunicipio.online/abrasf/ws/nfs",
  },
  soap_action: "nfs#GerarNfse",
};

export const SAOPAULO: ProviderMetadata = {
  nome: "SAOPAULO",
  municipios: ["3550308"],
  endpoints: {
    homologacao: "https://nfews.prefeitura.sp.gov.br/lotenfe.asmx",
    producao: "https://nfews.prefeitura.sp.gov.br/lotenfe.asmx",
  },
};

export const Simpliss = {
  nome: "Simpliss",
  municipios: ["3547304"],
  endpoints: {
    homologacao: "https://homologacaoabrasf.simplissweb.com.br/v2/nfsen",
    producao: "https://santanadeparnaiba.simplissweb.com.br/v2/nfsen",
  },
} satisfies ProviderMetadata;

export const SPEEDGOV = Simpliss;

export const ALL_PROVIDERS = [DSF, GINFES, SIGISS, SAOPAULO, SPEEDGOV] as const;
