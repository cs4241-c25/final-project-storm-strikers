import { ObjectId } from "mongodb";

export interface Building {
  _id: ObjectId | string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  parking: { lat: number; lng: number; rates: string };
  dropOff: { lat: number; lng: number };
}

export const buildingsData: Building[] = [
  {
    _id: "1",
    name: "Faulkner Hospital",
    address: "1153 Centre St, Boston, MA 02130",
    coordinates: { lat: 42.3002, lng: -71.127 },
    parking: {
      lat: 42.3005,
      lng: -71.1265,
      rates: "$7 for the first hour, $3 per additional hour",
    },
    dropOff: { lat: 42.3003, lng: -71.1272 },
  },
  {
    _id: "2",
    name: "Chestnut Hill",
    address: "850 Boylston St, Chestnut Hill, MA 02467",
    coordinates: { lat: 42.3241, lng: -71.1676 },
    parking: {
      lat: 42.3244,
      lng: -71.1672,
      rates: "$5 per hour, max $20 per day",
    },
    dropOff: { lat: 42.3242, lng: -71.1678 },
  },
  {
    _id: "3",
    name: "Patriot",
    address: "45 Francis St, Boston, MA 02115",
    coordinates: { lat: 42.3364, lng: -71.1065 },
    parking: {
      lat: 42.3363,
      lng: -71.1057,
      rates: "$5 per hour, max $20 per day",
    },
    dropOff: { lat: 42.3361, lng: -71.1063 },
  },
];
