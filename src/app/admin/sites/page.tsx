import { ambulatorySites } from "@/db";
import { AmbulatorySite } from "@/types";
import { z } from "zod";
import ClientStateManager from "./clientStateManager";

export default async function Page() {
  const sites: z.infer<typeof AmbulatorySite>[] = (
    await ambulatorySites.find().toArray()
  ).map((site) => ({
    ...site,
    _id: undefined, // We cannot serialize this, so we have to ignore it
    id: site._id.toString(),
  }));

  return <ClientStateManager serverState={sites} />;
}
