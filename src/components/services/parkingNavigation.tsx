"use client";

import { useEffect, useState } from "react";

export default function ParkingNavigation() {
  // State for storing the marked car location
  const [carLocation, setCarLocation] = useState<{ lat: number; lng: number } | null>(null);

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
      alert("Geolocation is not supported by this browser.");
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
        alert("Car location marked!");
      },
      (error) => {
        alert("Error getting your location. Please try again.");
      }
    );
  };

  // 2) "Guide to parking lot" - Opens Google Maps for directions to the marked location
  const handleGuideToParkingLot = () => {
    if (!carLocation) {
      alert("No car location is marked yet!");
      return;
    }
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
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
      (error) => {
        alert("Error getting your current location. Please try again.");
      }
    );
  };

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {/* Mark Car Button */}
      <button
        onClick={handleMarkCar}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Mark your car
      </button>

      {/* Guide to Parking Lot Button */}
      <button
        onClick={handleGuideToParkingLot}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Guide to parking lot
      </button>
    </div>
  );
}
