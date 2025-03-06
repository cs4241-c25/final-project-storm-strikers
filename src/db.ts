import { MongoClient } from "mongodb";
import { DbAmbulatorySite, DbService } from "./types";

const client = new MongoClient(process.env.MONGODB_URI ?? "").db(
  "StormStrikersApp",
);

export const ambulatorySites =
  client.collection<DbAmbulatorySite>("ambulatorySites");
export const services = client.collection<DbService>("services");

export default client;
