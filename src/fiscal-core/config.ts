import { FiscalError } from "./error.ts";
import { digitsOnly } from "./sanitize.ts";
import { getStateCode } from "./state_codes.ts";

/** Configuração opcional de proxy HTTP para comunicação com a SEFAZ. */
export interface ProxyConfig {
  /** IP ou host do proxy. */
  proxyIp?: string | null;
  /** Porta do proxy. */
  proxyPort?: string | null;
  /** Usuário de autenticação do proxy. */
  proxyUser?: string | null;
  /** Senha de autenticação do proxy. */
  proxyPass?: string | null;
}

/** Configuração fiscal validada, equivalente ao `FiscalConfig` do Rust. */
export interface FiscalConfig {
  /** Data/hora da última atualização da configuração. */
  atualizacao?: string | null;
  /** Ambiente: 1 produção, 2 homologação. */
  tpAmb: 1 | 2;
  /** Razão social do emitente. */
  razaosocial: string;
  /** UF do emitente. */
  siglaUF: string;
  /** CPF/CNPJ do emitente somente com dígitos. */
  cnpj: string;
  /** Pasta/identificador de schemas. */
  schemes: string;
  /** Versão do layout NF-e. */
  versao: string;
  /** Token IBPT opcional. */
  tokenIBPT?: string | null;
  /** Código de segurança do contribuinte NFC-e. */
  CSC?: string | null;
  /** ID do CSC NFC-e. */
  CSCid?: string | null;
  /** Configuração de proxy opcional. */
  aProxyConf?: ProxyConfig | null;
}

/** Valida o JSON de configuração fiscal no padrão do sped-nfe. */
export function validateConfig(json: string): FiscalConfig {
  if (!json) throw FiscalError.validation("Não foi passado um json válido.");

  let raw: Record<string, unknown>;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("root is not object");
    }
    raw = parsed as Record<string, unknown>;
  } catch (error) {
    throw FiscalError.validation(`Não foi passado um json válido: ${String(error)}`);
  }

  const errors: string[] = [];
  const tpAmb = Number(raw.tpAmb ?? raw.tp_amb);
  const razaosocial = stringField(raw.razaosocial);
  const siglaUF = stringField(raw.siglaUF ?? raw.sigla_uf).toUpperCase();
  const cnpj = digitsOnly(stringField(raw.cnpj));
  const schemes = stringField(raw.schemes);
  const versao = stringField(raw.versao);

  if (tpAmb !== 1 && tpAmb !== 2) errors.push("[tpAmb] Valor inválido. Esperado 1 (produção) ou 2 (homologação)");
  if (!razaosocial) errors.push("[razaosocial] Campo obrigatório");
  if (!siglaUF) errors.push("[siglaUF] Campo obrigatório");
  if (siglaUF && siglaUF.length !== 2) errors.push("[siglaUF] Deve conter exatamente 2 caracteres");
  if (siglaUF) {
    try {
      getStateCode(siglaUF);
    } catch {
      errors.push(`[siglaUF] UF inválida: ${siglaUF}`);
    }
  }
  if (!cnpj) errors.push("[cnpj] Campo obrigatório");
  if (cnpj && cnpj.length !== 11 && cnpj.length !== 14) errors.push("[cnpj] Deve conter 11 ou 14 dígitos");
  if (!schemes) errors.push("[schemes] Campo obrigatório");
  if (!versao) errors.push("[versao] Campo obrigatório");
  if (errors.length > 0) throw FiscalError.validation(errors.join("\n"));

  return {
    atualizacao: nullableString(raw.atualizacao),
    tpAmb: tpAmb as 1 | 2,
    razaosocial,
    siglaUF,
    cnpj,
    schemes,
    versao,
    tokenIBPT: nullableString(raw.tokenIBPT ?? raw.token_ibpt),
    CSC: nullableString(raw.CSC ?? raw.csc),
    CSCid: nullableString(raw.CSCid ?? raw.csc_id),
    aProxyConf: normalizeProxy(raw.aProxyConf ?? raw.a_proxy_conf),
  };
}

/** Alias em snake_case para paridade com o Rust. */
export const validate_config = validateConfig;

function stringField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function nullableString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return typeof value === "string" ? value : String(value);
}

function normalizeProxy(value: unknown): ProxyConfig | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  return {
    proxyIp: nullableString(raw.proxyIp ?? raw.proxy_ip),
    proxyPort: nullableString(raw.proxyPort ?? raw.proxy_port),
    proxyUser: nullableString(raw.proxyUser ?? raw.proxy_user),
    proxyPass: nullableString(raw.proxyPass ?? raw.proxy_pass),
  };
}
