import { getAllServicesCached } from "@/caches";
import ClientStateManager from "./clientStateManager";

export default async function Services() {
  const services = await getAllServicesCached();

  return <ClientStateManager serverState={services} />;
}
