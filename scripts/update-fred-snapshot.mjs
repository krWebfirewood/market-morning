import { readFile, writeFile } from "node:fs/promises";

const outputUrl = new URL("../src/data/fred-snapshot.json", import.meta.url);
const seriesIds = [
  "SP500", "NASDAQCOM", "DJIA", "NASDAQSOX", "VIXCLS", "DGS2",
  "DGS10", "DEXKOUS", "DTWEXBGS", "DEXJPUS", "DEXCHUS", "DCOILWTICO",
];

function parseCsv(csv) {
  const [, ...rows] = csv.trim().split(/\r?\n/);
  return rows.flatMap((line) => {
    const [date, rawValue] = line.split(",");
    const value = Number(rawValue);
    return date && rawValue?.trim() && Number.isFinite(value) ? [{ date, value }] : [];
  }).slice(-20);
}

async function fetchSeries(seriesId) {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 75);
  const params = new URLSearchParams({
    id: seriesId,
    cosd: start.toISOString().slice(0, 10),
    coed: end.toISOString().slice(0, 10),
  });
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?${params}`, {
        headers: { Accept: "text/csv", "User-Agent": "MarketMorningSnapshot/1.0" },
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error(`${seriesId}: HTTP ${response.status}`);
      const points = parseCsv(await response.text());
      if (points.length < 2) throw new Error(`${seriesId}: valid observations missing`);
      return points;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

const previous = JSON.parse(await readFile(outputUrl, "utf8"));
const results = await Promise.allSettled(seriesIds.map(fetchSeries));
const series = { ...previous.series };
const failures = [];
results.forEach((result, index) => {
  const seriesId = seriesIds[index];
  if (result.status === "fulfilled") series[seriesId] = result.value;
  else failures.push(`${seriesId}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`);
});
if (failures.length === seriesIds.length) throw new Error(`All FRED requests failed\n${failures.join("\n")}`);
await writeFile(outputUrl, `${JSON.stringify({ generatedAt: new Date().toISOString(), series }, null, 2)}\n`, "utf8");
if (failures.length) console.warn(failures.join("\n"));
console.log(`Updated ${seriesIds.length - failures.length}/${seriesIds.length} FRED series`);
