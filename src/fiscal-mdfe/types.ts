export type FiscalDate = Date | string;

export interface MdfeBuildData {
  ide: Ide;
  emit: Emit;
  modal: Modal;
  inf_doc: InfDoc;
  tot: Tot;
  inf_adic?: InfAdic;
  numeric_code?: string;
}

export interface Ide {
  c_uf: string;
  tp_amb: string;
  tp_emit: string;
  serie: number;
  n_mdf: number;
  modal: string;
  dh_emi: FiscalDate;
  tp_emis: string;
  proc_emi?: string;
  ver_proc?: string;
  uf_ini: string;
  uf_fim: string;
  inf_mun_carrega: MunCarrega[];
  inf_percurso?: string[];
  dh_ini_viagem?: FiscalDate;
}

export interface MunCarrega {
  c_mun: string;
  x_mun: string;
}

export interface Emit {
  cnpj: string;
  ie?: string;
  x_nome: string;
  x_fant?: string;
  ender_emit: EnderEmit;
}

export interface EnderEmit {
  x_lgr: string;
  nro: string;
  x_cpl?: string;
  x_bairro: string;
  c_mun: string;
  x_mun: string;
  cep: string;
  uf: string;
  fone?: string;
  email?: string;
}

export type Modal =
  | ({ type: "rodo" } & Rodo)
  | ({ type: "aereo" } & Aereo)
  | ({ type: "aquav" } & Aquav)
  | ({ type: "ferrov" } & Ferrov)
  | { Rodo: Rodo }
  | { Aereo: Aereo }
  | { Aquav: Aquav }
  | { Ferrov: Ferrov };

export interface Aereo {
  nac: string;
  matr: string;
  n_voo: string;
  c_aer_emb: string;
  c_aer_des: string;
  d_voo: string;
}

export interface Aquav {
  irin: string;
  tp_emb: string;
  c_embar: string;
  x_embar: string;
  n_viag: string;
  c_prt_emb: string;
  c_prt_dest: string;
  prt_trans?: string;
  tp_nav?: string;
  inf_term_carreg?: TermCarreg[];
  inf_term_descarreg?: TermDescarreg[];
  inf_emb_comb?: EmbComb[];
  inf_unid_carga_vazia?: UnidCargaVazia[];
  inf_unid_transp_vazia?: UnidTranspVazia[];
  mmsi?: string;
}

export interface TermCarreg {
  c_term_carreg: string;
  x_term_carreg: string;
}

export interface TermDescarreg {
  c_term_descarreg: string;
  x_term_descarreg: string;
}

export interface EmbComb {
  c_emb_comb: string;
  x_balsa: string;
}

export interface UnidCargaVazia {
  id_unid_carga_vazia: string;
  tp_unid_carga_vazia: string;
}

export interface UnidTranspVazia {
  id_unid_transp_vazia: string;
  tp_unid_transp_vazia: string;
}

export interface Ferrov {
  trem: Trem;
  vag: Vag[];
}

export interface Trem {
  x_pref: string;
  dh_trem?: string;
  x_ori: string;
  x_dest: string;
  q_vag: string;
}

export interface Vag {
  peso_bc: string;
  peso_r: string;
  tp_vag?: string;
  serie: string;
  n_vag: string;
  n_seq?: string;
  tu: string;
}

export interface Rodo {
  inf_antt?: InfAntt;
  veic_tracao: VeicTracao;
  veic_reboque?: VeicReboque[];
}

export interface InfAntt {
  rntrc?: string;
  inf_ciot?: InfCiot[];
}

export interface InfCiot {
  ciot: string;
  tax_id: string;
}

export interface VeicTracao {
  c_int?: string;
  placa: string;
  renavam?: string;
  tara: number;
  cap_kg?: number;
  cap_m3?: number;
  prop?: Prop;
  condutor?: Condutor[];
  tp_rod: string;
  tp_car: string;
  uf?: string;
}

export interface Prop {
  tax_id: string;
  rntrc?: string;
  x_nome: string;
  ie?: string;
  uf: string;
  tp_prop: string;
}

export interface Condutor {
  x_nome: string;
  cpf: string;
}

export interface VeicReboque {
  c_int?: string;
  placa: string;
  renavam?: string;
  tara: number;
  cap_kg?: number;
  cap_m3?: number;
  prop?: Prop;
  tp_car: string;
  uf?: string;
}

export interface InfDoc {
  inf_mun_descarga: MunDescarga[];
}

export interface MunDescarga {
  c_mun: string;
  x_mun: string;
  inf_nfe?: string[];
  inf_cte?: string[];
  inf_mdfe?: string[];
}

export interface Tot {
  q_cte?: number;
  q_nfe?: number;
  q_mdfe?: number;
  v_carga: number;
  c_unid: string;
  q_carga: number;
}

export interface InfAdic {
  inf_ad_fisco?: string;
  inf_cpl?: string;
}
