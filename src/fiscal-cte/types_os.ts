import type { AutXml, Compl, Documento, Emit, Endereco, FiscalDate, Imp, InfRespTec, VPrest } from "./types.ts";

export interface CteOsBuildData {
  numeric_code?: string;
  emit_cnpj: string;
  ide: IdeOs;
  compl?: Compl;
  emit: Emit;
  toma: TomaOs;
  v_prest: VPrest;
  imp: Imp;
  inf_cte_norm: InfCteNormOs;
  aut_xml?: AutXml[];
  inf_resp_tec?: InfRespTec;
}

export interface IdeOs {
  c_uf: string;
  cfop: string;
  nat_op: string;
  serie: number;
  n_ct: number;
  dh_emi: FiscalDate;
  tp_imp: string;
  tp_emis: string;
  tp_amb: string;
  tp_cte: string;
  proc_emi?: string;
  ver_proc?: string;
  c_mun_env: string;
  x_mun_env: string;
  uf_env: string;
  modal: string;
  tp_serv: string;
  ind_ie_toma: string;
  c_mun_ini: string;
  x_mun_ini: string;
  uf_ini: string;
  c_mun_fim: string;
  x_mun_fim: string;
  uf_fim: string;
  inf_percurso?: string[];
  dh_cont?: string;
  x_just?: string;
}

export interface TomaOs {
  doc: Documento;
  ie?: string;
  x_nome: string;
  x_fant?: string;
  fone?: string;
  ender_toma: Endereco;
  email?: string;
}

export interface InfCteNormOs {
  inf_servico: InfServico;
  inf_doc_ref?: InfDocRef[];
  seg?: Seg[];
  inf_modal: InfModalOs;
}

export interface InfServico {
  x_desc_serv: string;
  q_carga?: string;
}

export interface InfDocRef {
  n_doc?: string;
  serie?: string;
  subserie?: string;
  d_emi?: string;
  v_doc?: string;
  ch_bpe?: string;
}

export interface Seg {
  resp_seg: string;
  x_seg?: string;
  n_apol?: string;
}

export interface InfModalOs {
  versao_modal: string;
  rodo_os: RodoOs;
}

export interface RodoOs {
  taf?: string;
  nro_reg_estadual?: string;
  veic?: VeicOs;
  inf_fretamento?: InfFretamento;
}

export interface VeicOs {
  placa: string;
  renavam?: string;
  prop?: PropOs;
  uf?: string;
}

export interface PropOs {
  doc: Documento;
  x_nome?: string;
  ie?: string;
  uf?: string;
  tp_prop: string;
}

export interface InfFretamento {
  tp_fretamento: string;
  dh_viagem?: string;
}
