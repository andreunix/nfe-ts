import {
  InvoiceBuilder,
  InvoiceModel,
  SefazEnvironment,
  signXml,
  validateNfeXml,
} from "../src/fiscal/index.ts";

const issuer = {
  tax_id: "12345678000199",
  legal_name: "EMPRESA EXEMPLO LTDA",
  state_code: "RO",
  city_code: "1100205",
  street: "Rua A",
  street_number: "100",
  district: "Centro",
  city_name: "Porto Velho",
  zip_code: "76800000",
  state_tax_id: "000000123",
  tax_regime: 3,
};

const recipient = {
  tax_id: "11222333000181",
  legal_name: "CLIENTE EXEMPLO LTDA",
  state_tax_id: "111111111",
  street: "Rua B",
  street_number: "200",
  district: "Centro",
  city_code: "1100205",
  city_name: "Porto Velho",
  state_code: "RO",
  zip_code: "76800000",
};

const item = {
  product_code: "001",
  description: "Produto de exemplo",
  ncm: "00000000",
  cfop: "5102",
  unit: "UN",
  quantity: "1.0000",
  unit_price: 10000,
  total_price: 10000,
  icms: { cst: "00", orig: "0", v_bc: 10000, p_icms: 18, v_icms: 1800 },
  pis: { cst: "07" },
  cofins: { cst: "07" },
};

const built = InvoiceBuilder
  .new(issuer, SefazEnvironment.Homologation, InvoiceModel.Nfe)
  .invoiceNumber(1)
  .series(1)
  .issuedAt("2026-06-08T12:00:00-04:00")
  .operationNature("VENDA")
  .recipient(recipient)
  .addItem(item)
  .payments([{ method: "01", amount: 10000 }])
  .build();

validateNfeXml(built.xml());

console.log("NF-e chave:", built.accessKey());
console.log("NF-e XML:", built.xml());

// Para assinar, carregue um certificado real e passe chave/certificado PEM:
// const signed = signXml(built.xml(), privateKeyPem, certificatePem);
void signXml;
