import { getAllSitesCached } from "@/caches";
import ClientStateManager from "./clientStateManager";

export default async function Page() {
  const sites = await getAllSitesCached();

  return <ClientStateManager serverState={sites} />;
}
