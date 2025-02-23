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
import Link from "next/link";
import { useState } from "react";

export default function ServiceList({
  initialServices,
}: {
  initialServices: Service[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  // Extract unique building names
  const buildingNames = Array.from(
    new Set(initialServices.map((service) => service.building)),
  );

  // Helper function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const filteredServices = initialServices.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.specialities.some((spec) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesBuilding =
      selectedBuilding === "all" ||
      service.building.toLowerCase() === selectedBuilding.toLowerCase();

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
            <SelectValue placeholder="Filter by building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            {buildingNames.map((building, index) => (
              <SelectItem key={index} value={building}>
                {capitalizeFirstLetter(building)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <CardFooter>
              <Button asChild>
                <Link href={`/services`}>Directions</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
