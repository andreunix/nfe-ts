import { describe, expect, test } from "bun:test";
import { generateKeyPairSync } from "node:crypto";
import {
  buildBpeXml,
  buildCteAccessKey,
  buildCteXml,
  buildCteosXml,
  buildDpsXml,
  buildGtveXml,
  buildNfseCancelamento,
  signCteXml,
  validateCteXml,
  type BpeBuildData,
  type CteBuildData,
  type CteOsBuildData,
  type DpsBuildData,
  type Endereco,
  type GtveBuildData,
  type Party,
} from "../../src/fiscal/index.ts";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();

function ender(): Endereco {
  return {
    x_lgr: "RUA A",
    nro: "10",
    x_bairro: "CENTRO",
    c_mun: "3550308",
    x_mun: "SAO PAULO",
    cep: "01001000",
    uf: "SP",
    c_pais: "1058",
    x_pais: "BRASIL",
  };
}

function party(name: string): Party {
  return {
    doc: { Cnpj: "11222333000181" },
    ie: "111111111",
    x_nome: name,
    ender: ender(),
  };
}

function sampleCte(): CteBuildData {
  return {
    ide: {
      c_uf: "43",
      cfop: "5353",
      nat_op: "PRESTACAO DE SERVICO DE TRANSPORTE",
      serie: 1,
      n_ct: 1,
      dh_emi: "2026-06-05T10:00:00-03:00",
      tp_imp: "1",
      tp_emis: "1",
      tp_amb: "2",
      tp_cte: "0",
      c_mun_env: "4314902",
      x_mun_env: "PORTO ALEGRE",
      uf_env: "RS",
      modal: "01",
      tp_serv: "0",
      c_mun_ini: "4314902",
      x_mun_ini: "PORTO ALEGRE",
      uf_ini: "RS",
      c_mun_fim: "3550308",
      x_mun_fim: "SAO PAULO",
      uf_fim: "SP",
      retira: "0",
      ind_ie_toma: "1",
      toma: { kind: "toma3", toma: "0" },
    },
    compl: { x_obs: "Teste de homologacao" },
    emit: { doc: { Cnpj: "12345678000190" }, ie: "1234567890", x_nome: "TRANSPORTADORA TESTE LTDA", x_fant: "TESTE LOG", ender_emit: ender(), crt: "3" },
    rem: party("REMETENTE TESTE SA"),
    dest: party("DESTINATARIO TESTE SA"),
    v_prest: { v_t_prest: "1500.00", v_rec: "1500.00", comp: [{ x_nome: "FRETE PESO", v_comp: "1500.00" }] },
    imp: { icms: { cst: "00", v_bc: "1500.00", p_icms: "12.00", v_icms: "180.00" } },
    inf_cte_norm: {
      inf_carga: { v_carga: "50000.00", pro_pred: "DIVERSOS", inf_q: [{ c_unid: "01", tp_med: "PESO BRUTO", q_carga: "1000.0000" }] },
      inf_doc: { inf_nfe: [{ chave: "4".repeat(44) }] },
      inf_modal: { versao_modal: "4.00", modal: { tipo: "rodo", rntrc: "12345678" } },
    },
    emit_cnpj: "12345678000190",
    numeric_code: "00000001",
  };
}

describe("fiscal-cte", () => {
  test("monta chave de acesso CT-e com layout e dígito corretos", () => {
    const key = buildCteAccessKey({
      model: "57",
      state_code: "43",
      year_month: "2506",
      tax_id: "12345678000190",
      series: 1,
      number: 123,
      emission_type: "1",
      numeric_code: "00000001",
    });

    expect(key.key).toHaveLength(44);
    expect(key.key.slice(20, 22)).toBe("57");
    expect(key.key.slice(22, 25)).toBe("001");
    expect(key.key.slice(25, 34)).toBe("000000123");
    expect(() => buildCteAccessKey({ model: "57", state_code: "43", year_month: "2506", tax_id: "x", series: 1, number: 1, emission_type: "1", numeric_code: "1" })).toThrow();
  });

  test("gera CT-e normal, complementar e substituto", () => {
    const xml = buildCteXml(sampleCte());
    expect(xml).toContain("<CTe xmlns=\"http://www.portalfiscal.inf.br/cte\">");
    expect(xml).toContain("<infCte versao=\"4.00\" Id=\"CTe");
    expect(xml).toContain("<mod>57</mod>");
    expect(xml).toContain("<infModal versaoModal=\"4.00\"><rodo><RNTRC>12345678</RNTRC>");
    expect(xml.indexOf("<ide>")).toBeLessThan(xml.indexOf("<compl>"));
    expect(xml.indexOf("<vPrest>")).toBeLessThan(xml.indexOf("<imp>"));

    const complementar = sampleCte();
    complementar.ide.tp_cte = "1";
    complementar.inf_cte_comp = ["3".repeat(44)];
    expect(buildCteXml(complementar)).toContain("<infCteComp><chCTe>");

    const substituto = sampleCte();
    substituto.ide.tp_cte = "3";
    substituto.inf_cte_norm.inf_cte_sub = { ch_cte: "3".repeat(44), ind_altera_toma: "1" };
    expect(buildCteXml(substituto)).toContain("<infCteSub><chCte>");
  });

  test("assina e valida estruturalmente CT-e", () => {
    const signed = signCteXml(buildCteXml(sampleCte()), privateKeyPem, publicKeyPem);

    expect(signed).toContain("<Signature xmlns=\"http://www.w3.org/2000/09/xmldsig#\">");
    expect(() => validateCteXml(signed)).not.toThrow();
    expect(() => validateCteXml("<CTe></CTe>")).toThrow("Validação estrutural do CT-e falhou");
  });

  test("gera CT-e OS, GTV-e, BP-e, DPS e cancelamento NFS-e", () => {
    const cteos: CteOsBuildData = {
      numeric_code: "00000001",
      emit_cnpj: "12345678000190",
      ide: {
        c_uf: "35", cfop: "5357", nat_op: "TRANSPORTE DE PESSOAS", serie: 1, n_ct: 1, dh_emi: "2026-06-06T10:00:00-03:00",
        tp_imp: "1", tp_emis: "1", tp_amb: "2", tp_cte: "0", c_mun_env: "3550308", x_mun_env: "SAO PAULO", uf_env: "SP",
        modal: "01", tp_serv: "6", ind_ie_toma: "9", c_mun_ini: "3550308", x_mun_ini: "SAO PAULO", uf_ini: "SP",
        c_mun_fim: "3509502", x_mun_fim: "CAMPINAS", uf_fim: "SP",
      },
      emit: { doc: { Cnpj: "12345678000190" }, ie: "111111111111", x_nome: "TRANSP TESTE", ender_emit: ender(), crt: "3" },
      toma: { doc: { Cpf: "34493536837" }, x_nome: "FULANO", ender_toma: ender() },
      v_prest: { v_t_prest: "100.00", v_rec: "100.00" },
      imp: { icms: { cst: "SN", ind_sn: "1" } },
      inf_cte_norm: { inf_servico: { x_desc_serv: "TRANSPORTE DE PESSOAS" }, inf_modal: { versao_modal: "4.00", rodo_os: { taf: "123456789" } } },
    };
    expect(buildCteosXml(cteos)).toContain("<CTeOS xmlns=\"http://www.portalfiscal.inf.br/cte\" versao=\"4.00\">");
    expect(buildCteosXml(cteos)).toContain("<mod>67</mod>");

    const gtve: GtveBuildData = {
      numeric_code: "00000001",
      emit_cnpj: "12345678000190",
      ide: {
        c_uf: "35", cfop: "5359", nat_op: "TRANSPORTE DE VALORES", serie: 1, n_ct: 1, dh_emi: "2026-06-06T10:00:00-03:00",
        tp_imp: "1", tp_emis: "1", tp_amb: "2", tp_cte: "4", c_mun_env: "3550308", x_mun_env: "SAO PAULO", uf_env: "SP",
        modal: "01", tp_serv: "9", ind_ie_toma: "9", dh_saida_orig: "2026-06-06T09:00:00-03:00", dh_chegada_dest: "2026-06-06T18:00:00-03:00",
        toma: { doc: { Cpf: "34493536837" }, x_nome: "FULANO", ender_toma: ender() },
      },
      emit: { doc: { Cnpj: "12345678000190" }, ie: "111111111111", x_nome: "TRANSP VALORES", ender_emit: ender(), crt: "3" },
      rem: party("REMETENTE"),
      dest: party("DESTINATARIO"),
      det_gtv: { inf_especie: [{ tp_especie: "1", v_especie: "1000.00", tp_numerario: "1" }], q_carga: "1000.0000", inf_veiculo: [{ placa: "ABC1234", uf: "SP", rntrc: "12345678" }] },
    };
    expect(buildGtveXml(gtve)).toContain("<mod>64</mod>");
    expect(buildGtveXml(gtve)).toContain("<detGTV><infEspecie>");

    const bpe: BpeBuildData = {
      numeric_code: "00000001",
      emit_cnpj: "12345678000190",
      ide: { c_uf: "35", tp_amb: "2", serie: 1, n_bp: 1, modal: "1", dh_emi: "2026-06-06T10:00:00-03:00", tp_emis: "1", tp_bpe: "0", ind_pres: "1", uf_ini: "SP", c_mun_ini: "3550308", uf_fim: "SP", c_mun_fim: "3509502" },
      emit: { cnpj: "12345678000190", ie: "111111111111", x_nome: "VIACAO TESTE", crt: "3", ender_emit: ender(), tar: "12345" },
      inf_valor: { v_bp: "100.00", v_desconto: "0.00", v_pgto: "100.00", v_troco: "0.00", comp: [{ tp_comp: "01", v_comp: "100.00" }] },
      inf_viagem: [{ c_percurso: "SP", x_percurso: "SAO PAULO-CAMPINAS", tp_viagem: "00", tp_serv: "1", tp_acomodacao: "2", tp_trecho: "1", dh_viagem: "2026-06-07T08:00:00-03:00" }],
      inf_passagem: { c_loc_orig: "3550308", x_loc_orig: "SAO PAULO", c_loc_dest: "3509502", x_loc_dest: "CAMPINAS", dh_emb: "2026-06-07T08:00:00-03:00", dh_validade: "2026-06-08T08:00:00-03:00" },
      imp: { icms: { cst: "SN", ind_sn: "1" } },
      pag: [{ t_pag: "01", v_pag: "100.00" }],
    };
    expect(buildBpeXml(bpe)).toContain("<BPe xmlns=\"http://www.portalfiscal.inf.br/bpe\">");
    expect(buildBpeXml(bpe)).toContain("<mod>63</mod>");

    const dps: DpsBuildData = {
      ide: { tp_amb: "2", dh_emi: "2026-06-06T10:00:00-03:00", serie: "1", n_dps: 1, d_compet: "2026-06-06", tp_emit: "1", c_loc_emi: "3550308" },
      prest: { doc: { Cnpj: "12345678000190" }, im: "123456", x_nome: "PRESTADOR TESTE LTDA", reg_trib: { op_simp_nac: "1", reg_esp_trib: "0" } },
      toma: { doc: { Cpf: "34493536837" }, x_nome: "FULANO DE TAL" },
      serv: { c_loc_prestacao: "3550308", c_trib_nac: "010101", x_desc_serv: "SERVICO DE TESTE" },
      valores: { v_serv: "100.00", trib: { trib_mun: { trib_issqn: "1", p_aliq: "5.00", tp_ret_issqn: "1" } } },
    };
    expect(buildDpsXml(dps)).toContain("<DPS xmlns=\"http://www.sped.fazenda.gov.br/nfse\" versao=\"1.01\">");
    expect(buildDpsXml(dps)).toContain("<infDPS Id=\"DPS");
    expect(buildNfseCancelamento("1".repeat(50), "12345678000190", "1", "Erro na emissao", "2", "2026-06-06T10:00:00-03:00")).toContain("<pedRegEvento");
  });
});
