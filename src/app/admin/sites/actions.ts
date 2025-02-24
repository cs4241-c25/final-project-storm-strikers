"use server";

import { SiteCacheKey } from "@/caches";
import { ambulatorySites } from "@/db";
import actionClient from "@/lib/safe-action";
import { AmbulatorySite } from "@/types";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";

export const addSiteAction = actionClient
  .schema(zfd.formData(AmbulatorySite.omit({ id: true })))
  .action(async ({ parsedInput }) => {
    const newSite = await ambulatorySites.insertOne({ ...parsedInput });

    revalidateTag(SiteCacheKey);

    return {
      ...parsedInput,
      id: newSite.insertedId.toString(),
    } satisfies z.infer<typeof AmbulatorySite>;
  });

export const editSiteAction = actionClient
  .schema(zfd.formData(AmbulatorySite))
  .action(async ({ parsedInput }) => {
    const newSite = await ambulatorySites.findOneAndUpdate(
      {
        _id: ObjectId.createFromHexString(parsedInput.id),
      },
      [
        {
          $set: {
            ...parsedInput,
            id: undefined,
          },
        },
      ],
    );

    // Check to make sure we got something back
    if (newSite === null) {
      throw Error(`Could not find a site with ID: ${parsedInput.id}`);
    }

    revalidateTag(SiteCacheKey); // Revalidate the site table

    const siteOmitId = { ...newSite, _id: undefined };

    return {
      ...siteOmitId,
      id: newSite._id.toString(),
    } satisfies z.infer<typeof AmbulatorySite>;
  });

export const deleteSiteAction = actionClient
  .schema(zfd.formData(AmbulatorySite.partial().required({ id: true })))
  .action(async ({ parsedInput }) => {
    const newSite = await ambulatorySites.findOneAndDelete({
      _id: ObjectId.createFromHexString(parsedInput.id),
    });

    // Check to make sure we got something back
    if (newSite === null) {
      throw Error(`Could not find a site with ID: ${parsedInput.id}`);
    }

    revalidateTag(SiteCacheKey);

    return {};
  });
