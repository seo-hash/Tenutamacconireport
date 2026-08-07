import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCampaignCsv, DataServiceError } from '../dataService';
import { fetchGa4Report, Ga4ServiceError } from '../ga4Service';
import { DEFAULT_COLUMNS, DEFAULT_SPEND_SOURCE } from '../utils/columnConfig';
import {
  filterRecords,
  aggregateTotals,
  groupByReportDate,
  groupByCampaign,
  groupByActionType,
} from '../utils/metrics';
import { formatDate } from '../utils/format';

import FiltersBar from '../components/FiltersBar';
import DateRangePicker from '../components/DateRangePicker';
import KpiGrid from '../components/KpiGrid';
import TrendChart from '../components/TrendChart';
import CampaignBarChart from '../components/CampaignBarChart';
import ActionTypeChart from '../components/ActionTypeChart';
import CampaignTable from '../components/CampaignTable';
import CampaignStatusPanel from '../components/CampaignStatusPanel';
import AnomaliesLog from '../components/AnomaliesLog';
import ErrorPanel from '../components/ErrorPanel';
import Loader from '../components/Loader';
import Ga4FacebookKpiGrid from '../components/ga4/Ga4FacebookKpiGrid';
import Ga4FacebookSpendKpiGrid from '../components/ga4/Ga4FacebookSpendKpiGrid';
import Ga4FacebookCampaignsTable from '../components/ga4/Ga4FacebookCampaignsTable';

const CSV_URL = import.meta.env.VITE_CSV_URL || '';

export default function AdsPage() {
  const [records, setRecords] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [status, setStatus] = useState('all');

  const [ga4Rows, setGa4Rows] = useState([]);
  const [ga4Loading, setGa4Loading] = useState(false);
  const [ga4Error, setGa4Error] = useState(null);
  const [ga4DateRange, setGa4DateRange] = useState(null);
  const [ga4From, setGa4From] = useState(null);
  const [ga4To, setGa4To] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { records: newRecords, anomalies: newAnomalies } = await fetchCampaignCsv(CSV_URL, DEFAULT_COLUMNS);
      setRecords(newRecords);
      setAnomalies(newAnomalies);
      setLastUpdated(new Date());
      if (newRecords.length > 0) {
        const dates = newRecords.map((r) => r.data_report?.getTime()).filter(Boolean);
        if (dates.length > 0) {
          setFrom((prev) => prev ?? new Date(Math.min(...dates)));
          setTo((prev) => prev ?? new Date(Math.max(...dates)));
        }
      }
    } catch (err) {
      setError(err instanceof DataServiceError ? err : new DataServiceError('unknown', err.message));
      setRecords([]);
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Inizializza il periodo GA4 con lo stesso range del CSV Ads, ma solo alla
  // prima disponibilità: da qui in poi i due filtri sono indipendenti.
  useEffect(() => {
    if (from && to) {
      setGa4From((prev) => prev ?? from);
      setGa4To((prev) => prev ?? to);
    }
  }, [from, to]);

  const ga4RequestIdRef = useRef(0);

  const loadGa4Data = useCallback(async () => {
    const requestId = ++ga4RequestIdRef.current;
    setGa4Loading(true);
    setGa4Error(null);
    try {
      const { data, dateRange } = await fetchGa4Report('facebook', { from: ga4From, to: ga4To });
      if (requestId !== ga4RequestIdRef.current) return; // risposta obsoleta, ignorata
      setGa4Rows(data);
      setGa4DateRange(dateRange);
    } catch (err) {
      if (requestId !== ga4RequestIdRef.current) return;
      setGa4Error(err instanceof Ga4ServiceError ? err : new Ga4ServiceError('unknown', err.message));
      setGa4Rows([]);
    } finally {
      if (requestId === ga4RequestIdRef.current) setGa4Loading(false);
    }
  }, [ga4From, ga4To]);

  useEffect(() => {
    if (ga4From && ga4To) loadGa4Data();
  }, [loadGa4Data, ga4From, ga4To]);

  const allCampaigns = useMemo(() => Array.from(new Set(records.map((r) => r.nome_campagna))).sort(), [records]);

  const filteredRecords = useMemo(
    () => filterRecords(records, { from, to, campaigns: selectedCampaigns, status }),
    [records, from, to, selectedCampaigns, status]
  );

  const totals = useMemo(() => aggregateTotals(filteredRecords, DEFAULT_SPEND_SOURCE), [filteredRecords]);
  const trendData = useMemo(() => groupByReportDate(filteredRecords, DEFAULT_SPEND_SOURCE), [filteredRecords]);
  const campaignAggregates = useMemo(() => groupByCampaign(filteredRecords, DEFAULT_SPEND_SOURCE), [filteredRecords]);
  const actionTypeAggregates = useMemo(
    () => groupByActionType(filteredRecords, DEFAULT_SPEND_SOURCE),
    [filteredRecords]
  );

  const anomalousRowNumbers = useMemo(() => new Set(anomalies.map((a) => a.rowNumber)), [anomalies]);

  const ga4PeriodSpend = useMemo(() => {
    const filtered = filterRecords(records, { from: ga4From, to: ga4To, campaigns: [], status: 'all' });
    return aggregateTotals(filtered, DEFAULT_SPEND_SOURCE).spend;
  }, [records, ga4From, ga4To]);

  const ga4Totals = useMemo(
    () =>
      ga4Rows.reduce(
        (acc, r) => {
          acc.sessions += r.sessions ?? 0;
          acc.conversions += r.conversions ?? 0;
          return acc;
        },
        { sessions: 0, conversions: 0 }
      ),
    [ga4Rows]
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)]">
        {lastUpdated
          ? `Aggiornato alle ${lastUpdated.toLocaleTimeString('it-IT')} · ${formatDate(lastUpdated)}`
          : 'Nessun dato caricato'}
      </p>

      {error && <ErrorPanel error={error} />}
      {loading && <Loader />}

      {!loading && !error && records.length > 0 && (
        <>
          <AnomaliesLog anomalies={anomalies} />

          <FiltersBar
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
            campaigns={allCampaigns}
            selectedCampaigns={selectedCampaigns}
            onCampaignsChange={setSelectedCampaigns}
            status={status}
            onStatusChange={setStatus}
            onRefresh={loadData}
            loading={loading}
          />

          <KpiGrid totals={totals} />

          <TrendChart data={trendData} />

          <CampaignBarChart data={campaignAggregates} />

          <ActionTypeChart data={actionTypeAggregates} />

          <CampaignStatusPanel campaigns={campaignAggregates} />

          <CampaignTable records={filteredRecords} anomalousRowNumbers={anomalousRowNumbers} />

          <div className="space-y-4 border-t border-[var(--border)] pt-6">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">GA4 · Facebook Ads</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Sessioni GA4 del canale "Paid Social" (traffico Facebook/Instagram Ads), con periodo indipendente da
              quello del filtro campagne sopra.
              {ga4DateRange && (
                <span className="ml-1 font-medium text-[var(--text-primary)]">
                  Periodo interrogato: {ga4DateRange.startDate} → {ga4DateRange.endDate}
                </span>
              )}
            </p>

            <DateRangePicker
              from={ga4From}
              to={ga4To}
              onFromChange={setGa4From}
              onToChange={setGa4To}
              onRefresh={loadGa4Data}
              loading={ga4Loading}
            />

            {ga4Error && <ErrorPanel error={ga4Error} source="ga4" />}
            {ga4Loading && <Loader />}

            {!ga4Loading && !ga4Error && ga4Rows.length > 0 && (
              <>
                <Ga4FacebookKpiGrid rows={ga4Rows} />
                <Ga4FacebookSpendKpiGrid spend={ga4PeriodSpend} sessions={ga4Totals.sessions} conversions={ga4Totals.conversions} />
              </>
            )}
            {!ga4Loading && !ga4Error && <Ga4FacebookCampaignsTable rows={ga4Rows} />}
          </div>
        </>
      )}

      {!loading && !error && records.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)]">Nessun dato disponibile.</p>
      )}
    </div>
  );
}
