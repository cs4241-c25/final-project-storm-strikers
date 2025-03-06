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
    if (savedLocation) {
      setCarLocation(JSON.parse(savedLocation));
    }
  }, []);

  // 1) "Mark your car" - Saves user's current location to state & localStorage
  const handleMarkCar = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCarLocation(newLocation);
        localStorage.setItem("carLocation", JSON.stringify(newLocation));
        toast.success("Car location marked!");
      },
      () => {
        toast.error("Unable to retrieve your location.");
      },
    );
  };

  // 2) "Guide to parking lot" - Opens Google Maps for directions to the marked location
  const handleGuideToParkingLot = () => {
    if (!carLocation) {
      toast.error("No car location is marked yet!");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        // Construct a Google Maps directions URL
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${carLocation.lat},${carLocation.lng}`;
        window.open(directionsUrl, "_blank");
      },
      () => {
        toast.error("Error getting your current location. Please try again.");
      },
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Button onClick={handleMarkCar}>Mark your Car</Button>

      <Button onClick={handleGuideToParkingLot} variant="secondary">
        Guide to Parking Lot
      </Button>
    </div>
  );
}
