import { z } from "zod";
import { zfd } from "zod-form-data";

export const AmbulatorySite = z.strictObject({
  id: zfd.text(),
  name: zfd.text(),
  streetAddress: zfd.text(),
  parkingPrice: zfd.numeric(z.number().step(0.01).min(0)),
});
