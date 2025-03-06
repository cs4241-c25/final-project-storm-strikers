import { WithId } from "mongodb";
import { unstable_cache } from "next/cache";
import type { z } from "zod";
import { ambulatorySites, services } from "./db";
import type {
  AmbulatorySite,
  DbAmbulatorySite,
  DbService,
  Service,
} from "./types";

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
  async () => {
    return (
      await services
        .aggregate<
          WithId<DbService> & { buildings: WithId<DbAmbulatorySite>[] }
        >([
          {
            $lookup: {
              from: ambulatorySites.collectionName,
              localField: "building",
              foreignField: "_id",
              as: "buildings",
            },
          },
        ])
        .toArray()
    ).map(
      (service) =>
        // Structured clone prevents weird serialization errors
        structuredClone({
          ...service,
          _id: undefined, // This cannot be serialized, so ignore
          id: service._id.toString(),
          building: service.buildings[0]
            ? {
                ...service.buildings[0],
                _id: undefined, // This cannot be serialized, so ignore
                id: service.buildings[0]._id.toString(),
              }
            : undefined,
        }) as z.infer<typeof Service>,
    );
  },
  [],
  {
    tags: [ServiceCacheKey, SiteCacheKey], // Update site on service change
  },
);
