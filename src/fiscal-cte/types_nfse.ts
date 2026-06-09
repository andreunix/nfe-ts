import type { Documento, FiscalDate } from "./types.ts";

export interface DpsBuildData {
  ide: IdeDps;
  prest: Prestador;
  toma?: Pessoa;
  serv: Servico;
  valores: Valores;
  ibscbs?: Ibscbs;
}

export interface IdeDps {
  tp_amb: string;
  dh_emi: FiscalDate;
  ver_aplic?: string;
  serie: string;
  n_dps: number;
  d_compet: string;
  tp_emit: string;
  c_loc_emi: string;
}

export interface Prestador {
  doc: Documento;
  im?: string;
  x_nome: string;
  end?: EnderNac;
  fone?: string;
  email?: string;
  reg_trib: RegTrib;
}

export interface RegTrib {
  op_simp_nac: string;
  reg_esp_trib: string;
}

export interface Pessoa {
  doc: Documento;
  im?: string;
  x_nome: string;
  end?: EnderNac;
  fone?: string;
  email?: string;
}

export interface EnderNac {
  x_lgr: string;
  nro: string;
  x_cpl?: string;
  x_bairro: string;
  c_mun: string;
  cep: string;
}

export interface Servico {
  c_loc_prestacao: string;
  c_trib_nac: string;
  c_trib_mun?: string;
  x_desc_serv: string;
}

export interface Valores {
  v_serv: string;
  trib: Trib;
}

export interface Trib {
  trib_mun: TribMun;
  trib_fed?: TribFed;
}

export interface TribMun {
  trib_issqn: string;
  p_aliq?: string;
  tp_ret_issqn: string;
}

export interface TribFed {
  piscofins?: PisCofins;
  v_ret_cp?: string;
  v_ret_irrf?: string;
  v_ret_csll?: string;
}

export interface PisCofins {
  cst: string;
  v_bc?: string;
  p_aliq_pis?: string;
  p_aliq_cofins?: string;
  v_pis?: string;
  v_cofins?: string;
  tp_ret?: string;
}

export interface Ibscbs {
  fin_nfse: string;
  ind_final?: string;
  c_ind_op: string;
  ind_dest: string;
  cst: string;
  c_class_trib: string;
  c_cred_pres?: string;
}
