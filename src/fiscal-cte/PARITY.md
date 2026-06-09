# Paridade fiscal-cte Rust -> TypeScript

Este arquivo rastreia a porta de `tmp/fiscal-rs/crates/fiscal-cte/src` para
`src/fiscal-cte`.

Estados:

- `missing`: ainda não existe equivalente TypeScript.
- `partial`: existe, mas não cobre toda a API/comportamento Rust.
- `implemented`: API pública principal existe e comportamento central foi portado.
- `verified`: implementado e coberto por testes, incluindo XSD oficial quando aplicável.

## Módulos

| Rust | TypeScript | Estado | Observações |
| --- | --- | --- | --- |
| `access_key.rs` | `access_key.ts` | verified | `CteAccessKey`, builders por parâmetros/IDE/modelo e aliases snake_case. |
| `builder.rs` | `builder.ts` | verified | CT-e normal, complementar e substituto validam contra `cte_v4.00.xsd` quando assinados. |
| `builder_os.rs` | `builder_os.ts` | verified | CT-e OS assinado valida contra `cteOS_v4.00.xsd`. |
| `builder_gtve.rs` | `builder_gtve.ts` | verified | GTV-e assinado valida contra `GTVe_v4.00.xsd`. |
| `builder_bpe.rs` | `builder_bpe.ts` | verified | BP-e assinado valida contra `bpe_v1.00.xsd` com `infBPeSupl` informado pelo hub. |
| `builder_nfse.rs` | `builder_nfse.ts` | verified | DPS e evento de cancelamento NFS-e assinados validam contra XSD nacional 1.01. |
| `signing.rs` | `signing.ts` | verified | Reexporta helpers de assinatura XML-DSig do `fiscal-crypto`. |
| `types*.rs` | `types*.ts` | verified | Interfaces TypeScript espelham os structs públicos usados pelos builders. |
| `validate.rs` | `validate.ts` | implemented | Validação estrutural leve equivalente ao Rust local; validação forte fica nos gates XSD. |

## Evidência

Última verificação: 2026-06-08.

- `tests/fiscal-parity/xsd-gates.test.ts` cobre os gates XSD equivalentes aos
  testes Rust `xsd_roundtrip*`;
- `tests/fiscal-cte/cte.test.ts` cobre access key, builders, assinatura e
  validação estrutural;
- `bunx tsc --noEmit`: passou;
- `bun test`: passou.

## Diferenças conhecidas

- O TypeScript usa interfaces e unions em vez de structs/enums Rust.
- Funções retornam `string` e lançam `FiscalError` quando aplicável, em vez de
  `Result<String, FiscalError>`.
- `infBPeSupl` continua fora do builder BP-e, como no gate Rust: o hub injeta
  esse bloco antes da assinatura quando precisa validar/enviar.
