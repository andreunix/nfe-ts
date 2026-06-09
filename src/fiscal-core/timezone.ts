/** Retorna o timezone IANA usado como referência para uma UF brasileira. */
export function timezoneForUf(uf: string): string | undefined {
  switch (uf.toUpperCase()) {
    case "AC": return "America/Rio_Branco";
    case "AL": return "America/Maceio";
    case "AM": return "America/Manaus";
    case "AP": return "America/Belem";
    case "BA": return "America/Bahia";
    case "CE": return "America/Fortaleza";
    case "DF": return "America/Sao_Paulo";
    case "ES": return "America/Sao_Paulo";
    case "GO": return "America/Sao_Paulo";
    case "MA": return "America/Fortaleza";
    case "MG": return "America/Sao_Paulo";
    case "MS": return "America/Campo_Grande";
    case "MT": return "America/Cuiaba";
    case "PA": return "America/Belem";
    case "PB": return "America/Fortaleza";
    case "PE": return "America/Recife";
    case "PI": return "America/Fortaleza";
    case "PR": return "America/Sao_Paulo";
    case "RJ": return "America/Sao_Paulo";
    case "RN": return "America/Fortaleza";
    case "RO": return "America/Porto_Velho";
    case "RR": return "America/Boa_Vista";
    case "RS": return "America/Sao_Paulo";
    case "SC": return "America/Sao_Paulo";
    case "SE": return "America/Maceio";
    case "SP": return "America/Sao_Paulo";
    case "TO": return "America/Araguaina";
    default: return undefined;
  }
}
export const timezone_for_uf = timezoneForUf;
