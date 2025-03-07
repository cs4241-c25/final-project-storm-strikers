import { ObjectId } from "mongodb";
import { z } from "zod";
import { zfd } from "zod-form-data";

const mapLocation = z.strictObject({
  latitude: zfd.numeric(),
  longitude: zfd.numeric(),
  closestStreetAddress: zfd.text(),
});

export type DbAmbulatorySite = Omit<z.infer<typeof AmbulatorySite>, "id">;
export const AmbulatorySite = z.strictObject({
  id: zfd.text(),
  name: zfd.text(),
  parkingPrice: zfd.numeric(z.number().step(0.01).min(0)),
  parkingLocation: mapLocation,
  dropOffLocation: mapLocation,
  lobbyLocation: mapLocation,
});

export type DbService = Omit<z.infer<typeof Service>, "id" | "building"> & {
  building: ObjectId | null;
};
export const Service = z.strictObject({
  id: zfd.text(),
  name: zfd.text(),
  specialties: zfd.repeatable(z.array(zfd.text()).min(1)),
  floor: zfd.repeatable(z.array(zfd.text()).min(1)).optional(),
  suite: zfd.repeatable(z.array(zfd.text()).min(1)).optional(),
  phone: zfd.text(z.string()),
  hours: zfd.text(z.string()),
  building: AmbulatorySite.optional(),
});
