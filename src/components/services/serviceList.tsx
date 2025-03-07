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
import type { Service } from "@/types";
import { useState } from "react";
import type { z } from "zod";
import ParkingNavigation from "./parkingNavigation";

export default function ServiceList({
  initialServices,
}: {
  initialServices: z.infer<typeof Service>[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  // Helper function to open Google Maps with directions to a destination
  const openGoogleMaps = (mapLocation: {
    latitude: number;
    longitude: number;
  }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mapLocation.latitude},${mapLocation.longitude}`;
    window.open(url, "_blank");
  };

  // Helper function to open Google Maps with directions from a start to a destination
  const openGoogleMapsLobby = (
    startLocation: { latitude: number; longitude: number },
    destinationLocation: { latitude: number; longitude: number },
  ) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${startLocation.latitude},${startLocation.longitude}&destination=${destinationLocation.latitude},${destinationLocation.longitude}`;
    window.open(url, "_blank");
  };

  const filteredServices = initialServices
    .filter(
      (service) =>
        (service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.specialties.some((spec) =>
            spec.toLowerCase().includes(searchQuery.toLowerCase()),
          )) &&
        service.building &&
        (selectedBuilding === "all" ||
          service.building.name === selectedBuilding),
    )
    .sort((a, b) => {
      if (!a.building || !b.building) return 0;
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
        <ParkingNavigation />
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
            <CardFooter className="flex justify-between">
              <Button
                onClick={() => {
                  if (service.building) {
                    openGoogleMaps({
                      latitude: service.building.parkingLocation.latitude,
                      longitude: service.building.parkingLocation.longitude,
                    });
                  }
                }}
              >
                Find Parking
              </Button>

              <Button
                onClick={() => {
                  if (service.building) {
                    openGoogleMapsLobby(
                      {
                        latitude: service.building.parkingLocation.latitude,
                        longitude: service.building.parkingLocation.longitude,
                      },
                      {
                        latitude: service.building.lobbyLocation.latitude,
                        longitude: service.building.lobbyLocation.longitude,
                      },
                    );
                  }
                }}
              >
                Where Is The Lobby?
              </Button>

              <Button
                onClick={() => {
                  if (service.building) {
                    openGoogleMaps({
                      latitude: service.building.dropOffLocation.latitude,
                      longitude: service.building.dropOffLocation.longitude,
                    });
                  }
                }}
                variant="secondary"
              >
                Find Drop-Off
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
