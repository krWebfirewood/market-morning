import { Dashboard } from "../src/components/Dashboard";
import { getMorningMarketSnapshot } from "../src/lib/snapshot/get-snapshot";

export const dynamic = "force-dynamic";

export default async function Home() {
  const snapshot = await getMorningMarketSnapshot();
  return <Dashboard snapshot={snapshot} />;
}
