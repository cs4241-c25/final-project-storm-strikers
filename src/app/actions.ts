"use server";

import { getOverlayCached } from "@/caches";
import actionClient from "@/lib/safe-action";
import { z } from "zod";

export const getOverlayAction = actionClient
  .schema(z.strictObject({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    return getOverlayCached(id);
  });
