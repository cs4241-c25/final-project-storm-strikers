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
import {
  AdvancedMarker,
  APIProvider,
  Map as GMap,
} from "@vis.gl/react-google-maps";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import ParkingNavigation from "./parkingNavigation";

// Extend the window object to include initGoogleMaps
declare global {
  interface Window {
    initGoogleMaps: () => void;
  }
}

export default function ServiceList({
  initialServices,
}: {
  initialServices: z.infer<typeof Service>[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [showMap, setShowMap] = useState(false); // Controls modal visibility
  const [mapLoaded, setMapLoaded] = useState(false);

  // Helper function to open Google Maps with directions to a destination
  const openGoogleMaps = (mapLocation: {
    latitude: number;
    longitude: number;
  }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mapLocation.latitude},${mapLocation.longitude}`;
    window.open(url, "_blank");
  };

  // Function to load Google Maps script only once
  const loadGoogleMapsScript = (callback: () => void) => {
    if (window.google && window.google.maps) {
      callback();
      return;
    }

    if (document.querySelector("script[src*='maps.googleapis.com']")) {
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}&libraries=geometry,places,marker&callback=initGoogleMaps&map_ids=${process.env.NEXT_PUBLIC_MAP_ID}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    (window as any).initGoogleMaps = () => {
      callback();
    };
  };

  // @ts-ignore
  const GoogleMapWithOverlay = ({ origin, destination, imagePath }) => {
    const mapRef = useRef<google.maps.Map | null>(null);
    const directionsService = useRef<google.maps.DirectionsService | null>(
      null,
    );
    const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(
      null,
    );

    useEffect(() => {
      if (!mapLoaded) {
        loadGoogleMapsScript(() => {
          setMapLoaded(true);
        });
      }
    }, [mapLoaded]);

    useEffect(() => {
      if (mapLoaded && mapRef.current && !directionsService.current) {
        directionsService.current = new google.maps.DirectionsService();
        directionsRenderer.current = new google.maps.DirectionsRenderer({
          map: mapRef.current,
          suppressMarkers: true,
        });
      }

      if (
        directionsService.current &&
        directionsRenderer.current &&
        origin &&
        destination
      ) {
        const request: google.maps.DirectionsRequest = {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        };

        directionsService.current.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            // @ts-ignore
            directionsRenderer.current.setDirections(result);
          } else {
            console.error("Error fetching directions: " + status);
          }
        });
      }
    }, [mapLoaded, origin, destination]);

    if (!mapLoaded) return <div>Loading...</div>;

    return (
      <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY!}>
        <GMap
          ref={mapRef}
          mapId={process.env.NEXT_PUBLIC_MAP_ID}
          defaultCenter={origin}
          defaultZoom={15}
          style={{ width: "100%", height: "500px" }}
        >
          <AdvancedMarker position={origin} title="Parking Location" />
          <AdvancedMarker position={destination} title="Lobby Location" />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "100px",
              height: "100px",
            }}
          >
            <Image
              src={imagePath}
              alt="Overlay Image"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </GMap>
      </APIProvider>
    );
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
                    const imagePath = "/path/to/your/local/image.png"; // Adjust as needed
                    setShowMap(true); // Trigger map modal to open
                  }
                }}
              >
                Where Is The Lobby?
              </Button>

              {/* Modal for displaying Google Maps */}
              {showMap && (
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                  onClick={() => setShowMap(false)} // Close modal on background click
                >
                  <div
                    className="relative bg-white p-4 rounded-lg w-[80vw] max-w-3xl"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                  >
                    <Button
                      className="absolute top-2 right-2"
                      onClick={() => setShowMap(false)} // Close button
                    >
                      Close
                    </Button>
                    {service.building ? (
                      <GoogleMapWithOverlay
                        origin={{
                          lat: service.building.parkingLocation.latitude,
                          lng: service.building.parkingLocation.longitude,
                        }}
                        destination={{
                          lat: service.building.lobbyLocation.latitude,
                          lng: service.building.lobbyLocation.longitude,
                        }}
                        imagePath="/path/to/your/local/image.png"
                      />
                    ) : (
                      <p>Building information is missing.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Modal for displaying Google Maps */}
              {showMap && (
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                  onClick={() => setShowMap(false)} // Close modal on background click
                >
                  <div
                    className="relative bg-white p-4 rounded-lg w-[80vw] max-w-3xl"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                  >
                    <Button
                      className="absolute top-2 right-2"
                      onClick={() => setShowMap(false)} // Close button
                    >
                      Close
                    </Button>
                    {service.building ? (
                      <GoogleMapWithOverlay
                        origin={{
                          lat: service.building.parkingLocation.latitude,
                          lng: service.building.parkingLocation.longitude,
                        }}
                        destination={{
                          lat: service.building.lobbyLocation.latitude,
                          lng: service.building.lobbyLocation.longitude,
                        }}
                        imagePath="/BWHLobbyF1.png"
                      />
                    ) : (
                      <p>Building information is missing.</p>
                    )}
                  </div>
                </div>
              )}

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
