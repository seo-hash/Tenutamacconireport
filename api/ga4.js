import { BetaAnalyticsDataClient } from '@google-analytics/data';

const VALID_REPORTS = new Set(['overview', 'acquisition', 'pages']);

function getClient() {
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new Error('missing-credentials');
  }
  return new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  });
}

function defaultDateRange(from, to) {
  const end = to || new Date().toISOString().slice(0, 10);
  const start =
    from ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
  return { startDate: start, endDate: end };
}

function rowsToObjects(response, dimensionKeys, metricKeys) {
  return (response.rows || []).map((row) => {
    const obj = {};
    row.dimensionValues.forEach((v, i) => {
      obj[dimensionKeys[i]] = v.value;
    });
    row.metricValues.forEach((v, i) => {
      obj[metricKeys[i]] = Number(v.value);
    });
    return obj;
  });
}

async function runOverview(client, propertyId, dateRange) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });
  return rowsToObjects(response, ['date'], ['sessions', 'activeUsers', 'engagementRate', 'avgSessionDuration']);
}

async function runAcquisition(client, propertyId, dateRange) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'conversions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
  return rowsToObjects(response, ['channel'], ['sessions', 'activeUsers', 'conversions']);
}

async function runPages(client, propertyId, dateRange) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 20,
  });
  return rowsToObjects(response, ['path', 'title'], ['pageViews', 'activeUsers']);
}

export default async function handler(req, res) {
  const { report, from, to } = req.query;

  if (!VALID_REPORTS.has(report)) {
    res.status(400).json({ error: `Parametro "report" mancante o non valido. Valori ammessi: ${[...VALID_REPORTS].join(', ')}.` });
    return;
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    res.status(500).json({ error: 'GA4_PROPERTY_ID non configurato lato server.' });
    return;
  }

  let client;
  try {
    client = getClient();
  } catch {
    res.status(500).json({ error: 'Credenziali GA4 non configurate lato server (GA4_CLIENT_EMAIL / GA4_PRIVATE_KEY).' });
    return;
  }

  const dateRange = defaultDateRange(from, to);

  try {
    let data;
    if (report === 'overview') data = await runOverview(client, propertyId, dateRange);
    else if (report === 'acquisition') data = await runAcquisition(client, propertyId, dateRange);
    else data = await runPages(client, propertyId, dateRange);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.status(200).json({ report, dateRange, data });
  } catch (err) {
    console.error('[api/ga4] Errore GA4 Data API:', err);
    res.status(502).json({ error: 'Errore nel recupero dei dati da Google Analytics. Verifica property ID e permessi del service account.' });
  }
};
