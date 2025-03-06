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
import { Service } from "@/db";
import { AmbulatorySite } from "@/types";
import { useState } from "react";
import type { z } from "zod";

export default function ServiceList({
  initialServices,
  sites,
}: {
  initialServices: Service[];
  sites: z.infer<typeof AmbulatorySite>[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  // Helper function to open Google Maps with directions to a destination
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const openGoogleMaps = (location: {
    latitude: number;
    longitude: number;
  }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    console.log("Opening Google Maps with URL:", url);
    window.open(url, "_blank");
  };

  // Extract unique site names instead of building names
  const siteNames = Array.from(new Set(sites.map((site) => site.name)));

  const filteredServices = initialServices.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.specialities.some((spec) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesBuilding =
      selectedBuilding === "all" ||
      sites.some(
        (site) =>
          site.name.toLowerCase() === selectedBuilding.toLowerCase() &&
          site.name.toLowerCase() === service.building.toLowerCase(),
      );

    return matchesSearch && matchesBuilding;
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
            {siteNames.map((siteName, index) => (
              <SelectItem
                key={index}
                value={siteName.toLowerCase()}
                className="capitalize"
              >
                {siteName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 capitalize">
        {filteredServices.map((service) => (
          <Card key={service._id.toString()}>
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>
                {service.specialities.join(", ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Location:</strong> Floor {service.floor.join(", ")},
                Suite {service.suite.join(", ")}
              </p>
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
                  const siteObj = sites.find(
                    (s) =>
                      s.name.toLowerCase() === service.building.toLowerCase(),
                  );
                  console.log("Selected Site for Parking:", siteObj);

                  if (siteObj) {
                    openGoogleMaps({
                      latitude: siteObj.parkingLocation.latitude,
                      longitude: siteObj.parkingLocation.longitude,
                    });
                  } else {
                    alert("Parking location not found for this site.");
                  }
                }}
              >
                Find Parking
              </Button>

              <Button
                onClick={() => {
                  const siteObj = sites.find(
                    (s) =>
                      s.name.toLowerCase() === service.building.toLowerCase(),
                  );
                  console.log("Selected Site for Drop-Off:", siteObj);

                  if (siteObj) {
                    openGoogleMaps({
                      latitude: siteObj.dropOffLocation.latitude,
                      longitude: siteObj.dropOffLocation.longitude,
                    });
                  } else {
                    alert("Drop-off location not found for this site.");
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
