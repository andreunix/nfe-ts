export enum Ambiente {
  Producao = "Producao",
  Homologacao = "Homologacao",
}

export function ambienteFromTpAmb(tp: number): Ambiente {
  return tp === 1 ? Ambiente.Producao : Ambiente.Homologacao;
}

export const ambiente_from_tp_amb = ambienteFromTpAmb;

export interface MunicipalEndereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  c_mun: string;
  uf: string;
  cep: string;
}

export interface Emitente {
  cnpj: string;
  im?: string;
  razao_social: string;
  c_mun: string;
  uf: string;
  endereco?: MunicipalEndereco;
  optante_simples?: boolean;
}

export interface Tomador {
  doc?: string;
  razao_social?: string;
  email?: string;
  endereco?: MunicipalEndereco;
  im?: string;
}

export interface Servico {
  valor_centavos: number;
  valor_deducoes_centavos?: number;
  aliquota_iss?: string;
  iss_retido?: boolean;
  item_lista_servico: string;
  cod_tributacao_municipio?: string;
  cnae?: string;
  discriminacao: string;
  c_mun_prestacao?: string;
  nbs?: string;
  c_class_trib?: string;
  c_ind_op?: string;
}

export interface Rps {
  numero: number;
  serie: string;
  tipo?: number;
  data_emissao: string;
  tomador: Tomador;
  servico: Servico;
  natureza_operacao?: string;
  regime_especial_tributacao?: string;
  incentivador_cultural?: boolean;
  intermediario?: Intermediario;
}

export interface Intermediario {
  doc: string;
  im?: string;
  iss_retido?: boolean;
}

export interface EmitInput {
  emitente: Emitente;
  rps: Rps;
}

export interface CancelInput {
  numero_nfse: string;
  codigo_verificacao?: string;
  motivo: string;
  codigo_motivo?: string;
}

export enum Status {
  Autorizado = "Autorizado",
  Rejeitado = "Rejeitado",
  Processando = "Processando",
  Cancelado = "Cancelado",
}

export interface EmitOutput {
  status: Status;
  numero_nfse?: string;
  codigo_verificacao?: string;
  protocolo?: string;
  data_emissao?: string;
  xml?: string;
  motivo?: string;
  link?: string;
  raw: string;
}
