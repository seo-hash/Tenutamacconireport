import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { isAuthenticated } from './_auth.js';

const VALID_REPORTS = new Set(['overview', 'acquisition', 'pages', 'facebook', 'facebook_daily']);

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
      { name: 'newUsers' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViews' },
      { name: 'screenPageViewsPerSession' },
      { name: 'bounceRate' },
      { name: 'conversions' },
    ],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });
  return rowsToObjects(response, ['date'], [
    'sessions',
    'activeUsers',
    'newUsers',
    'engagementRate',
    'avgSessionDuration',
    'pageViews',
    'pageViewsPerSession',
    'bounceRate',
    'conversions',
  ]);
}

async function runAcquisition(client, propertyId, dateRange) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'newUsers' },
      { name: 'conversions' },
      { name: 'engagementRate' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
  return rowsToObjects(response, ['channel'], ['sessions', 'activeUsers', 'newUsers', 'conversions', 'engagementRate']);
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

async function runFacebook(client, propertyId, dateRange) {
  // Meta (Facebook/Instagram Ads) finisce nel canale GA4 "Paid Social" con
  // sessionSource "fb"/"ig" e sessionCampaignName pari all'ID numerico della
  // campagna Meta (non un nome leggibile), quindi filtriamo sul channel group.
  const paidSocialFilter = {
    filter: {
      fieldName: 'sessionDefaultChannelGroup',
      stringFilter: { matchType: 'EXACT', value: 'Paid Social' },
    },
  };

  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: 'sessionCampaignName' }, { name: 'sessionSource' }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'newUsers' },
      { name: 'conversions' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ],
    dimensionFilter: paidSocialFilter,
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
  return rowsToObjects(
    response,
    ['campaign', 'source'],
    ['sessions', 'activeUsers', 'newUsers', 'conversions', 'engagementRate', 'avgSessionDuration', 'bounceRate']
  );
}

async function runFacebookDaily(client, propertyId, dateRange) {
  const paidSocialFilter = {
    filter: {
      fieldName: 'sessionDefaultChannelGroup',
      stringFilter: { matchType: 'EXACT', value: 'Paid Social' },
    },
  };

  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }, { name: 'conversions' }],
    dimensionFilter: paidSocialFilter,
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });
  const rows = rowsToObjects(response, ['date'], ['sessions', 'conversions']);
  // GA4 restituisce le date come stringa "YYYYMMDD": le riformattiamo in ISO.
  return rows.map((r) => ({
    ...r,
    date: `${r.date.slice(0, 4)}-${r.date.slice(4, 6)}-${r.date.slice(6, 8)}`,
  }));
}

export default async function handler(req, res) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Non autenticato.' });
    return;
  }

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
    else if (report === 'facebook') data = await runFacebook(client, propertyId, dateRange);
    else if (report === 'facebook_daily') data = await runFacebookDaily(client, propertyId, dateRange);
    else data = await runPages(client, propertyId, dateRange);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.status(200).json({ report, dateRange, data });
  } catch (err) {
    console.error('[api/ga4] Errore GA4 Data API:', err);
    res.status(502).json({ error: 'Errore nel recupero dei dati da Google Analytics. Verifica property ID e permessi del service account.' });
  }
};
