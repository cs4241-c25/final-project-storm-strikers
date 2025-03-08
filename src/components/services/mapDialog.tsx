"use client";

import { getOverlayAction } from "@/app/actions";
import { AmbulatorySite } from "@/types";
import {
  APIProvider,
  Map as GMap,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useAction } from "next-safe-action/hooks";
import { ButtonHTMLAttributes, ReactElement, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { RotatableOverlay } from "../rotatableOverlay";
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
  const {
    execute: loadOverlay,
    result: { data: overlay },
  } = useAction(getOverlayAction);
  // Load the overlay on component mount
  useEffect(() => {
    if (!site?.id) {
      return;
    }
    loadOverlay({ id: site?.id });
  }, [loadOverlay, site?.id]);

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

    directionsService?.route(request, (result, directionStatus) => {
      if (directionStatus === google.maps.DirectionsStatus.OK) {
        directionsRenderer?.setDirections(result);
      } else {
        toast.error("Encountered an error navigating: " + directionStatus);
      }
    });
  }, [
    directionsService,
    directionsRenderer,
    routesLibrary,
    source,
    site.lobbyLocation.latitude,
    site.lobbyLocation.longitude,
    map,
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
      {overlay && (
        <RotatableOverlay
          {...overlay}
          bounds={{
            north: overlay.topLeft.latitude,
            east: overlay.topLeft.longitude,
            south: overlay.bottomRight.latitude,
            west: overlay.bottomRight.longitude,
          }}
        />
      )}
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
