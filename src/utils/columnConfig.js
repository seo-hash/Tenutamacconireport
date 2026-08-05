// Mapping colonne fisso (posizionale). Il parsing ignora automaticamente
// un'eventuale riga di intestazione se presente.
//
// Verificato sul foglio reale dell'utente: indice 9 è "Importo speso (EUR)",
// una colonna di spesa dedicata.

export const FIELD_TYPES = {
  DATE: 'date',
  STRING: 'string',
  NUMBER: 'number',
  CURRENCY: 'currency',
};

// key: identificatore stabile usato nel codice per accedere al campo
// index: posizione nella riga CSV (0-based)
export const DEFAULT_COLUMNS = [
  { key: 'data_inizio_campagna', index: 0, label: 'Data inizio campagna', type: FIELD_TYPES.DATE, visible: true },
  { key: 'data_report', index: 1, label: 'Data report', type: FIELD_TYPES.DATE, visible: true },
  { key: 'nome_campagna', index: 2, label: 'Nome campagna', type: FIELD_TYPES.STRING, visible: true },
  { key: 'stato', index: 3, label: 'Stato', type: FIELD_TYPES.STRING, visible: true },
  { key: 'risultati', index: 4, label: 'Risultati', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'tipo_azione', index: 5, label: 'Tipo azione', type: FIELD_TYPES.STRING, visible: true },
  { key: 'costo_per_risultato', index: 6, label: 'Costo per risultato', type: FIELD_TYPES.CURRENCY, visible: true },
  // Nelle campagne con budget ottimizzato a livello di campagna (CBO), questo
  // campo contiene il testo "Uso del budget della campagna" invece di un
  // numero: viene gestito dal fallback standard (0 + warning in console).
  { key: 'budget_totale', index: 7, label: 'Budget gruppo inserzioni', type: FIELD_TYPES.CURRENCY, visible: true },
  { key: 'campo_8_da_verificare', index: 8, label: 'Campo 8 (da verificare)', type: FIELD_TYPES.NUMBER, visible: false },
  { key: 'spesa_effettiva', index: 9, label: 'Spesa effettiva (importo speso EUR)', type: FIELD_TYPES.CURRENCY, visible: true },
  { key: 'impression', index: 10, label: 'Impression', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'reach', index: 11, label: 'Reach', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'data_fine_campagna', index: 12, label: 'Data fine campagna', type: FIELD_TYPES.DATE, visible: true },
  { key: 'data_inizio_duplicata', index: 13, label: 'Data inizio (dup.)', type: FIELD_TYPES.DATE, visible: false },
  { key: 'finestra_attribuzione', index: 14, label: 'Finestra attribuzione', type: FIELD_TYPES.STRING, visible: true },
  { key: 'campo_15_da_verificare', index: 15, label: 'Campo 15 (da verificare)', type: FIELD_TYPES.NUMBER, visible: false },
  { key: 'strategia_offerta', index: 16, label: 'Strategia offerta', type: FIELD_TYPES.STRING, visible: true },
  { key: 'campo_17_da_verificare', index: 17, label: 'Campo 17 (da verificare)', type: FIELD_TYPES.NUMBER, visible: false },
];

export const EXPECTED_COLUMN_COUNT = DEFAULT_COLUMNS.length;

// La colonna che rappresenta la spesa effettiva: il foglio ha una colonna
// dedicata ("Importo speso (EUR)", indice 9).
export const DEFAULT_SPEND_SOURCE = { mode: 'column', columnKey: 'spesa_effettiva' };
