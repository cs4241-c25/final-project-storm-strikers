import { ObjectId } from "mongodb";

export interface Building {
  _id: ObjectId | string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  parking: { lat: number; lng: number; rates: string };
  dropOff: { lat: number; lng: number };
}

export type BuildingType = "patriot" | "chestnut" | "faulkner";

export const buildings: Record<BuildingType, Building> = {
  patriot: {
    _id: "1",
    name: "patriot",
    address: "45 Francis St, Boston, MA 02115",
    coordinates: { lat: 42.33624, lng: -71.10658 },
    parking: {
      lat: 42.33538,
      lng: -71.10621,
      rates: "$5 per hour, max $20 per day",
    },
    dropOff: { lat: 42.3359, lng: -71.10717 },
  },
  chestnut: {
    _id: "2",
    name: "chestnut",
    address: "850 Boylston St, Chestnut Hill, MA 02467",
    coordinates: { lat: 42.3241, lng: -71.1676 },
    parking: {
      lat: 42.3263,
      lng: -71.14965,
      rates: "$5 per hour, max $20 per day",
    },
    dropOff: { lat: 42.32626, lng: -71.14952 },
  },
  faulkner: {
    _id: "3",
    name: "faulkner",
    address: "1153 Centre St, Boston, MA 02130",
    coordinates: { lat: 42.3002, lng: -71.127 },
    parking: {
      lat: 42.30187,
      lng: -71.12953,
      rates: "$7 for the first hour, $3 per additional hour",
    },
    dropOff: { lat: 42.30178, lng: -71.12878 },
  },
};
