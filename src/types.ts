import { z } from "zod";
import { zfd } from "zod-form-data";

const mapLocation = z.strictObject({
  latitude: zfd.numeric(),
  longitude: zfd.numeric(),
  closestStreetAddress: zfd.text(),
});

export const AmbulatorySite = z.strictObject({
  id: zfd.text(),
  name: zfd.text(),
  parkingPrice: zfd.numeric(z.number().step(0.01).min(0)),
  parkingLocation: mapLocation,
  dropOffLocation: mapLocation,
  lobbyLocation: mapLocation,
});
