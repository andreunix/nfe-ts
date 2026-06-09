import { describe, expect, test } from "bun:test";
import { generateKeyPairSync } from "node:crypto";
import {
  buildMdfeAccessKey,
  buildMdfeXml,
  signMdfeXml,
  validateMdfeXml,
  type MdfeBuildData,
} from "../../src/fiscal/index.ts";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();

function sample(): MdfeBuildData {
  return {
    ide: {
      c_uf: "43",
      tp_amb: "2",
      tp_emit: "1",
      serie: 1,
      n_mdf: 123,
      modal: "1",
      dh_emi: "2026-06-04T09:30:00-03:00",
      tp_emis: "1",
      uf_ini: "RS",
      uf_fim: "SC",
      inf_mun_carrega: [{ c_mun: "4314902", x_mun: "Porto Alegre" }],
      inf_percurso: ["SC"],
      dh_ini_viagem: "2026-06-04T09:30:00-03:00",
    },
    emit: {
      cnpj: "12345678000190",
      ie: "1234567890",
      x_nome: "Transportadora Exemplo LTDA",
      x_fant: "Exemplo Log",
      ender_emit: {
        x_lgr: "Av. Brasil",
        nro: "1000",
        x_bairro: "Centro",
        c_mun: "4314902",
        x_mun: "Porto Alegre",
        cep: "90000000",
        uf: "RS",
      },
    },
    modal: {
      type: "rodo",
      inf_antt: { rntrc: "12345678" },
      veic_tracao: {
        placa: "ABC1D23",
        renavam: "12345678901",
        tara: 8000,
        cap_kg: 25000,
        condutor: [{ x_nome: "Joao da Silva", cpf: "12345678909" }],
        tp_rod: "06",
        tp_car: "02",
        uf: "RS",
      },
      veic_reboque: [{
        placa: "XYZ4E56",
        renavam: "98765432109",
        tara: 5000,
        cap_kg: 30000,
        tp_car: "02",
        uf: "RS",
      }],
    },
    inf_doc: {
      inf_mun_descarga: [{
        c_mun: "4205407",
        x_mun: "Florianopolis",
        inf_nfe: [
          "43260312345678000190550010000001231123456780",
          "43260312345678000190550010000001241123456781",
        ],
      }],
    },
    tot: {
      q_nfe: 2,
      v_carga: 15000,
      c_unid: "01",
      q_carga: 1200.5,
    },
    inf_adic: { inf_cpl: "Carga fragil" },
    numeric_code: "00000001",
  };
}

describe("fiscal-mdfe", () => {
  test("monta chave de acesso MDF-e com layout e rejeita base invalida", () => {
    const key = buildMdfeAccessKey({
      state_code: "43",
      year_month: "2506",
      tax_id: "12345678000190",
      series: 1,
      number: 123,
      emission_type: "1",
      numeric_code: "00000001",
    });

    expect(key.key).toHaveLength(44);
    expect(key.key.slice(20, 22)).toBe("58");
    expect(key.key.slice(22, 25)).toBe("001");
    expect(key.key.slice(25, 34)).toBe("000000123");
    expect(() => buildMdfeAccessKey({ state_code: "43", year_month: "2506", tax_id: "1234567800019X", series: 1, number: 123, emission_type: "1", numeric_code: "00000001" })).toThrow();
  });

  test("gera MDF-e rodoviario em ordem de schema", () => {
    const xml = buildMdfeXml(sample());
    const pos = (needle: string) => xml.indexOf(needle);

    expect(xml).toStartWith("<MDFe xmlns=\"http://www.portalfiscal.inf.br/mdfe\">");
    expect(xml).toContain("<infMDFe versao=\"3.00\" Id=\"MDFe");
    expect(xml).toContain("<mod>58</mod>");
    expect(pos("<ide>")).toBeLessThan(pos("<emit>"));
    expect(pos("<emit>")).toBeLessThan(pos("<infModal"));
    expect(pos("<infModal")).toBeLessThan(pos("<infDoc>"));
    expect(pos("<infDoc>")).toBeLessThan(pos("<tot>"));
    expect(pos("<tot>")).toBeLessThan(pos("<infAdic>"));
    expect(xml).toContain("<infModal versaoModal=\"3.00\"><rodo>");
    expect(xml).toContain("<RNTRC>12345678</RNTRC>");
    expect(xml).toContain("<condutor><xNome>Joao da Silva</xNome><CPF>12345678909</CPF></condutor>");
    expect(xml).toContain("<veicReboque><placa>XYZ4E56</placa>");
    expect(xml).toContain("<chNFe>43260312345678000190550010000001231123456780</chNFe>");
    expect(xml).toContain("<qNFe>2</qNFe><vCarga>15000.00</vCarga><cUnid>01</cUnid><qCarga>1200.5000</qCarga>");
  });

  test("gera modais aereo, aquaviario e ferroviario", () => {
    const aereo = sample();
    aereo.ide.modal = "2";
    aereo.modal = { type: "aereo", nac: "PR", matr: "ABC123", n_voo: "AB1234", c_aer_emb: "POA", c_aer_des: "GRU", d_voo: "2026-06-04" };
    expect(buildMdfeXml(aereo)).toContain("<aereo><nac>PR</nac><matr>ABC123</matr><nVoo>AB1234</nVoo><cAerEmb>POA</cAerEmb><cAerDes>GRU</cAerDes><dVoo>2026-06-04</dVoo></aereo>");

    const aquav = sample();
    aquav.ide.modal = "3";
    aquav.modal = {
      type: "aquav",
      irin: "1234567890",
      tp_emb: "06",
      c_embar: "EMB001",
      x_embar: "Navio Exemplo",
      n_viag: "1",
      c_prt_emb: "BRRIG",
      c_prt_dest: "BRSSZ",
      tp_nav: "1",
      inf_term_carreg: [{ c_term_carreg: "12345678", x_term_carreg: "Terminal A" }],
      mmsi: "123456789",
    };
    expect(buildMdfeXml(aquav)).toContain("<aquav><irin>1234567890</irin><tpEmb>06</tpEmb><cEmbar>EMB001</cEmbar>");
    expect(buildMdfeXml(aquav)).toContain("<infTermCarreg><cTermCarreg>12345678</cTermCarreg><xTermCarreg>Terminal A</xTermCarreg></infTermCarreg><MMSI>123456789</MMSI>");

    const ferrov = sample();
    ferrov.ide.modal = "4";
    ferrov.modal = {
      type: "ferrov",
      trem: { x_pref: "TREM01", x_ori: "POA", x_dest: "SPO", q_vag: "2" },
      vag: [
        { peso_bc: "50.000", peso_r: "48.500", tp_vag: "HFE", serie: "001", n_vag: "12345", n_seq: "1", tu: "45.000" },
        { peso_bc: "60.000", peso_r: "59.000", serie: "002", n_vag: "12346", tu: "55.000" },
      ],
    };
    const ferrovXml = buildMdfeXml(ferrov);
    expect(ferrovXml).toContain("<ferrov><trem><xPref>TREM01</xPref><xOri>POA</xOri><xDest>SPO</xDest><qVag>2</qVag></trem>");
    expect(ferrovXml).toContain("<vag><pesoBC>50.000</pesoBC><pesoR>48.500</pesoR><tpVag>HFE</tpVag><serie>001</serie><nVag>12345</nVag><nSeq>1</nSeq><TU>45.000</TU></vag>");
  });

  test("assina e valida estruturalmente MDF-e", () => {
    const signed = signMdfeXml(buildMdfeXml(sample()), privateKeyPem, publicKeyPem);

    expect(signed).toContain("<Signature xmlns=\"http://www.w3.org/2000/09/xmldsig#\">");
    expect(signed).toContain("<Reference URI=\"#MDFe");
    expect(() => validateMdfeXml(signed)).not.toThrow();
    expect(() => validateMdfeXml("<MDFe><infMDFe></infMDFe></MDFe>")).toThrow("Este XML não é válido");
  });
});
