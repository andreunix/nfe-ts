export type FiscalDate = Date | string;

export interface CteBuildData {
  ide: Ide;
  compl?: Compl;
  emit: Emit;
  rem?: Party;
  exped?: Party;
  receb?: Party;
  dest?: Party;
  v_prest: VPrest;
  imp: Imp;
  inf_cte_norm: InfCteNorm;
  inf_cte_comp?: string[];
  aut_xml?: AutXml[];
  inf_resp_tec?: InfRespTec;
  emit_cnpj: string;
  numeric_code?: string;
}

export interface Ide {
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
  ind_globalizado?: string;
  c_mun_env: string;
  x_mun_env: string;
  uf_env: string;
  modal: string;
  tp_serv: string;
  c_mun_ini: string;
  x_mun_ini: string;
  uf_ini: string;
  c_mun_fim: string;
  x_mun_fim: string;
  uf_fim: string;
  retira: string;
  x_det_retira?: string;
  ind_ie_toma: string;
  toma: Tomador;
}

export type Tomador =
  | { kind: "toma3"; toma: string }
  | { kind: "toma4"; toma?: string; doc: Documento; ie?: string; x_nome: string; x_fant?: string; fone?: string; ender_toma: Endereco; email?: string }
  | { Toma3: { toma: string } }
  | { Toma4: { toma?: string; doc: Documento; ie?: string; x_nome: string; x_fant?: string; fone?: string; ender_toma: Endereco; email?: string } };

export type Documento =
  | { CNPJ: string }
  | { CPF: string }
  | { Cnpj: string }
  | { Cpf: string }
  | { type: "CNPJ" | "CPF"; value: string }
  | { kind: "cnpj" | "cpf"; value: string };

export interface Compl {
  x_carac_ad?: string;
  x_carac_ser?: string;
  x_emi?: string;
  x_obs?: string;
  obs_cont?: ObsCampo[];
  obs_fisco?: ObsCampo[];
}

export interface ObsCampo {
  x_campo: string;
  x_texto: string;
}

export interface Emit {
  doc: Documento;
  ie?: string;
  iest?: string;
  x_nome: string;
  x_fant?: string;
  ender_emit: Endereco;
  crt: string;
}

export interface Party {
  doc: Documento;
  ie?: string;
  x_nome: string;
  x_fant?: string;
  fone?: string;
  isuf?: string;
  ender: Endereco;
  email?: string;
}

export interface Endereco {
  x_lgr: string;
  nro: string;
  x_cpl?: string;
  x_bairro: string;
  c_mun: string;
  x_mun: string;
  cep?: string;
  uf: string;
  c_pais?: string;
  x_pais?: string;
  fone?: string;
}

export interface VPrest {
  v_t_prest: string;
  v_rec: string;
  comp?: Componente[];
}

export interface Componente {
  x_nome: string;
  v_comp: string;
}

export interface Imp {
  icms: Icms;
  v_tot_trib?: string;
  inf_ad_fisco?: string;
}

export type Icms =
  | { cst: "00"; v_bc: string; p_icms: string; v_icms: string }
  | { cst: "20"; p_red_bc: string; v_bc: string; p_icms: string; v_icms: string }
  | { cst: "45"; cst_code?: string; CST?: string }
  | { cst: "90"; p_red_bc?: string; v_bc: string; p_icms: string; v_icms: string; v_cred?: string }
  | { cst: "SN"; ind_sn?: string }
  | { kind: "Icms00"; v_bc: string; p_icms: string; v_icms: string }
  | { kind: "Icms20"; p_red_bc: string; v_bc: string; p_icms: string; v_icms: string }
  | { kind: "Icms45"; cst_code: string }
  | { kind: "Icms90"; p_red_bc?: string; v_bc: string; p_icms: string; v_icms: string; v_cred?: string }
  | { kind: "IcmsSn"; ind_sn?: string };

export interface InfCteNorm {
  inf_carga: InfCarga;
  inf_doc?: InfDoc;
  inf_modal: InfModal;
  inf_cte_sub?: InfCteSub;
}

export interface InfCteSub {
  ch_cte: string;
  ind_altera_toma?: string;
}

export interface InfCarga {
  v_carga?: string;
  pro_pred: string;
  x_out_cat?: string;
  inf_q: InfQ[];
  v_carga_averb?: string;
}

export interface InfQ {
  c_unid: string;
  tp_med: string;
  q_carga: string;
}

export interface InfDoc {
  inf_nfe?: InfNfe[];
  inf_outros?: InfOutros[];
}

export interface InfOutros {
  tp_doc: string;
  desc_outros?: string;
  n_doc?: string;
  d_emi?: string;
  v_doc_fisc?: string;
}

export interface InfNfe {
  chave: string;
  d_prev?: string;
}

export interface InfModal {
  versao_modal?: string;
  modal: Modal;
}

export type Modal =
  | { tipo: "rodo"; rntrc: string }
  | { tipo: "aereo"; d_prev_aereo: string; x_dime?: string; tarifa_cl: string; tarifa_v_tar: string; n_minu?: string }
  | { tipo: "aquav"; v_prest: string; v_afrmm: string; x_navio: string; direc: string; irin: string; n_viag?: string }
  | { tipo: "ferrov"; tp_traf: string; fluxo: string }
  | { tipo: "duto"; d_ini: string; d_fim: string; v_tar?: string }
  | { tipo: "multimodal"; cotm: string; ind_negociavel: string }
  | ({ Rodo: { rntrc: string } } | { Aereo: Record<string, string | undefined> } | { Aquav: Record<string, string | undefined> } | { Ferrov: Record<string, string> } | { Duto: Record<string, string | undefined> } | { Multimodal: Record<string, string> });

export interface AutXml {
  doc: Documento;
}

export interface InfRespTec {
  cnpj: string;
  x_contato: string;
  email: string;
  fone: string;
}
