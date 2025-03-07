"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AmbulatorySite, Service } from "@/types";
import { useEffect, useState } from "react";
import type { z } from "zod";
import MapDialog from "./mapDialog";
import LobbyNavigation from "./parkingNavigation";

// Calculate the distance between two geographic coordinates using the Haversine formula
const calculateDistance = (
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number => {
  const earthRadiusMeters = 6371e3; // Earth's radius in meters

  // Convert latitude and longitude from degrees to radians
  const lat1Radians = (latitude1 * Math.PI) / 180;
  const lat2Radians = (latitude2 * Math.PI) / 180;
  const latDifferenceRadians = ((latitude2 - latitude1) * Math.PI) / 180;
  const lonDifferenceRadians = ((longitude2 - longitude1) * Math.PI) / 180;

  // Apply the Haversine formula
  const haversineA =
    Math.sin(latDifferenceRadians / 2) * Math.sin(latDifferenceRadians / 2) +
    Math.cos(lat1Radians) *
      Math.cos(lat2Radians) *
      Math.sin(lonDifferenceRadians / 2) *
      Math.sin(lonDifferenceRadians / 2);

  const haversineC =
    2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));

  // Calculate the final distance in meters
  return earthRadiusMeters * haversineC;
};

// Helper function to open Google Maps with directions to a destination
// eslint-disable-next-line @typescript-eslint/no-shadow
const openGoogleMaps = (location: { latitude: number; longitude: number }) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
  window.open(url, "_blank");
};

export default function ServiceList({
  initialServices,
}: {
  initialServices: z.infer<typeof Service>[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      // Watch position instead of getting it once
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
      );

      // Cleanup
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const checkProximity = (location: {
    latitude: number;
    longitude: number;
  }) => {
    if (!userLocation) return "far";
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      location.latitude,
      location.longitude,
    );
    if (distance < 100) return "near"; // Within 100m
    if (distance < 2000) return "medium"; // Within 2km
    return "far";
  };

  const filteredServices = initialServices
    .filter(
      (
        service,
      ): service is z.infer<typeof Service> & {
        building: z.infer<typeof AmbulatorySite>;
      } =>
        !!service.building &&
        (service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.specialties.some((spec) =>
            spec.toLowerCase().includes(searchQuery.toLowerCase()),
          )) &&
        (selectedBuilding === "all" ||
          service.building.name === selectedBuilding),
    )
    .sort((a, b) => {
      return a.building.name.localeCompare(b.building.name);
    });

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Hospital Services Directory</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-grow">
          <Input
            type="search"
            placeholder="Search for a service or specialty"
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {[
              ...new Set(
                initialServices
                  .map((service) => service.building?.name)
                  .filter((maybeName) => maybeName !== undefined),
              ).values(),
            ].map((siteName, index) => (
              <SelectItem key={index} value={siteName} className="capitalize">
                {siteName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <LobbyNavigation />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 capitalize overflow-auto text-ellipsis">
        {filteredServices.map((service) => (
          <Card key={service.id.toString()}>
            <CardHeader>
              <CardTitle className="overflow-auto text-ellipsis">
                {service.name}
              </CardTitle>
              <CardDescription className="overflow-auto text-ellipsis">
                {service.specialties.join(", ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto text-ellipsis">
              {(service.suite || service.floor) && (
                <p>
                  <strong>Location:</strong>{" "}
                  {service.floor ? `Floor ${service.floor.join(", ")}` : ""}
                  {service.floor && service.suite ? ", " : ""}
                  {service.suite ? `Suite ${service.suite.join(", ")}` : ""}
                </p>
              )}
              <p>
                <strong>Hours:</strong> {service.hours}
              </p>
              <p>
                <strong>Phone:</strong> {service.phone}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col lg:flex-row gap-2 justify-between">
              {checkProximity(service.building.lobbyLocation) === "near" ? (
                <MapDialog
                  site={service.building}
                  trigger={
                    <Button className="w-full">Find Your Way Inside</Button>
                  }
                />
              ) : (
                <>
                  <Button
                    className="w-full"
                    onClick={() => {
                      openGoogleMaps({
                        latitude: service.building.parkingLocation.latitude,
                        longitude: service.building.parkingLocation.longitude,
                      });
                    }}
                  >
                    Find Parking
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      openGoogleMaps({
                        latitude: service.building.dropOffLocation.latitude,
                        longitude: service.building.dropOffLocation.longitude,
                      });
                    }}
                    variant="secondary"
                  >
                    Find Drop-Off
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
