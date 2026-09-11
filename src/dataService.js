import Papa from 'papaparse';
import { parseItalianNumber } from './utils/parseItalianNumber';
import { EXPECTED_COLUMN_COUNT, FIELD_TYPES } from './utils/columnConfig';

export class DataServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function parseIsoDate(raw) {
  if (!raw) return null;
  const str = String(raw).trim();

  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const [, y, mo, d] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d));
  }

  // Google Sheets può esportare le date in formato italiano GG/MM/AAAA
  // (o GG-MM-AAAA) a seconda della localizzazione del foglio.
  m = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d));
  }

  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Scarica il CSV pubblicato (senza header) e lo parsa posizionalmente
 * secondo la configurazione colonne passata.
 * Restituisce { records, anomalies } dove ogni record ha un campo per
 * ogni colonna configurata (chiave = columns[].key), con conversioni di
 * tipo applicate (date, numeri IT con virgola, stringhe).
 */
export async function fetchCampaignCsv(csvUrl, columns) {
  if (!csvUrl) {
    throw new DataServiceError('missing-url', 'Nessun URL del CSV configurato.');
  }

  let response;
  try {
    response = await fetch(csvUrl, { cache: 'no-store' });
  } catch {
    throw new DataServiceError(
      'network',
      'Impossibile raggiungere il CSV. Verifica la connessione e l\'URL, oppure che il foglio sia pubblicato sul web.'
    );
  }

  if (!response.ok) {
    throw new DataServiceError('http', `Il server ha risposto con errore ${response.status}.`);
  }

  const text = await response.text();
  if (!text || !text.trim()) {
    throw new DataServiceError('empty', 'Il CSV scaricato è vuoto.');
  }

  const parsed = Papa.parse(text.trim(), {
    header: false,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (!parsed.data || parsed.data.length === 0) {
    throw new DataServiceError('parse', 'Il formato del CSV non è valido o non contiene righe.');
  }

  const records = [];
  const anomalies = [];

  // Il foglio non dovrebbe avere intestazioni, ma può capitare (es. dopo
  // "Pubblica sul web" con la prima riga di etichette). Se le colonne di
  // tipo data della prima riga non sono date valide, la trattiamo come
  // intestazione e la saltiamo senza segnalarla come anomalia.
  const dateColumnIndexes = columns.filter((c) => c.type === FIELD_TYPES.DATE).map((c) => c.index);
  const firstRow = parsed.data[0];
  const looksLikeHeader =
    firstRow &&
    firstRow.length === EXPECTED_COLUMN_COUNT &&
    dateColumnIndexes.length > 0 &&
    dateColumnIndexes.every((idx) => !parseIsoDate(firstRow[idx]));
  const dataRows = looksLikeHeader ? parsed.data.slice(1) : parsed.data;
  const rowNumberOffset = looksLikeHeader ? 1 : 0;

  dataRows.forEach((row, i) => {
    const rowNumber = i + 1 + rowNumberOffset;
    if (row.length !== EXPECTED_COLUMN_COUNT) {
      anomalies.push({
        rowNumber,
        reason: `Numero di colonne inatteso: ${row.length} (attese ${EXPECTED_COLUMN_COUNT})`,
        raw: row,
      });
      return;
    }

    const record = { __rowNumber: rowNumber, __raw: row };
    let hasFieldWarning = false;

    for (const col of columns) {
      const raw = row[col.index];
      let value;
      switch (col.type) {
        case FIELD_TYPES.DATE:
          value = parseIsoDate(raw);
          if (raw && !value) hasFieldWarning = true;
          break;
        case FIELD_TYPES.NUMBER:
        case FIELD_TYPES.CURRENCY:
          value = parseItalianNumber(raw, { context: `riga ${rowNumber}, colonna ${col.label}` });
          break;
        default:
          value = raw == null ? '' : String(raw).trim();
      }
      record[col.key] = value;
    }

    if (hasFieldWarning) {
      anomalies.push({
        rowNumber,
        reason: 'Una o più date non sono nel formato atteso (YYYY-MM-DD).',
        raw: row,
      });
    }

    records.push(record);
  });

  return { records, anomalies };
}
