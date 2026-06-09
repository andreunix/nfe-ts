# Exemplos fiscal-js

Execute a partir da raiz do projeto:

```bash
bun examples/nfe.ts
bun examples/nfce.ts
bun examples/cte.ts
bun examples/mdfe.ts
bun examples/nfse-municipal.ts
bun examples/xsd-validation.ts
```

Os exemplos geram XMLs e payloads locais. Eles não transmitem documentos para
SEFAZ ou prefeitura. Para emissão real, assine com certificado válido, configure
transporte HTTP/mTLS do seu runtime e use URLs/ambiente corretos.
