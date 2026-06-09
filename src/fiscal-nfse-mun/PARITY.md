# Paridade fiscal-nfse-mun Rust -> TypeScript

Este arquivo rastreia a porta de `tmp/fiscal-rs/crates/fiscal-nfse-mun/src`
para `src/fiscal-nfse-mun`.

## Módulos

| Rust | TypeScript | Estado | Observações |
| --- | --- | --- | --- |
| `model.rs` | `model.ts` | verified | Modelo comum municipal, entradas/saídas, ambiente e status. |
| `error.rs` | `error.ts` | verified | `MunError` com categorias equivalentes para uso TypeScript. |
| `provider.rs` | `provider.ts` | partial | Interfaces e contexto existem; mTLS/HTTP client nativo não é implementado. |
| `providers.rs` | `providers.ts` | implemented | Metadados, endpoints e municípios dos provedores DSF, GINFES, SigISS, São Paulo e Simpliss. |
| `registry.rs` | `registry.ts` | verified | `resolve`, `isMunicipal` e endpoint nacional-municipal Simpliss. |
| `abrasf/mod.rs` + `transport.rs` | `abrasf/index.ts` | verified | Builder `GerarNfseEnvio`, SOAP envelope e parser de retorno. |
| `saopaulo/mod.rs` + `transport.rs` | `saopaulo/index.ts` | verified | Assinaturas v1/v2, lote RPS v1/v2, SOAP, consulta, cancelamento e parser. |
| `lib.rs` | `index.ts` | verified | Reexporta API pública principal e aliases snake_case. |

## Evidência

Última verificação: 2026-06-08.

- `tests/fiscal-nfse-mun/nfse-mun.test.ts` cobre builders ABRASF, builders São
  Paulo, strings de assinatura, SOAP, parsers e registry;
- `tests/fiscal-parity/xsd-gates.test.ts` valida lote RPS São Paulo v1/v2
  assinado contra os XSDs oficiais;
- `bunx tsc --noEmit`: passou;
- `bun test`: passou.

## Diferenças conhecidas

- No Rust, a feature `client` implementa `emitir`, `consultar` e `cancelar`
  com transporte SOAP/REST e mTLS em alguns provedores. No TypeScript, a porta
  atual entrega builders, parsers, registry e metadados de endpoint; o cliente
  HTTP/mTLS deve ser injetado por aplicação ou implementado como camada separada.
- O contexto `ProviderCtx` aceita `pfx_der` e `senha`, mas não constrói
  automaticamente um cliente HTTP com identidade PKCS#12.
