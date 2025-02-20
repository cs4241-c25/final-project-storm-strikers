import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI ?? "").db(
  "StormStrikersApp",
);

export interface AmbulatorySite {
  _id: ObjectId;
  name: string;
  streetAddress: string;
}

export const ambulatorySites =
  client.collection<AmbulatorySite>("ambulatorySites");

export const services = client.collection("services");
export default client;

export type BuildingType = "patriot" | "chestnut" | "faulkner";

export interface Service {
  _id: ObjectId | string;
  name: string;
  specialities: string[];
  floor: string[];
  suite: string[];
  phone: string;
  hours: string;
  building: BuildingType;
}
