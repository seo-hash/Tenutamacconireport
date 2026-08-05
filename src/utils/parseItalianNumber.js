/**
 * Converte un numero in formato italiano (virgola decimale, eventuale
 * separatore delle migliaia con il punto) in un Number JS.
 * Ritorna 0 (con warning in console) se il valore non è interpretabile.
 */
export function parseItalianNumber(raw, { context } = {}) {
  if (raw == null) return 0;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;

  let str = String(raw).trim();
  if (str === '') return 0;

  str = str.replace(/[€$%\s]/g, '');

  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  if (hasComma && hasDot) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (hasComma) {
    str = str.replace(',', '.');
  }

  const num = parseFloat(str);
  if (Number.isNaN(num)) {
    console.warn(
      `[parseItalianNumber] Valore non numerico${context ? ` (${context})` : ''}: "${raw}" → fallback a 0`
    );
    return 0;
  }
  return num;
}
