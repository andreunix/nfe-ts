import { readFileSync } from "node:fs";
import {
  buildMdfeXml,
  loadCertificate,
  signMdfeXml,
  xsdSchemas,
  type MdfeBuildData,
} from "../src/fiscal/index.ts";

const data: MdfeBuildData = {
  ide: {
    c_uf: "43",
    tp_amb: "2",
    tp_emit: "1",
    serie: 1,
    n_mdf: 123,
    modal: "1",
    dh_emi: "2026-06-08T09:30:00-03:00",
    tp_emis: "1",
    uf_ini: "RS",
    uf_fim: "SC",
    inf_mun_carrega: [{ c_mun: "4314902", x_mun: "Porto Alegre" }],
  },
  emit: {
    cnpj: "12345678000190",
    ie: "1234567890",
    x_nome: "TRANSPORTADORA EXEMPLO LTDA",
    ender_emit: { x_lgr: "Av. Brasil", nro: "1000", x_bairro: "Centro", c_mun: "4314902", x_mun: "Porto Alegre", cep: "90000000", uf: "RS" },
  },
  modal: {
    type: "rodo",
    inf_antt: { rntrc: "12345678" },
    veic_tracao: { placa: "ABC1D23", renavam: "12345678901", tara: 8000, condutor: [{ x_nome: "Joao da Silva", cpf: "12345678909" }], tp_rod: "06", tp_car: "02" },
  },
  inf_doc: { inf_mun_descarga: [{ c_mun: "4205407", x_mun: "Florianopolis", inf_nfe: ["43260312345678000190550010000001231123456780"] }] },
  tot: { q_nfe: 1, v_carga: 15000, c_unid: "01", q_carga: 1200.5 },
  numeric_code: "00000001",
};

const cert = loadCertificate(readFileSync("tests/fixtures/certs/novo_cert_cnpj_06157250000116_senha_minhasenha.pfx"), "minhasenha");
if (!cert.private_key || !cert.certificate) throw new Error("certificado de exemplo invalido");

const signedXml = signMdfeXml(buildMdfeXml(data), cert.private_key, cert.certificate);
const errors = xsdSchemas.mdfe().validate(signedXml);

console.log(errors.length === 0 ? "MDF-e valido no XSD oficial" : errors.join("\n"));
