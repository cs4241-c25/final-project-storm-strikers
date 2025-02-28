import { unstable_cache } from "next/cache";
import type { z } from "zod";
import { ambulatorySites, services } from "./db";
import { buildings } from "./lib/models/building";
import type { AmbulatorySite } from "./types";

export const SiteCacheKey = "ambulatorySites";
export const getAllSitesCached = unstable_cache(
  async () =>
    (await ambulatorySites.find().toArray()).map(
      (site) =>
        ({
          ...site,
          _id: undefined, // We cannot serialize this, so we have to ignore it
          id: site._id.toString(),
        }) as z.infer<typeof AmbulatorySite>,
    ),
  [],
  {
    tags: [SiteCacheKey],
  },
);

export const ServiceCacheKey = "services";
export const getAllServicesCached = unstable_cache(
  async () => await services.find({}).toArray(),
  [],
  {
    tags: [ServiceCacheKey],
  },
);

export const BuildingCacheKey = "buildings";
export const getAllBuildingsCached = unstable_cache(
  async () => Object.values(buildings),
  [], 
  {
    tags: [BuildingCacheKey],
  },
); 
