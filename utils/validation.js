/**
 * Validation & parsing helpers.
 */

export const toNumber = (v) => {
  const n = Number(String(v == null ? "" : v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
};

export const isValidIban = (iban) =>
  /^[A-Z0-9]{8,34}$/.test(String(iban == null ? "" : iban).replace(/\s+/g, "").toUpperCase());

export const isValidSwift = (swift) =>
  /^[A-Z]{4}-[A-Z]{2}-[A-Z0-9]{2}-\d{4}$/.test(String(swift == null ? "" : swift).toUpperCase());
