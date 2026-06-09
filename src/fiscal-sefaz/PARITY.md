# Paridade fiscal-sefaz Rust -> TypeScript

Este arquivo rastreia a porta de `tmp/fiscal-rs/crates/fiscal-sefaz/src` para
`src/fiscal-sefaz`.

## Escopo implementado

| Rust | TypeScript | Estado | Observações |
| --- | --- | --- | --- |
| `services.rs` | `services.ts` | implemented | Metadados de serviços NF-e/NFC-e e chaves de URL. |
| `soap.rs` | `soap.ts` | implemented | Envelopes SOAP NF-e, cabeçalho legado, DistDFe e payload gzip+base64. |
| `request_builders/*` | `request_builders/*` | implemented | Autorização, consultas, inutilização, eventos, EPEC, lotes, conciliação e RTC. |
| `urls/*` | `urls/*` | implemented | Resolução NF-e/NFC-e/AN/SVC com tabela funcional. |
| `validate.rs` | `validate.ts` | implemented | Validação sintática XML e conferência básica de autorização. |
| `client/*` | `client/*` | implemented | Cliente `SefazClient`, aliases snake_case e métodos convenientes. |
| `response_parsers/*` | `response_parsers/*` | verified | Parsers NF-e de autorização, status, cancelamento, inutilização, consulta, DistDFe, cadastro e CSC. |
| `cte/*` | `cte/*` | implemented | Metadados, builders, eventos, SOAP, URLs e parsers CT-e. |
| `mdfe/*` | `mdfe/*` | implemented | Metadados, builders, eventos, SOAP, URLs e parsers MDF-e. |

## Auditoria

Última verificação: 2026-06-08.

- módulos principais Rust cobertos em TS: serviços, SOAP, URLs, validação,
  request builders, cliente, CT-e, MDF-e e parsers;
- parsers públicos Rust `parse_*` sem equivalente TS: `0` de `16`;
- `bunx tsc --noEmit`: passou;
- `bun test`: passou com `27` testes totais no projeto, incluindo `13` testes
  de `fiscal-sefaz`;
- `cargo test` no crate Rust de referência: passou anteriormente com `351`
  unit tests e `8` doctests;
- dependências adicionadas: `fast-xml-parser`, `node-forge` e
  `@types/node-forge`.

## Limites

O cliente TypeScript usa `fetch` padrão para transporte HTTP/SOAP. Ele monta
XML, SOAP action e URL como a crate Rust, mas não replica automaticamente mTLS
via PFX em runtimes que não exponham essa configuração no `fetch`; nesses casos,
injete um `fetchImpl` configurado pelo runtime. A validação XSD continua sendo
sintática/estrutural, não uma validação completa contra arquivos `.xsd`.
