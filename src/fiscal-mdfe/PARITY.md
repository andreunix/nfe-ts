# Paridade fiscal-mdfe Rust -> TypeScript

Este arquivo rastreia a porta de `tmp/fiscal-rs/crates/fiscal-mdfe/src` para
`src/fiscal-mdfe`.

## Módulos

| Rust | TypeScript | Estado | Observações |
| --- | --- | --- | --- |
| `access_key.rs` | `access_key.ts` | verified | `MdfeAccessKey`, builder por parâmetros e builder a partir de `ide`. |
| `builder.rs` | `builder.ts` | verified | MDF-e rodoviário, aéreo, aquaviário e ferroviário portados; MDF-e rodoviário assinado valida contra XSD oficial. |
| `signing.rs` | `signing.ts` | verified | Reexporta `signMdfeXml` e `signMdfeXmlWithAlgorithm`. |
| `types.rs` | `types.ts` | verified | Interfaces TypeScript espelham os structs públicos usados pelo builder. |
| `validate.rs` | `validate.ts` | implemented | Validação estrutural leve equivalente ao Rust local; validação forte fica no gate XSD. |
| `lib.rs` | `index.ts` | verified | Exporta constantes, tipos, access key, builder, signing e validação. |

## Evidência

Última verificação: 2026-06-08.

- `tests/fiscal-mdfe/mdfe.test.ts` cobre access key, builder dos quatro modais,
  assinatura e validação estrutural;
- `tests/fiscal-parity/xsd-gates.test.ts` valida MDF-e assinado contra
  `mdfe_v3.00.xsd`;
- `bunx tsc --noEmit`: passou;
- `bun test`: passou.

## Diferenças conhecidas

- O TypeScript usa interfaces/unions e lança `FiscalError`, em vez de retornar
  `Result<String, FiscalError>`.
- Datas aceitam `Date | string`; a saída preserva a semântica fiscal esperada
  nos testes e no XSD.
