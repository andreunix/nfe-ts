/** Estrutura mínima do layout 3.10. */
export function structure310(): Record<string, string> {
  return baseStructure();
}

/** Estrutura mínima do layout 4.00 padrão. */
export function structure400(): Record<string, string> {
  return baseStructure();
}

/** Estrutura mínima do layout 4.00 SEBRAE. */
export function structure400Sebrae(): Record<string, string> {
  return baseStructure();
}

/** Estrutura mínima do layout 4.00 local v12. */
export function structure400V12(): Record<string, string> {
  return baseStructure();
}

/** Estrutura mínima do layout 4.00 local v13. */
export function structure400V13(): Record<string, string> {
  return baseStructure();
}

/** Definição flexível das entidades TXT mais comuns. */
function baseStructure(): Record<string, string> {
  return {
    A: "A|versao|Id|pk_nItem|",
    B: "B|cUF|cNF|natOp|mod|serie|nNF|dhEmi|tpNF|idDest|cMunFG|tpImp|tpEmis|cDV|tpAmb|finNFe|indFinal|indPres|procEmi|verProc|",
    C: "C|CNPJ|CPF|xNome|xFant|IE|CRT|",
    C02: "C02|xLgr|nro|xCpl|xBairro|cMun|xMun|UF|CEP|cPais|xPais|fone|",
    E: "E|CNPJ|CPF|xNome|indIEDest|IE|email|",
    E05: "E05|xLgr|nro|xCpl|xBairro|cMun|xMun|UF|CEP|cPais|xPais|fone|",
    I: "I|nItem|cProd|cEAN|xProd|NCM|CFOP|uCom|qCom|vUnCom|vProd|cEANTrib|uTrib|qTrib|vUnTrib|indTot|",
    M: "M|vTotTrib|",
    N: "N|orig|CST|CSOSN|vBC|pICMS|vICMS|",
    Q: "Q|CST|vBC|pPIS|vPIS|",
    S: "S|CST|vBC|pCOFINS|vCOFINS|",
    W: "W|vBC|vICMS|vProd|vNF|",
    X: "X|modFrete|",
    YA: "YA|tPag|vPag|",
    Z: "Z|infCpl|",
  };
}
