import type { AutXml, Documento, Endereco, FiscalDate, Icms, InfRespTec } from "./types.ts";

export interface BpeBuildData {
  numeric_code?: string;
  emit_cnpj: string;
  ide: IdeBpe;
  emit: BpeEmit;
  comp?: Comprador;
  inf_valor: InfValorBpe;
  inf_viagem: InfViagem[];
  inf_passagem: InfPassagem;
  imp: BpeImp;
  pag: Pagamento[];
  aut_xml?: AutXml[];
  inf_resp_tec?: InfRespTec;
}

export interface IdeBpe {
  c_uf: string;
  tp_amb: string;
  serie: number;
  n_bp: number;
  modal: string;
  dh_emi: FiscalDate;
  tp_emis: string;
  ver_proc?: string;
  tp_bpe: string;
  ind_pres: string;
  uf_ini: string;
  c_mun_ini: string;
  uf_fim: string;
  c_mun_fim: string;
  dh_cont?: string;
  x_just?: string;
}

export interface BpeEmit {
  cnpj: string;
  ie: string;
  iest?: string;
  x_nome: string;
  x_fant?: string;
  im?: string;
  crt: string;
  ender_emit: Endereco;
  tar?: string;
}

export interface Comprador {
  x_nome: string;
  doc: Documento;
  ie?: string;
  ender_comp?: Endereco;
}

export interface InfValorBpe {
  v_bp: string;
  v_desconto: string;
  v_pgto: string;
  v_troco: string;
  comp: CompBpe[];
}

export interface CompBpe {
  tp_comp: string;
  v_comp: string;
}

export interface InfViagem {
  c_percurso: string;
  x_percurso: string;
  tp_viagem: string;
  tp_serv: string;
  tp_acomodacao: string;
  tp_trecho?: string;
  dh_viagem: string;
  prefixo?: string;
  poltrona?: string;
  plataforma?: string;
}

export interface InfPassagem {
  c_loc_orig: string;
  x_loc_orig: string;
  c_loc_dest: string;
  x_loc_dest: string;
  dh_emb: string;
  dh_validade: string;
  passageiro?: Passageiro;
}

export interface Passageiro {
  x_nome: string;
  cpf?: string;
  tp_doc?: string;
  n_doc?: string;
  fone?: string;
}

export interface BpeImp {
  icms: Icms;
  v_tot_trib?: string;
}

export interface Pagamento {
  t_pag: string;
  x_pag?: string;
  v_pag: string;
}
