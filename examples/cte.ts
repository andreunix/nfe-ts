import { readFileSync } from "node:fs";
import { buildCteXml, loadCertificate, signCteXml, validateCteXml, type CteBuildData, type Endereco, type Party } from "../src/fiscal/index.ts";

function endereco(): Endereco {
  return {
    x_lgr: "RUA A",
    nro: "100",
    x_bairro: "CENTRO",
    c_mun: "3550308",
    x_mun: "SAO PAULO",
    cep: "01001000",
    uf: "SP",
    c_pais: "1058",
    x_pais: "BRASIL",
  };
}

function parte(nome: string): Party {
  return {
    doc: { Cnpj: "11222333000181" },
    ie: "111111111",
    x_nome: nome,
    ender: endereco(),
  };
}

const data: CteBuildData = {
  ide: {
    c_uf: "35",
    cfop: "5353",
    nat_op: "PRESTACAO DE SERVICO DE TRANSPORTE",
    serie: 1,
    n_ct: 1,
    dh_emi: "2026-06-08T10:00:00-03:00",
    tp_imp: "1",
    tp_emis: "1",
    tp_amb: "2",
    tp_cte: "0",
    c_mun_env: "3550308",
    x_mun_env: "SAO PAULO",
    uf_env: "SP",
    modal: "01",
    tp_serv: "0",
    c_mun_ini: "3550308",
    x_mun_ini: "SAO PAULO",
    uf_ini: "SP",
    c_mun_fim: "3509502",
    x_mun_fim: "CAMPINAS",
    uf_fim: "SP",
    retira: "0",
    ind_ie_toma: "1",
    toma: { kind: "toma3", toma: "0" },
  },
  emit: { doc: { Cnpj: "12345678000190" }, ie: "1234567890", x_nome: "TRANSPORTADORA EXEMPLO LTDA", ender_emit: endereco(), crt: "3" },
  rem: parte("REMETENTE EXEMPLO"),
  dest: parte("DESTINATARIO EXEMPLO"),
  v_prest: { v_t_prest: "1500.00", v_rec: "1500.00", comp: [{ x_nome: "FRETE", v_comp: "1500.00" }] },
  imp: { icms: { cst: "00", v_bc: "1500.00", p_icms: "12.00", v_icms: "180.00" } },
  inf_cte_norm: {
    inf_carga: { v_carga: "50000.00", pro_pred: "DIVERSOS", inf_q: [{ c_unid: "01", tp_med: "PESO BRUTO", q_carga: "1000.0000" }] },
    inf_doc: { inf_nfe: [{ chave: "4".repeat(44) }] },
    inf_modal: { versao_modal: "4.00", modal: { tipo: "rodo", rntrc: "12345678" } },
  },
  emit_cnpj: "12345678000190",
  numeric_code: "00000001",
};

const xml = buildCteXml(data);
const cert = loadCertificate(readFileSync("tests/fixtures/certs/novo_cert_cnpj_06157250000116_senha_minhasenha.pfx"), "minhasenha");
if (!cert.private_key || !cert.certificate) throw new Error("certificado de exemplo invalido");
const signedXml = signCteXml(xml, cert.private_key, cert.certificate);
validateCteXml(signedXml);

console.log("CT-e XML:", xml);
console.log("CT-e assinado:", signedXml);
