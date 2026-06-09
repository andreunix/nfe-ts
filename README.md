# nfe-ts

Biblioteca TypeScript/Bun para montar, assinar, validar e interpretar documentos fiscais brasileiros. O pacote centraliza a API publica em `src/fiscal/index.ts` e organiza a implementacao por modulos fiscais.

## Status

Este projeto ainda esta em evolucao. Os exemplos e testes cobrem geracao local de XML, assinatura, validacao por XSD e parsers de retorno, mas emissao real exige certificado valido, transporte HTTP/mTLS configurado no runtime e uso correto dos ambientes da SEFAZ ou prefeitura.

## Instalacao

```bash
bun install
```

## Entrada publica

Use o barrel central:

```ts
import {
  InvoiceBuilder,
  InvoiceModel,
  SefazEnvironment,
  validateNfeXml,
} from "./src/fiscal/index.ts";
```

O arquivo `src/fiscal/index.ts` reexporta:

- `fiscal-core`: tipos, builders de NF-e/NFC-e, impostos, QR Code, XML e utilitarios.
- `fiscal-crypto`: leitura de PFX, canonicalizacao e assinatura XML.
- `fiscal-cte`: builders, tipos, assinatura e validacao de CT-e, CT-e OS, GTV-e e BP-e.
- `fiscal-mdfe`: builders, tipos, assinatura e validacao de MDF-e.
- `fiscal-nfse-mun`: provedores municipais ABRASF e Sao Paulo.
- `fiscal-xsd`: validacao XML contra schemas fiscais versionados.
- `fiscal-sefaz`: builders SOAP, URLs, clientes e parsers de respostas SEFAZ.

## Exemplo rapido

```ts
import {
  InvoiceBuilder,
  InvoiceModel,
  SefazEnvironment,
  validateNfeXml,
} from "./src/fiscal/index.ts";

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

console.log(built.accessKey());
console.log(built.xml());
```

Veja dados completos em [examples/nfe.ts](examples/nfe.ts).

## Exemplos

Execute a partir da raiz:

```bash
bun examples/nfe.ts
bun examples/nfce.ts
bun examples/cte.ts
bun examples/mdfe.ts
bun examples/nfse-municipal.ts
bun examples/xsd-validation.ts
```

Os exemplos geram payloads locais. Eles nao transmitem documentos para SEFAZ ou prefeituras.

## Testes

```bash
bun test
```

A suite cobre os modulos principais, parsers SEFAZ, certificados de fixture e gates de XSD.

## Estrutura

```text
src/fiscal/           API publica central
src/fiscal-core/      base NF-e/NFC-e, impostos, XML e tipos
src/fiscal-crypto/    certificados e assinatura
src/fiscal-cte/       CT-e, CT-e OS, GTV-e, BP-e e DPS/NFS-e relacionados
src/fiscal-mdfe/      MDF-e
src/fiscal-nfse-mun/  NFS-e municipal
src/fiscal-xsd/       schemas e validacao XSD
src/fiscal-sefaz/     SOAP, URLs, clientes e parsers SEFAZ
schemas/              bundles XSD versionados
tests/                testes e fixtures
examples/             exemplos executaveis
```

## Observacoes

- Valores monetarios internos costumam usar centavos quando o tipo do modulo indicar numero.
- Imports com extensao `.ts` sao intencionais para execucao direta com Bun.
- Certificados em `tests/fixtures` existem apenas para testes locais.
