// Aggregazioni e calcoli derivati sui record normalizzati.
// La spesa effettiva non è (ancora) una colonna dedicata nel Sheet: finché
// non viene identificata, viene calcolata come risultati * costo_per_risultato.

export function computeSpend(record, spendSource) {
  if (spendSource?.mode === 'column' && spendSource.columnKey) {
    const v = record[spendSource.columnKey];
    return { value: typeof v === 'number' ? v : 0, calculated: false };
  }
  const risultati = record.risultati ?? 0;
  const costo = record.costo_per_risultato ?? 0;
  return { value: risultati * costo, calculated: true };
}

export function filterRecords(records, { from, to, campaigns, status }) {
  return records.filter((r) => {
    if (from && r.data_report && r.data_report < from) return false;
    if (to && r.data_report && r.data_report > to) return false;
    if (campaigns?.length && !campaigns.includes(r.nome_campagna)) return false;
    if (status && status !== 'all' && r.stato !== status) return false;
    return true;
  });
}

export function aggregateTotals(records, spendSource) {
  let spend = 0;
  let results = 0;
  let impressions = 0;
  let reach = 0;
  let budget = 0;
  const activeCampaigns = new Set();
  const pausedCampaigns = new Set();
  const allCampaigns = new Set();
  let calculated = false;

  for (const r of records) {
    const s = computeSpend(r, spendSource);
    spend += s.value;
    calculated = calculated || s.calculated;
    results += r.risultati ?? 0;
    impressions += r.impression ?? 0;
    reach += r.reach ?? 0;
    allCampaigns.add(r.nome_campagna);
    if (!activeCampaigns.has(r.nome_campagna) && !pausedCampaigns.has(r.nome_campagna)) {
      budget += r.budget_totale ?? 0;
    }
    if (r.stato === 'active') activeCampaigns.add(r.nome_campagna);
    else if (r.stato === 'paused') pausedCampaigns.add(r.nome_campagna);
  }

  const avgCostPerResult = results > 0 ? spend / results : 0;

  return {
    spend,
    spendCalculated: calculated,
    results,
    impressions,
    reach,
    budget,
    avgCostPerResult,
    activeCount: activeCampaigns.size,
    pausedCount: pausedCampaigns.size,
    campaignCount: allCampaigns.size,
  };
}

// Riconosce le righe del foglio il cui "tipo_azione" corrisponde a una delle
// etichette Meta indicate (case-insensitive, match parziale) — es. per
// isolare le "Visualizzazioni della pagina di destinazione" (landing page
// view) dai "Clic sul link" quando il foglio esporta più action type.
export function filterByActionKeyword(records, keywords) {
  const needles = keywords.map((k) => k.toLowerCase());
  return records.filter((r) => {
    const label = (r.tipo_azione || '').toLowerCase();
    return needles.some((n) => label.includes(n));
  });
}

export const LANDING_PAGE_VIEW_KEYWORDS = ['pagina di destinazione', 'landing page view', 'landing_page_view'];
export const LINK_CLICK_KEYWORDS = ['clic sul link', 'click sul link', 'link click', 'link_click'];

export function groupByReportDate(records, spendSource) {
  const map = new Map();
  for (const r of records) {
    if (!r.data_report) continue;
    const key = r.data_report.toISOString().slice(0, 10);
    if (!map.has(key)) {
      map.set(key, { date: key, results: 0, spend: 0 });
    }
    const entry = map.get(key);
    entry.results += r.risultati ?? 0;
    entry.spend += computeSpend(r, spendSource).value;
  }
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      ...e,
      costPerResult: e.results > 0 ? e.spend / e.results : 0,
    }));
}

export function groupByCampaign(records, spendSource) {
  const map = new Map();
  for (const r of records) {
    const key = r.nome_campagna || 'N/D';
    if (!map.has(key)) {
      map.set(key, {
        campaign: key,
        results: 0,
        spend: 0,
        impressions: 0,
        reach: 0,
        budget: r.budget_totale ?? 0,
        status: r.stato,
        endDate: r.data_fine_campagna,
      });
    }
    const entry = map.get(key);
    entry.results += r.risultati ?? 0;
    entry.spend += computeSpend(r, spendSource).value;
    entry.impressions += r.impression ?? 0;
    entry.reach += r.reach ?? 0;
  }
  return Array.from(map.values()).map((e) => ({
    ...e,
    costPerResult: e.results > 0 ? e.spend / e.results : 0,
    remainingBudget: (e.budget ?? 0) - e.spend,
  }));
}

export function groupByActionType(records, spendSource) {
  const map = new Map();
  for (const r of records) {
    const key = r.tipo_azione || 'N/D';
    if (!map.has(key)) {
      map.set(key, { actionType: key, results: 0, spend: 0 });
    }
    const entry = map.get(key);
    entry.results += r.risultati ?? 0;
    entry.spend += computeSpend(r, spendSource).value;
  }
  return Array.from(map.values()).sort((a, b) => b.results - a.results);
}
