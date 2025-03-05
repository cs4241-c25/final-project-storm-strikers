"use client";

import { DirectionsRenderer } from "@react-google-maps/api";
import { useEffect, useState } from "react";

export default function Directions({
  originLocation,
  destination,
}: {
  originLocation: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}) {
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (!originLocation || !destination) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: originLocation,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, requestStatus) => {
        if (requestStatus === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        }
      },
    );
  }, [originLocation, destination]);

  return directions ? <DirectionsRenderer directions={directions} /> : null;
}
