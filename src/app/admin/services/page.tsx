import { getAllServicesCached, getAllSitesCached } from "@/caches";
import ClientStateManager from "./clientStateManager";

export default async function Services() {
  const services = await getAllServicesCached();
  const ambulatorySites = await getAllSitesCached();

  return (
    <ClientStateManager
      serverState={services}
      ambulatorySites={ambulatorySites}
    />
  );
}
