import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI ?? "").db(
  "StormStrikersApp",
);

export const services = client.collection("services");

// // Add a test service
// services.insertOne({
//   name: "Test Service",
//   specialities: ["Testing"],
//   floor: ["1"],
//   suite: ["1"],
//   phone: "555-555-5555",
//   hours: "9-5",
//   building: "Test Building",
// });

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
