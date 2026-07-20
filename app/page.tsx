import { Dashboard } from "../src/components/Dashboard";
import { getMorningMarketSnapshot } from "../src/lib/snapshot/get-snapshot";

export const dynamic = "force-dynamic";
export const runtime = "edge";
export const preferredRegion = "icn1";

export default async function Home() {
  const snapshot = await getMorningMarketSnapshot();
  return <Dashboard snapshot={snapshot} />;
}
