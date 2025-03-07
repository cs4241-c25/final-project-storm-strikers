"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ParkingNavigation() {
  // State for storing the marked car location
  const [carLocation, setCarLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Load saved location from localStorage when the component mounts
  useEffect(() => {
    const savedLocation = localStorage.getItem("carLocation");
    if (savedLocation && savedLocation !== "null") {
      setCarLocation(JSON.parse(savedLocation));
    }
  }, []);

  // Retrieves user's current location (Promise-based)
  const getCurrentLocation = (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject),
    );

  // Marks the current location as the car location
  const handleMarkCar = async () => {
    try {
      const position = await getCurrentLocation();
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCarLocation(newLocation);
      localStorage.setItem("carLocation", JSON.stringify(newLocation));
      toast.success("Car location marked!");
    } catch (_) {
      toast.error("Unable to retrieve your location.");
    }
  };

  // Opens Google Maps for directions to the marked location
  const handleGuideToParkingLot = async () => {
    if (!carLocation) {
      toast.error("No car location is marked yet!");
      return;
    }

    try {
      const position = await getCurrentLocation();
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Prevent opening Google Maps if user is at the same location
      const isSameLocation =
        Math.abs(userLat - carLocation.lat) < 0.0001 &&
        Math.abs(userLng - carLocation.lng) < 0.0001;

      if (isSameLocation) {
        toast.error("You are already at your marked car location.");
        return;
      }

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${carLocation.lat},${carLocation.lng}`;
      window.open(directionsUrl, "_blank");
    } catch (_) {
      toast.error("Error getting your current location. Please try again.");
    }
  };

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {!carLocation ? (
        <Button onClick={handleMarkCar}>Mark Your Car</Button>
      ) : (
        <Button onClick={handleGuideToParkingLot}>Guide to Parking Lot</Button>
      )}
    </div>
  );
}
