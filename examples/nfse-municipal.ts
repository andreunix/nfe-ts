import {
  assinaturaString,
  buildGerarNfse,
  buildLoteRps,
  resolve,
  soapGerarNfse,
  type EmitInput,
} from "../src/fiscal/index.ts";

const input: EmitInput = {
  emitente: {
    cnpj: "18885949000181",
    im: "123456",
    razao_social: "CENTRE SOLUCOES LTDA",
    c_mun: "3552205",
    uf: "SP",
    optante_simples: true,
  },
  rps: {
    numero: 1,
    serie: "1",
    tipo: 1,
    data_emissao: "2026-06-08T10:00:00-03:00",
    tomador: { doc: "34493536837", razao_social: "FULANO DE TAL", email: "fulano@example.com" },
    servico: {
      valor_centavos: 10000,
      aliquota_iss: "2.00",
      iss_retido: false,
      item_lista_servico: "1.01",
      cnae: "6201500",
      discriminacao: "SERVICO DE TESTE",
    },
    incentivador_cultural: false,
  },
};

const provider = resolve(input.emitente.c_mun);
const abrasfXml = buildGerarNfse(input);
const abrasfSoap = soapGerarNfse(abrasfXml);

console.log("Provedor municipal:", provider?.nome);
console.log("ABRASF GerarNfseEnvio:", abrasfXml);
console.log("ABRASF SOAP:", abrasfSoap);

const saoPauloInput: EmitInput = {
  ...input,
  emitente: { ...input.emitente, cnpj: "06157250000116", im: "12345678", c_mun: "3550308", optante_simples: false },
  rps: {
    ...input.rps,
    servico: {
      ...input.rps.servico,
      cod_tributacao_municipio: "02916",
      valor_deducoes_centavos: 0,
    },
  },
};

const assinaturaRps = "ASSINATURA_RSA_SHA1_BASE64_DO_RPS";
console.log("String assinatura SP:", assinaturaString(saoPauloInput));
console.log("Lote RPS SP:", buildLoteRps(saoPauloInput, assinaturaRps));
