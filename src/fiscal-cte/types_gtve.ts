import type { AutXml, Compl, Emit, Endereco, FiscalDate, InfRespTec, Party } from "./types.ts";
import type { TomaOs } from "./types_os.ts";

export interface GtveBuildData {
  numeric_code?: string;
  emit_cnpj: string;
  ide: IdeGtve;
  compl?: Compl;
  emit: Emit;
  rem: Party;
  dest: Party;
  origem?: Endereco;
  destino?: Endereco;
  det_gtv: DetGtv;
  aut_xml?: AutXml[];
  inf_resp_tec?: InfRespTec;
}

export interface IdeGtve {
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
  ver_proc?: string;
  c_mun_env: string;
  x_mun_env: string;
  uf_env: string;
  modal: string;
  tp_serv: string;
  ind_ie_toma: string;
  dh_saida_orig: string;
  dh_chegada_dest: string;
  toma: TomaOs;
}

export interface DetGtv {
  inf_especie: InfEspecie[];
  q_carga: string;
  inf_veiculo: InfVeiculoGtv[];
}

export interface InfEspecie {
  tp_especie: string;
  v_especie: string;
  tp_numerario?: string;
  x_moeda_estr?: string;
}

export interface InfVeiculoGtv {
  placa: string;
  uf: string;
  rntrc?: string;
}
