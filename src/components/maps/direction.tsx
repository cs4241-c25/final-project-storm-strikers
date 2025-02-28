"use client";

import { useEffect, useState } from "react";
import { DirectionsRenderer } from "@react-google-maps/api";

export default function Directions({ origin, destination }: { origin: { lat: number; lng: number }, destination: { lat: number; lng: number } }) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (!origin || !destination) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        }
      }
    );
  }, [origin, destination]);

  return directions ? <DirectionsRenderer directions={directions} /> : null;
}
