"use client";

import { AmbulatorySite } from "@/types";
import {
  APIProvider,
  Map as GMap,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import {
  ButtonHTMLAttributes,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function NavigationMap({
  site,
  userLocation,
}: {
  site: z.infer<typeof AmbulatorySite>;
  userLocation: { latitude: number; longitude: number } | null;
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const maps = useMapsLibrary("core");
  const [zoom, setZoom] = useState(map?.getZoom() || 15); // Default to 15 if undefined
  const directionsService = useMemo(
    () => (routesLibrary ? new routesLibrary.DirectionsService() : null),
    [routesLibrary],
  );
  const directionsRenderer = useMemo(
    () =>
      routesLibrary
        ? new routesLibrary.DirectionsRenderer({
            map,
            suppressMarkers: true,
          })
        : null,
    [map, routesLibrary],
  );

  const source = useMemo(
    () =>
      userLocation
        ? {
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          }
        : null,
    [userLocation],
  );

  useEffect(() => {
    if (!routesLibrary || !map || !source) {
      return;
    }

    const request: google.maps.DirectionsRequest = {
      origin: source,
      destination: {
        lat: site.lobbyLocation.latitude,
        lng: site.lobbyLocation.longitude,
      },
      travelMode: routesLibrary.TravelMode.WALKING,
    };

    const zoomListener = map.addListener("zoom_changed", () => {
      const newZoom = map.getZoom() ?? 15; // Default to 15 if undefined
      console.log("Current Zoom Level:", newZoom); // Log zoom level
      setZoom(newZoom);
    });

    directionsService?.route(request, (result, directionStatus) => {
      if (directionStatus === google.maps.DirectionsStatus.OK) {
        directionsRenderer?.setDirections(result);
      } else {
        console.error("Error fetching directions: " + directionStatus);
      }
    });
    return () => google.maps.event.removeListener(zoomListener);
  }, [
    directionsService,
    directionsRenderer,
    routesLibrary,
    source,
    site.lobbyLocation.latitude,
    site.lobbyLocation.longitude,
    map,
  ]);

  // Dynamically adjust size based on zoom level
  const iconSize = useMemo(() => {
    if (!maps) return undefined;

    const baseSize = 7; // Base size at zoom level 15
    const scaleFactor = Math.pow(2, zoom - 15); // Exponential scaling
    return new maps.Size(baseSize * scaleFactor, baseSize * scaleFactor);
  }, [maps, zoom]);

  return (
    <GMap
      defaultCenter={{
        lat: site.lobbyLocation.latitude,
        lng: site.lobbyLocation.longitude,
      }}
      defaultZoom={15}
      className="h-96"
      disableDefaultUI
      styles={[
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ]}
    >
      <Marker
        position={{
          lng: site.parkingLocation.longitude,
          lat: site.parkingLocation.latitude,
        }}
        title="Parking"
        label="P"
      />
      <Marker
        position={{
          lat: site.lobbyLocation.latitude,
          lng: site.lobbyLocation.longitude,
        }}
        title="Lobby"
        label="L"
        icon={
          maps
            ? {
                url:
                  site.lobbyLocation.closestStreetAddress ===
                  "404 Hanover St, Boston, MA 02113, USA"
                    ? "/BWH-F1R.png"
                    : site.lobbyLocation.closestStreetAddress ===
                        "53-59 N Margin St, Boston, MA 02113, USA"
                      ? "/BWH-Faulkner-F1.png"
                      : site.lobbyLocation.closestStreetAddress ===
                          "106-110 Salem St, Boston, MA 02113, USA"
                        ? "/BWH-Francis-F1.png"
                        : "/default-hospital.png", // Fallback image
                scaledSize: iconSize,
              }
            : undefined
        }
      />
      <Marker
        position={{
          lat: site.dropOffLocation.latitude,
          lng: site.dropOffLocation.longitude,
        }}
        title="Drop-Off"
        label="D"
      />
    </GMap>
  );
}

export default function MapDialog({
  trigger,
  site,
  userLocation,
}: {
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  site: z.infer<typeof AmbulatorySite>;
  userLocation: { latitude: number; longitude: number } | null;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lobby Directions</DialogTitle>
          <DialogDescription>
            Directions from your current location to the lobby. Please be aware
            of your surroundings.
          </DialogDescription>
        </DialogHeader>
        <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY ?? ""}>
          <NavigationMap site={site} userLocation={userLocation} />
        </APIProvider>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
