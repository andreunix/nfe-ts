/** Modelo do documento fiscal: NF-e modelo 55 ou NFC-e modelo 65. */
export enum InvoiceModel {
  /** NF-e modelo 55, usada em operações B2B e circulação de mercadorias. */
  Nfe = 55,
  /** NFC-e modelo 65, usada em venda ao consumidor final. */
  Nfce = 65,
}

/** Ambiente de envio para a SEFAZ. */
export enum SefazEnvironment {
  /** Produção, com validade fiscal. */
  Production = 1,
  /** Homologação, usado para testes sem validade fiscal. */
  Homologation = 2,
}

/** Versão lógica do layout de schema NF-e suportada pelo builder. */
export enum SchemaVersion {
  /** PL_009_V4, sem tags da reforma tributária. */
  PL009 = "PL009",
  /** PL_010, com tags de IBS/CBS/IS e grupos correlatos. */
  PL010 = "PL010",
}

/** Tipo de emissão (`tpEmis`) do documento fiscal. */
export enum EmissionType {
  /** Emissão normal online. */
  Normal = 1,
  /** Contingência FS-IA. */
  FsIa = 2,
  /** Contingência EPEC. */
  Epec = 4,
  /** Contingência FS-DA. */
  FsDa = 5,
  /** Contingência SVC-AN. */
  SvcAn = 6,
  /** Contingência SVC-RS. */
  SvcRs = 7,
  /** Contingência offline. */
  Offline = 9,
}

/** Estratégia de cálculo de totais, preservada por compatibilidade com a API Rust/PHP. */
export enum CalculationMethod {
  /** Calcula a partir de valores acumulados em estruturas. */
  V1 = 1,
  /** Calcula a partir dos grupos XML já construídos. */
  V2 = 2,
}

/** Regime tributário do emitente (`CRT`). */
export enum TaxRegime {
  /** Simples Nacional. */
  SimplesNacional = 1,
  /** Simples Nacional com excesso de sublimite. */
  SimplesExcess = 2,
  /** Regime normal. */
  Normal = 3,
}

/** Tipo lógico de contingência escolhido para emissão fiscal. */
export enum ContingencyType {
  /** Sefaz Virtual do Ambiente Nacional. */
  SvcAn = "svc-an",
  /** Sefaz Virtual do Rio Grande do Sul. */
  SvcRs = "svc-rs",
  /** Evento Prévio de Emissão em Contingência. */
  Epec = "epec",
  /** Formulário de Segurança - Documento Auxiliar. */
  FsDa = "fs-da",
  /** Formulário de Segurança - Impressor Autônomo. */
  FsIa = "fs-ia",
  /** Emissão offline sem acesso à SEFAZ. */
  Offline = "offline",
}

/** Versão do QR Code NFC-e. */
export enum QrCodeVersion {
  /** QR Code versão 1. */
  V1 = 1,
  /** QR Code versão 2. */
  V2 = 2,
}

/** Converte valores de enum numéricos ou string para representação textual. */
export function enumAsString(value: string | number): string {
  return String(value);
}

/** Indica se o schema informado deve emitir grupos exclusivos do PL_010. */
export function schemaIsPl010(schema: SchemaVersion | string | undefined): boolean {
  return schema === SchemaVersion.PL010 || schema === "PL010";
}

/** Retorna o identificador kebab-case do tipo de contingência. */
export function contingencyTypeString(value: ContingencyType): string {
  return value;
}

/** Retorna o identificador maiúsculo usado em JSON/interop para contingência. */
export function contingencyTypeToTypeString(value: ContingencyType): string {
  switch (value) {
    case ContingencyType.SvcAn:
      return "SVCAN";
    case ContingencyType.SvcRs:
      return "SVCRS";
    case ContingencyType.Epec:
      return "EPEC";
    case ContingencyType.FsDa:
      return "FSDA";
    case ContingencyType.FsIa:
      return "FSIA";
    case ContingencyType.Offline:
      return "OFFLINE";
  }
}

/** Converte identificadores de contingência (`SVCAN`, `svc-an`, etc.) para enum. */
export function contingencyTypeFromTypeString(value: string): ContingencyType | undefined {
  switch (value.toUpperCase().replace(/[-_]/g, "")) {
    case "SVCAN":
      return ContingencyType.SvcAn;
    case "SVCRS":
      return ContingencyType.SvcRs;
    case "EPEC":
      return ContingencyType.Epec;
    case "FSDA":
      return ContingencyType.FsDa;
    case "FSIA":
      return ContingencyType.FsIa;
    case "OFFLINE":
      return ContingencyType.Offline;
    default:
      return undefined;
  }
}

/** Mapeia um tipo de contingência para o código `tpEmis` correspondente. */
export function contingencyTypeEmissionType(value: ContingencyType): EmissionType {
  switch (value) {
    case ContingencyType.SvcAn:
      return EmissionType.SvcAn;
    case ContingencyType.SvcRs:
      return EmissionType.SvcRs;
    case ContingencyType.Epec:
      return EmissionType.Epec;
    case ContingencyType.FsDa:
      return EmissionType.FsDa;
    case ContingencyType.FsIa:
      return EmissionType.FsIa;
    case ContingencyType.Offline:
      return EmissionType.Offline;
  }
}
