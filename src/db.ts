import { MongoClient, ObjectId } from "mongodb";
import { z } from "zod";
import { AmbulatorySite } from "./types";

const client = new MongoClient(process.env.MONGODB_URI ?? "").db(
  "StormStrikersApp",
);

const _ambulatorySiteNoId = AmbulatorySite.omit({ id: true });
export const ambulatorySites =
  client.collection<z.infer<typeof _ambulatorySiteNoId>>("ambulatorySites");

export const services = client.collection<Omit<Service, "_id">>("services");
export default client;

export interface Service {
  _id: ObjectId | string;
  name: string;
  specialities: string[];
  floor: string[];
  suite: string[];
  phone: string;
  hours: string;
  building: string;
}

export interface Building {
  _id: ObjectId | string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  parking: { lat: number; lng: number; rates: string };
  dropOff: { lat: number; lng: number };
}
