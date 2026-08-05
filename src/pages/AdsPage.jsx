import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCampaignCsv, DataServiceError } from '../dataService';
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
import KpiGrid from '../components/KpiGrid';
import TrendChart from '../components/TrendChart';
import CampaignBarChart from '../components/CampaignBarChart';
import ActionTypeChart from '../components/ActionTypeChart';
import CampaignTable from '../components/CampaignTable';
import CampaignStatusPanel from '../components/CampaignStatusPanel';
import AnomaliesLog from '../components/AnomaliesLog';
import ErrorPanel from '../components/ErrorPanel';
import Loader from '../components/Loader';

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
        </>
      )}

      {!loading && !error && records.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)]">Nessun dato disponibile.</p>
      )}
    </div>
  );
}
