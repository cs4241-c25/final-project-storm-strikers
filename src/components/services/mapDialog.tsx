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

type NavigationSource = "dropOff" | "parking";

function NavigationMap({
  site,
  navigationSource: selectedSource,
}: {
  site: z.infer<typeof AmbulatorySite>;
  navigationSource: NavigationSource;
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
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
    () => ({
      lat:
        selectedSource === "dropOff"
          ? site.dropOffLocation.latitude
          : site.parkingLocation.latitude,
      lng:
        selectedSource === "dropOff"
          ? site.dropOffLocation.longitude
          : site.parkingLocation.longitude,
    }),
    [
      selectedSource,
      site.dropOffLocation.latitude,
      site.dropOffLocation.longitude,
      site.parkingLocation.latitude,
      site.parkingLocation.longitude,
    ],
  );

  useEffect(() => {
    if (!routesLibrary) {
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

    directionsService?.route(request, (result, directionStatus) => {
      if (directionStatus === google.maps.DirectionsStatus.OK) {
        directionsRenderer?.setDirections(result);
      } else {
        console.error("Error fetching directions: " + directionStatus);
      }
    });
  }, [
    directionsService,
    directionsRenderer,
    routesLibrary,
    source,
    site.lobbyLocation.latitude,
    site.lobbyLocation.longitude,
  ]);

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
}: {
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  site: z.infer<typeof AmbulatorySite>;
}) {
  const [navigationSource, setNavigationSource] =
    useState<NavigationSource>("parking");

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lobby Directions</DialogTitle>
          <DialogDescription>
            Directions are shown for walking only. Please be aware of your
            surroundings and call 911 for emergencies.
          </DialogDescription>
        </DialogHeader>
        <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY ?? ""}>
          <NavigationMap site={site} navigationSource={navigationSource} />
        </APIProvider>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>

          <Button
            onClick={() => {
              if (navigationSource === "dropOff") {
                setNavigationSource("parking");
              } else {
                setNavigationSource("dropOff");
              }
            }}
          >
            Show {navigationSource === "dropOff" ? "Parking" : "Drop-Off"}{" "}
            Directions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
