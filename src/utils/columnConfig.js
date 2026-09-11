// Mapping colonne fisso (posizionale) sul foglio Google Sheet pubblicato
// per la campagna "Campagna_camere_tenuta_macconi":
//
// Data, Reach, Frequenza, Impression, CPM (€), Click (tutti), CTR (tutti),
// CPC (tutti) (€), Click sul link, CTR link, CPC link (€), Click in uscita,
// Landing page views, Spesa (€)
//
// Il parsing ignora automaticamente un'eventuale riga di intestazione se
// presente.

export const FIELD_TYPES = {
  DATE: 'date',
  STRING: 'string',
  NUMBER: 'number',
  CURRENCY: 'currency',
};

// key: identificatore stabile usato nel codice per accedere al campo
// index: posizione nella riga CSV (0-based)
export const DEFAULT_COLUMNS = [
  { key: 'data_report', index: 0, label: 'Data', type: FIELD_TYPES.DATE, visible: true },
  { key: 'reach', index: 1, label: 'Reach', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'frequenza', index: 2, label: 'Frequenza', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'impression', index: 3, label: 'Impression', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'cpm', index: 4, label: 'CPM (€)', type: FIELD_TYPES.CURRENCY, visible: true },
  { key: 'click_totali', index: 5, label: 'Click (tutti)', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'ctr_totali', index: 6, label: 'CTR (tutti)', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'cpc_totali', index: 7, label: 'CPC (tutti) (€)', type: FIELD_TYPES.CURRENCY, visible: true },
  { key: 'click_link', index: 8, label: 'Click sul link', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'ctr_link', index: 9, label: 'CTR link', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'cpc_link', index: 10, label: 'CPC link (€)', type: FIELD_TYPES.CURRENCY, visible: true },
  { key: 'click_uscita', index: 11, label: 'Click in uscita', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'landing_page_views', index: 12, label: 'Landing page views', type: FIELD_TYPES.NUMBER, visible: true },
  { key: 'spesa_effettiva', index: 13, label: 'Spesa (€)', type: FIELD_TYPES.CURRENCY, visible: true },
];

export const EXPECTED_COLUMN_COUNT = DEFAULT_COLUMNS.length;

// La colonna che rappresenta la spesa effettiva.
export const DEFAULT_SPEND_SOURCE = { mode: 'column', columnKey: 'spesa_effettiva' };

// Il foglio non ha più una colonna "Nome campagna" (contiene i dati
// giornalieri di un'unica campagna): questo nome viene usato per
// sintetizzare i campi che i componenti esistenti (tabelle, grafici,
// aggregazioni) si aspettano ancora.
export const SINGLE_CAMPAIGN_NAME = 'Campagna_camere_tenuta_macconi';

/**
 * Adatta un record del nuovo formato foglio (KPI di traffico giornalieri)
 * alla struttura dati "legacy" usata da metrics.js e dai componenti di
 * rendering esistenti (nome_campagna, stato, risultati, tipo_azione,
 * costo_per_risultato, budget_totale, data_fine_campagna), così non serve
 * riscrivere la logica di grafici/tabelle: basta mappare i nuovi campi su
 * quelli attesi. Per l'obiettivo "traffico" i "risultati" della campagna
 * sono i click sul link.
 */
export function toLegacyRecord(record) {
  return {
    ...record,
    nome_campagna: SINGLE_CAMPAIGN_NAME,
    stato: 'active',
    risultati: record.click_link ?? 0,
    tipo_azione: 'Click sul link',
    costo_per_risultato: record.cpc_link ?? 0,
    budget_totale: 0,
    data_fine_campagna: null,
  };
}
