import { useCallback, useEffect, useState } from 'react';
import { fetchGa4Report, Ga4ServiceError } from '../ga4Service';
import DateRangePicker from '../components/DateRangePicker';
import Ga4SourceBarChart from '../components/ga4/Ga4SourceBarChart';
import ErrorPanel from '../components/ErrorPanel';
import Loader from '../components/Loader';

export default function Ga4AcquisitionPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchGa4Report('acquisition', { from, to });
      setRows(data);
    } catch (err) {
      setError(err instanceof Ga4ServiceError ? err : new Ga4ServiceError('unknown', err.message));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4">
      <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} onRefresh={loadData} loading={loading} />

      {error && <ErrorPanel error={error} source="ga4" />}
      {loading && <Loader />}

      {!loading && !error && rows.length > 0 && <Ga4SourceBarChart rows={rows} />}

      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)]">Nessun dato disponibile per il periodo selezionato.</p>
      )}
    </div>
  );
}
