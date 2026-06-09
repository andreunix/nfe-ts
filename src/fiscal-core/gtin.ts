import { FiscalError } from "./error.ts";

/** Calcula o dígito verificador de GTIN-8/12/13/14 pelo algoritmo oficial. */
export function calculateCheckDigit(gtin: string): number {
  if (gtin.length < 2) throw FiscalError.invalidGtin("GTIN must have at least 2 digits");
  if (!/^\d+$/.test(gtin)) throw FiscalError.invalidGtin(`GTIN must contain only digits: "${gtin}" is not valid.`);

  const withoutCheck = gtin.slice(0, -1).padStart(15, "0");
  let total = 0;
  for (let pos = 0; pos < withoutCheck.length; pos += 1) {
    const digit = Number(withoutCheck[pos]);
    const multiplier = ((pos + 1) % 2) * 2 + 1;
    total += multiplier * digit;
  }
  return (10 - (total % 10)) % 10;
}
export const calculate_check_digit = calculateCheckDigit;

/**
 * Valida um GTIN usado em produtos.
 *
 * String vazia e `SEM GTIN` são aceitos porque representam produto isento.
 */
export function isValidGtin(gtin: string): true {
  if (gtin === "" || gtin === "SEM GTIN") return true;
  if (!/^\d+$/.test(gtin)) throw FiscalError.invalidGtin(`GTIN must contain only digits: "${gtin}" is not valid.`);
  if (![8, 12, 13, 14].includes(gtin.length)) {
    throw FiscalError.invalidGtin(`GTIN must be 8, 12, 13, or 14 digits. Got ${gtin.length} digits.`);
  }
  if (Number(gtin.at(-1)) !== calculateCheckDigit(gtin)) {
    throw FiscalError.invalidGtin(`GTIN "${gtin}" has an invalid check digit.`);
  }
  return true;
}
export const is_valid_gtin = isValidGtin;
