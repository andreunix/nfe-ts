import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  SP_LOTE_ROOT,
  assinaturaString,
  assinaturaStringV2,
  buildBpeXml,
  buildCteXml,
  buildCteosXml,
  buildDpsXml,
  buildGtveXml,
  buildLoteRps,
  buildLoteRpsV2,
  buildMdfeXml,
  buildNfseCancelamento,
  loadCertificate,
  rsaSha1Base64,
  signBpeXml,
  signCteXml,
  signCteosXml,
  signDpsXml,
  signGtveXml,
  signMdfeXml,
  signNfseEventoXml,
  signSpLoteXml,
  xsdSchemas,
  type BpeBuildData,
  type CteBuildData,
  type CteOsBuildData,
  type DpsBuildData,
  type EmitInput,
  type Endereco,
  type GtveBuildData,
  type MdfeBuildData,
  type Party,
} from "../../src/fiscal/index.ts";

const cert = loadCertificate(
  readFileSync("tests/fixtures/certs/novo_cert_cnpj_06157250000116_senha_minhasenha.pfx"),
  "minhasenha",
);
const privateKeyPem = cert.private_key;
const certificatePem = cert.certificate;
if (!privateKeyPem || !certificatePem) throw new Error("fixture PFX did not expose private key and certificate PEM");

function assertXsdValid(name: string, errors: string[]): void {
  expect(errors, `${name} falhou no XSD oficial:\n${errors.join("\n")}`).toEqual([]);
}

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

function cteSample(): CteBuildData {
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

function cteosSample(): CteOsBuildData {
  return {
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
}

function gtveSample(): GtveBuildData {
  return {
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
}

function bpeSample(): BpeBuildData {
  return {
    numeric_code: "00000001",
    emit_cnpj: "12345678000190",
    ide: { c_uf: "35", tp_amb: "2", serie: 1, n_bp: 1, modal: "1", dh_emi: "2026-06-06T10:00:00-03:00", tp_emis: "1", tp_bpe: "0", ind_pres: "1", uf_ini: "SP", c_mun_ini: "3550308", uf_fim: "SP", c_mun_fim: "3509502" },
    emit: { cnpj: "12345678000190", ie: "111111111111", x_nome: "VIACAO TESTE", crt: "3", ender_emit: ender(), tar: "12345" },
    inf_valor: { v_bp: "100.00", v_desconto: "0.00", v_pgto: "100.00", v_troco: "0.00", comp: [{ tp_comp: "01", v_comp: "100.00" }] },
    inf_viagem: [{ c_percurso: "SP", x_percurso: "SAO PAULO-CAMPINAS", tp_viagem: "00", tp_serv: "1", tp_acomodacao: "2", tp_trecho: "1", dh_viagem: "2026-06-07T08:00:00-03:00", poltrona: "12" }],
    inf_passagem: { c_loc_orig: "3550308", x_loc_orig: "SAO PAULO", c_loc_dest: "3509502", x_loc_dest: "CAMPINAS", dh_emb: "2026-06-07T08:00:00-03:00", dh_validade: "2026-06-08T08:00:00-03:00" },
    imp: { icms: { cst: "SN", ind_sn: "1" } },
    pag: [{ t_pag: "01", v_pag: "100.00" }],
  };
}

function dpsSample(): DpsBuildData {
  return {
    ide: { tp_amb: "2", dh_emi: "2026-06-06T10:00:00-03:00", ver_aplic: "dfehub-1.0", serie: "1", n_dps: 1, d_compet: "2026-06-06", tp_emit: "1", c_loc_emi: "3550308" },
    prest: { doc: { Cnpj: "12345678000190" }, im: "123456", x_nome: "PRESTADOR TESTE LTDA", end: { x_lgr: "RUA A", nro: "10", x_bairro: "CENTRO", c_mun: "3550308", cep: "01001000" }, reg_trib: { op_simp_nac: "1", reg_esp_trib: "0" } },
    toma: { doc: { Cpf: "34493536837" }, x_nome: "FULANO DE TAL" },
    serv: { c_loc_prestacao: "3550308", c_trib_nac: "010101", x_desc_serv: "SERVICO DE TESTE" },
    valores: { v_serv: "100.00", trib: { trib_mun: { trib_issqn: "1", p_aliq: "5.00", tp_ret_issqn: "1" } } },
  };
}

function mdfeSample(): MdfeBuildData {
  return {
    ide: {
      c_uf: "43", tp_amb: "2", tp_emit: "1", serie: 1, n_mdf: 123, modal: "1", dh_emi: "2026-06-04T09:30:00-03:00", tp_emis: "1",
      uf_ini: "RS", uf_fim: "SC", inf_mun_carrega: [{ c_mun: "4314902", x_mun: "Porto Alegre" }], inf_percurso: ["SC"], dh_ini_viagem: "2026-06-04T09:30:00-03:00",
    },
    emit: {
      cnpj: "12345678000190", ie: "1234567890", x_nome: "Transportadora Exemplo LTDA", x_fant: "Exemplo Log",
      ender_emit: { x_lgr: "Av. Brasil", nro: "1000", x_bairro: "Centro", c_mun: "4314902", x_mun: "Porto Alegre", cep: "90000000", uf: "RS" },
    },
    modal: {
      type: "rodo", inf_antt: { rntrc: "12345678" },
      veic_tracao: { placa: "ABC1D23", renavam: "12345678901", tara: 8000, cap_kg: 25000, condutor: [{ x_nome: "Joao da Silva", cpf: "12345678909" }], tp_rod: "06", tp_car: "02", uf: "RS" },
      veic_reboque: [{ placa: "XYZ4E56", renavam: "98765432109", tara: 5000, cap_kg: 30000, tp_car: "02", uf: "RS" }],
    },
    inf_doc: { inf_mun_descarga: [{ c_mun: "4205407", x_mun: "Florianopolis", inf_nfe: ["43260312345678000190550010000001231123456780", "43260312345678000190550010000001241123456781"] }] },
    tot: { q_nfe: 2, v_carga: 15000, c_unid: "01", q_carga: 1200.5 },
    inf_adic: { inf_cpl: "Carga fragil" },
    numeric_code: "00000001",
  };
}

function spSample(): EmitInput {
  return {
    emitente: { cnpj: "06157250000116", im: "12345678", razao_social: "CENTRE LTDA", c_mun: "3550308", uf: "SP", optante_simples: false },
    rps: {
      numero: 1,
      serie: "1",
      tipo: 1,
      data_emissao: "2026-06-06T10:00:00-03:00",
      tomador: { doc: "11222333000181", razao_social: "TOMADOR LTDA" },
      servico: { valor_centavos: 10000, valor_deducoes_centavos: 0, aliquota_iss: "2.00", iss_retido: false, item_lista_servico: "1.01", cod_tributacao_municipio: "02916", discriminacao: "SERVICO DE TESTE" },
      incentivador_cultural: false,
    },
  };
}

describe("Rust parity XSD gates", () => {
  test("CT-e variants validate against official XSD", () => {
    assertXsdValid("CT-e Normal", xsdSchemas.cte().validate(signCteXml(buildCteXml(cteSample()), privateKeyPem, certificatePem)));

    const complementar = cteSample();
    complementar.ide.tp_cte = "1";
    complementar.inf_cte_comp = ["3".repeat(44)];
    assertXsdValid("CT-e Complementar", xsdSchemas.cte().validate(signCteXml(buildCteXml(complementar), privateKeyPem, certificatePem)));

    const substituto = cteSample();
    substituto.ide.tp_cte = "3";
    substituto.inf_cte_norm.inf_cte_sub = { ch_cte: "3".repeat(44), ind_altera_toma: "1" };
    assertXsdValid("CT-e Substituto", xsdSchemas.cte().validate(signCteXml(buildCteXml(substituto), privateKeyPem, certificatePem)));
  });

  test("CT-e OS, GTV-e, BP-e and MDF-e validate against official XSD", () => {
    assertXsdValid("CT-e OS", xsdSchemas.cteos().validate(signCteosXml(buildCteosXml(cteosSample()), privateKeyPem, certificatePem)));
    assertXsdValid("GTV-e", xsdSchemas.gtve().validate(signGtveXml(buildGtveXml(gtveSample()), privateKeyPem, certificatePem)));

    const bpeXml = buildBpeXml(bpeSample());
    const bpeSupl = "<infBPeSupl><qrCodBPe>https://dfe-portal.svrs.rs.gov.br/bpe/qrCode?chBPe=35260612345678000190630010000000011930555651&amp;tpAmb=2</qrCodBPe></infBPeSupl>";
    const bpeWithSupl = bpeXml.replace("</BPe>", `${bpeSupl}</BPe>`);
    assertXsdValid("BP-e", xsdSchemas.bpe().validate(signBpeXml(bpeWithSupl, privateKeyPem, certificatePem)));

    assertXsdValid("MDF-e", xsdSchemas.mdfe().validate(signMdfeXml(buildMdfeXml(mdfeSample()), privateKeyPem, certificatePem)));
  });

  test("DPS and NFS-e event validate against official XSD", () => {
    assertXsdValid("DPS", xsdSchemas.dps().validate(signDpsXml(buildDpsXml(dpsSample()), privateKeyPem, certificatePem)));

    const event = buildNfseCancelamento("1".repeat(50), "12345678000190", "1", "Erro na emissao", "2", "2026-06-06T10:00:00-03:00");
    assertXsdValid("pedRegEvento", xsdSchemas.nfseEvento().validate(signNfseEventoXml(event, privateKeyPem, certificatePem)));
  });

  test("Sao Paulo RPS lote v1 and v2 validate against official XSD", () => {
    const sample = spSample();
    const assinatura = rsaSha1Base64(assinaturaString(sample), privateKeyPem);
    const signed = signSpLoteXml(buildLoteRps(sample, assinatura), SP_LOTE_ROOT, privateKeyPem, certificatePem);
    assertXsdValid("PedidoEnvioLoteRPS v1", xsdSchemas.spLoteRps().validate(signed));

    const assinaturaV2 = rsaSha1Base64(assinaturaStringV2(sample), privateKeyPem);
    const signedV2 = signSpLoteXml(buildLoteRpsV2(sample, assinaturaV2), SP_LOTE_ROOT, privateKeyPem, certificatePem);
    assertXsdValid("PedidoEnvioLoteRPS v2", xsdSchemas.spLoteRpsV2().validate(signedV2));
  });
});
