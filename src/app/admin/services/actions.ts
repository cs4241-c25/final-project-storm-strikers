"use server";

import { ServiceCacheKey } from "@/caches";
import { services } from "@/db";
import actionClient from "@/lib/safe-action";
import { Service } from "@/types";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";

export const createServiceAction = actionClient
  .schema(
    zfd.formData(
      Service.omit({ id: true }).merge(
        z.strictObject({ building: zfd.text(z.string().optional()) }),
      ),
    ),
  )
  .action(async ({ parsedInput }) => {
    await services.insertOne({
      ...parsedInput,
      building: parsedInput.building
        ? ObjectId.createFromHexString(parsedInput.building)
        : null,
    });

    revalidateTag(ServiceCacheKey);
  });

export const updateServiceAction = actionClient
  .schema(
    zfd.formData(
      Service.merge(
        z.strictObject({
          building: zfd.text(z.string().optional()),
        }),
      ),
    ),
  )
  .action(async ({ parsedInput }) => {
    const newService = await services.findOneAndUpdate(
      {
        _id: ObjectId.createFromHexString(parsedInput.id),
      },
      [
        {
          $set: {
            ...parsedInput,
            id: undefined,
            building: parsedInput.building
              ? ObjectId.createFromHexString(parsedInput.building)
              : null,
          },
        },
      ],
    );

    if (newService === null) {
      throw Error(`Could not find a service with ID: ${parsedInput.id}`);
    }

    revalidateTag(ServiceCacheKey);
  });

export const deleteServiceAction = actionClient
  .schema(zfd.formData(Service.partial().required({ id: true })))
  .action(async ({ parsedInput }) => {
    const newService = await services.findOneAndDelete({
      _id: ObjectId.createFromHexString(parsedInput.id),
    });

    // Check to make sure we got something back
    if (newService === null) {
      throw Error(`Could not find a service with ID: ${parsedInput.id}`);
    }

    revalidateTag(ServiceCacheKey);
  });
