import { Dashboard } from "../src/components/Dashboard";
import { getMorningMarketSnapshot } from "../src/lib/snapshot/get-snapshot";

export const revalidate = 3600;

export default async function Home() {
  const snapshot = await getMorningMarketSnapshot();
  return <Dashboard snapshot={snapshot} />;
}
