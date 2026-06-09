/** Formata inteiro em centavos como decimal com quantidade configurável de casas. */
export function formatCents(cents: number | bigint, decimalPlaces: number): string {
  return (Number(cents) / 100).toFixed(decimalPlaces);
}
export const format_cents = formatCents;

/** Formata centavos com duas casas decimais, padrão para valores monetários NF-e. */
export function formatCents2(cents: number | bigint): string {
  return formatCents(cents, 2);
}
export const format_cents_2 = formatCents2;

/** Formata centavos com dez casas decimais, útil para preços unitários. */
export function formatCents10(cents: number | bigint): string {
  return formatCents(cents, 10);
}
export const format_cents_10 = formatCents10;

/** Formata número decimal com casas fixas. */
export function formatDecimal(value: number, decimalPlaces: number): string {
  return value.toFixed(decimalPlaces);
}
export const format_decimal = formatDecimal;

/** Formata alíquota armazenada em centésimos de percentual. */
export function formatRate(hundredths: number | bigint, decimalPlaces: number): string {
  return (Number(hundredths) / 100).toFixed(decimalPlaces);
}
export const format_rate = formatRate;

/** Formata alíquota armazenada como valor multiplicado por 10.000. */
export function formatRate4(value: number | bigint): string {
  return (Number(value) / 10000).toFixed(4);
}
export const format_rate4 = formatRate4;

/** Formata centavos opcionais; retorna `undefined` quando não há valor. */
export function formatCentsOrNone(value: number | bigint | undefined | null, decimalPlaces: number): string | undefined {
  return value === undefined || value === null ? undefined : formatCents(value, decimalPlaces);
}
export const format_cents_or_none = formatCentsOrNone;

/** Formata centavos opcionais usando zero quando não há valor. */
export function formatCentsOrZero(value: number | bigint | undefined | null, decimalPlaces: number): string {
  return formatCents(value ?? 0, decimalPlaces);
}
export const format_cents_or_zero = formatCentsOrZero;

/** Formata alíquota `Rate4` opcional usando `0.0000` quando não há valor. */
export function formatRate4OrZero(value: number | bigint | undefined | null): string {
  return value === undefined || value === null ? "0.0000" : formatRate4(value);
}
export const format_rate4_or_zero = formatRate4OrZero;
