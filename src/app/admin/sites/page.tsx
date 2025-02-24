import { getAllSitesCached } from "@/caches";
import { AmbulatorySite } from "@/types";
import { z } from "zod";
import ClientStateManager from "./clientStateManager";

export default async function Page() {
  const sites: z.infer<typeof AmbulatorySite>[] = await getAllSitesCached();

  return <ClientStateManager serverState={sites} />;
}
