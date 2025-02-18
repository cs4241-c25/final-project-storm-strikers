import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI ?? "").db(
  "StormStrikersApp",
);

export const services = client.collection("services");

export default client;

export interface Service {
  _id: ObjectId;
  name: string;
  specialities: string[];
  floor: string[];
  suite: string[];
  phone: string;
  hours: string;
  building: string;
}
