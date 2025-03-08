"use client";

import { RotatableOverlay } from "@/components/rotatableOverlay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AmbulatorySite } from "@/types";
import {
  APIProvider,
  Map as GMap,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { CommandLoading } from "cmdk";
import {
  ChevronsUpDown,
  Loader2,
  LocateFixed,
  RotateCcw,
  RotateCw,
  Trash,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import React, {
  ButtonHTMLAttributes,
  Fragment,
  ReactElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { z } from "zod";
import { getOverlayAction } from "./actions";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

type PartialSiteLocation = Partial<
  z.infer<typeof AmbulatorySite>["parkingLocation"]
>;
type PartialOverlay = DeepPartial<
  Exclude<z.infer<typeof AmbulatorySite>["overlay"], undefined>
>;
type PartialOverlayRequiredBase64 = Omit<
  PartialOverlay,
  "image" | "rotation"
> & {
  image: string;
  rotation: number;
};

const DefaultLatitude = 42.36529; // this is boston
const LatitudeLobbySizeOffset = 0.00025;
const DefaultLongitude = -71.0555; // this is boston
const LongitudeLobbySizeOffset = 0.00025;

function DraggableOverlayRectangle({
  overlay,
  setOverlay,
  lobbyLocation,
}: {
  overlay: PartialOverlayRequiredBase64;
  setOverlay: (newOverlay: PartialOverlayRequiredBase64) => void;
  lobbyLocation: PartialSiteLocation;
}) {
  const map = useMap();
  const rectangle = useMemo(
    () =>
      new google.maps.Rectangle({
        map: map,
        draggable: true,
        editable: true,
      }),
    [map],
  );

  useEffect(() => {
    const listener = rectangle.addListener("bounds_changed", () => {
      const rectBounds = rectangle.getBounds(),
        topLeft = rectBounds?.getNorthEast(),
        bottomRight = rectBounds?.getSouthWest();

      // Prevent infinite recursion, if we just updated bounds, don't notify
      if (
        overlay.topLeft?.latitude === topLeft?.lat() &&
        overlay.topLeft?.longitude === topLeft?.lng() &&
        overlay.bottomRight?.longitude === bottomRight?.lng() &&
        overlay.bottomRight?.latitude === bottomRight?.lat()
      ) {
        return;
      }

      // This can occur during render, so we need to make sure we update state not during that time...
      setTimeout(() =>
        setOverlay({
          ...overlay,
          topLeft: { latitude: topLeft?.lat(), longitude: topLeft?.lng() },
          bottomRight: {
            latitude: bottomRight?.lat(),
            longitude: bottomRight?.lng(),
          },
        }),
      );
    });

    return () => google.maps.event.removeListener(listener);
  }, [overlay, rectangle, setOverlay]);

  const bounds = useMemo(
    () => ({
      north:
        overlay.topLeft?.latitude ??
        (lobbyLocation.latitude ?? DefaultLatitude) + LatitudeLobbySizeOffset,
      east:
        overlay.topLeft?.longitude ??
        (lobbyLocation.longitude ?? DefaultLongitude) +
          LongitudeLobbySizeOffset,
      west:
        overlay.bottomRight?.longitude ??
        (lobbyLocation.longitude ?? DefaultLongitude) -
          LongitudeLobbySizeOffset,
      south:
        overlay.bottomRight?.latitude ??
        (lobbyLocation.latitude ?? DefaultLatitude) - LatitudeLobbySizeOffset,
    }),
    [
      lobbyLocation.latitude,
      lobbyLocation.longitude,
      overlay.bottomRight?.latitude,
      overlay.bottomRight?.longitude,
      overlay.topLeft?.latitude,
      overlay.topLeft?.longitude,
    ],
  );

  useMemo(() => rectangle.setBounds(bounds), [bounds, rectangle]);

  return <RotatableOverlay {...overlay} bounds={bounds} />;
}

function SiteComboBox({
  mapId,
  className,
  width,
}: {
  mapId: string;
  className?: string;
  width?: number;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchString, setSearchString] = useState("");
  const map = useMap(mapId);
  const places = useMapsLibrary("places");

  const sessionToken = useMemo(
    () => (places ? new places.AutocompleteSessionToken() : null),
    [places],
  );

  const placesService = useMemo(
    () => (map && places ? new places.PlacesService(map) : null),
    [map, places],
  );

  const autocompleteService = useMemo(
    () => (places ? new places.AutocompleteService() : null),
    [places],
  );

  const [predictedLocations, setPredictedLocations] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={popoverOpen}
          className={`justify-between ${className}`}
          style={{
            width: `${width}px`,
          }}
        >
          Jump to Location
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`p-0`} style={{ width: `${width}px` }}>
        <Command shouldFilter={false}>
          <CommandInput
            value={searchString}
            placeholder="Search places..."
            onValueChange={async (value) => {
              setSearchString(value);

              // todo: why is map null and keep value on close (value as state)
              if (!sessionToken || !autocompleteService) {
                return;
              }

              if (value === "") {
                setPredictedLocations([]);
                return;
              }

              setLoading(true);

              setPredictedLocations(
                (
                  await autocompleteService.getPlacePredictions({
                    input: value,
                    locationBias: map?.getBounds(),
                    sessionToken,
                  })
                ).predictions,
              );

              setLoading(false);
            }}
          />
          <CommandList>
            <CommandEmpty>No places found.</CommandEmpty>
            {loading && <CommandLoading />}
            <CommandGroup>
              {predictedLocations.map((predictedLocation) => (
                <CommandItem
                  key={predictedLocation.place_id}
                  value={predictedLocation.description}
                  onSelect={async () => {
                    if (!placesService || !sessionToken || !map) {
                      return;
                    }

                    const details =
                      await new Promise<google.maps.places.PlaceResult | null>(
                        (resolve) =>
                          placesService.getDetails(
                            {
                              placeId: predictedLocation.place_id,
                              sessionToken,
                            },
                            (a) => resolve(a),
                          ),
                      );

                    if (!details?.geometry?.viewport) {
                      return;
                    }

                    map.fitBounds(details?.geometry?.viewport);
                  }}
                >
                  {predictedLocation.description}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SetServiceOverlayPopup({
  locations: finalLocations,
  trigger,
  overlayLocation: finalOverlay,
  setOverlay: setFinalOverlay,
}: {
  locations: {
    name: string;
    location: PartialSiteLocation;
  }[];
  overlayLocation: PartialOverlayRequiredBase64;
  setOverlay: (newOverlay: PartialOverlayRequiredBase64) => void;
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
}) {
  const mapId = useId();
  const [overlayLocation, setOverlay] = useState(finalOverlay);
  useMemo(() => setOverlay({ ...finalOverlay }), [finalOverlay]);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Overlay Location </DialogTitle>
          <DialogDescription>
            Drag, resize, or rotate the overlay image to make it match the lobby
            of the site.
          </DialogDescription>
        </DialogHeader>
        <div className="h-96 rounded-sm overflow-clip border relative">
          <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY ?? ""}>
            <SiteComboBox
              mapId={mapId}
              className="absolute right-2 top-2 z-50"
              width={175}
            />
            <GMap
              id={mapId}
              defaultZoom={15}
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
              defaultCenter={{
                lat: finalLocations[0]?.location.latitude ?? DefaultLatitude,
                lng: finalLocations[0]?.location.longitude ?? DefaultLongitude,
              }}
              gestureHandling={"greedy"}
              disableDefaultUI={true}
            >
              {finalLocations.map((mapLocation, index) => (
                <Marker
                  key={index}
                  label={mapLocation.name[0]}
                  position={
                    mapLocation.location.latitude &&
                    mapLocation.location.longitude
                      ? {
                          lat: mapLocation.location.latitude,
                          lng: mapLocation.location.longitude,
                        }
                      : {
                          lat: DefaultLatitude,
                          lng: DefaultLongitude,
                        }
                  }
                />
              ))}
              <div className="flex flex-row gap-1 absolute left-2 top-2">
                <ContextMenu>
                  <ContextMenuTrigger>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setOverlay({
                          ...overlayLocation,
                          rotation: overlayLocation.rotation - 45,
                        });
                      }}
                    >
                      <RotateCcw />
                    </Button>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    {[5, 15, 90].map((value, index) => (
                      <ContextMenuItem
                        key={index}
                        onClick={() =>
                          setOverlay({
                            ...overlayLocation,
                            rotation: overlayLocation.rotation - value,
                          })
                        }
                      >
                        Rotate {value} Degrees Counter-Clockwise
                      </ContextMenuItem>
                    ))}
                  </ContextMenuContent>
                </ContextMenu>
                <ContextMenu>
                  <ContextMenuTrigger>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setOverlay({
                          ...overlayLocation,
                          rotation: overlayLocation.rotation + 45,
                        });
                      }}
                    >
                      <RotateCw />
                    </Button>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    {[5, 15, 90].map((value, index) => (
                      <ContextMenuItem
                        key={index}
                        onClick={() =>
                          setOverlay({
                            ...overlayLocation,
                            rotation: overlayLocation.rotation + value,
                          })
                        }
                      >
                        Rotate {value} Degrees Clockwise
                      </ContextMenuItem>
                    ))}
                  </ContextMenuContent>
                </ContextMenu>
              </div>
              <DraggableOverlayRectangle
                overlay={overlayLocation}
                lobbyLocation={finalLocations[0].location}
                setOverlay={setOverlay}
              />
            </GMap>
          </APIProvider>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="secondary"
              onClick={() => setOverlay(finalOverlay)}
            >
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={() => {
                setFinalOverlay(overlayLocation);
              }}
            >
              Save Overlay
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SetSiteLocationPopup({
  locations: finalLocations,
  trigger,
}: {
  locations: {
    name: string;
    location: PartialSiteLocation;
    setLocation: (siteLocation: PartialSiteLocation) => void;
  }[];
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
}) {
  const mapId = useId();

  const [locations, setLocations] = useState<
    Omit<PartialSiteLocation, "closestStreetAddress">[]
  >(finalLocations.map((mapLocation) => mapLocation.location));
  useMemo(
    () =>
      setLocations(finalLocations.map((mapLocation) => mapLocation.location)),
    [finalLocations],
  );

  const [rightClickLocation, setRightClickLocation] = useState<
    Omit<PartialSiteLocation, "closestStreetAddress">
  >({});

  const contextMenuTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Locations</DialogTitle>
          <DialogDescription>
            Right-click to place or drag the pins to set the locations
          </DialogDescription>
        </DialogHeader>
        <ContextMenu>
          <ContextMenuTrigger ref={contextMenuTriggerRef}>
            <div className="h-96 rounded-sm overflow-clip border relative">
              <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY ?? ""}>
                <SiteComboBox
                  mapId={mapId}
                  className="absolute right-2 top-2 z-50"
                  width={175}
                />
                <GMap
                  id={mapId}
                  defaultZoom={15}
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
                  onContextmenu={(contextMenuEvent) => {
                    if (
                      !contextMenuEvent.domEvent ||
                      !contextMenuEvent.detail.latLng ||
                      !(contextMenuEvent.domEvent instanceof MouseEvent)
                    ) {
                      return;
                    }

                    setRightClickLocation({
                      longitude: contextMenuEvent.detail.latLng?.lng,
                      latitude: contextMenuEvent.detail.latLng?.lat,
                    });

                    contextMenuTriggerRef.current?.dispatchEvent(
                      new MouseEvent(contextMenuEvent.domEvent.type, {
                        bubbles: contextMenuEvent.domEvent.bubbles,
                        cancelable: contextMenuEvent.domEvent.cancelable,
                        clientX: contextMenuEvent.domEvent.clientX,
                        clientY: contextMenuEvent.domEvent.clientY,
                      }),
                    );
                  }}
                  defaultCenter={{
                    lat: locations[0]?.latitude ?? DefaultLatitude,
                    lng: locations[0]?.longitude ?? DefaultLongitude,
                  }}
                  gestureHandling={"greedy"}
                  disableDefaultUI={true}
                >
                  {locations.map((mapLocation, index) => (
                    <Marker
                      key={index}
                      label={finalLocations[index].name[0]}
                      draggable
                      position={
                        mapLocation.latitude && mapLocation.longitude
                          ? {
                              lat: mapLocation.latitude,
                              lng: mapLocation.longitude,
                            }
                          : {
                              lat: DefaultLatitude,
                              lng: DefaultLongitude,
                            }
                      }
                      onDragEnd={(dragEvent) => {
                        setLocations(
                          locations.map((innerMapLocation, innerIndex) =>
                            innerIndex === index
                              ? {
                                  latitude: dragEvent.latLng?.lat(),
                                  longitude: dragEvent.latLng?.lng(),
                                }
                              : innerMapLocation,
                          ),
                        );
                      }}
                    />
                  ))}
                </GMap>
              </APIProvider>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {locations.map((_, index) => (
              <ContextMenuItem
                key={index}
                onClick={() => {
                  setLocations(
                    locations.map((innerMapLocation, innerIndex) =>
                      innerIndex === index
                        ? rightClickLocation
                        : innerMapLocation,
                    ),
                  );
                }}
              >
                Set {finalLocations[index].name} Location
              </ContextMenuItem>
            ))}
          </ContextMenuContent>
        </ContextMenu>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="secondary"
              onClick={() => {
                setLocations(
                  finalLocations.map((mapLocation) => mapLocation.location),
                );
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={async () => {
                const geocoder = new google.maps.Geocoder();

                // Race promises so that three load together and not sequentially
                await Promise.all(
                  locations.map(async (_, index) => {
                    const longitude = locations[index].longitude,
                      latitude = locations[index].latitude;

                    // Do nothing if no change
                    if (
                      longitude === finalLocations[index].location.longitude &&
                      latitude === finalLocations[index].location.latitude
                    ) {
                      return;
                    }

                    if (longitude && latitude) {
                      finalLocations[index].setLocation({
                        latitude,
                        longitude,
                        closestStreetAddress: "Loading...",
                      });

                      const reverseGeocodingResult = await geocoder.geocode({
                        location: {
                          lat: latitude,
                          lng: longitude,
                        },
                      });

                      finalLocations[index].setLocation({
                        latitude,
                        longitude,
                        closestStreetAddress:
                          reverseGeocodingResult.results[0].formatted_address,
                      });
                    } else {
                      finalLocations[index].setLocation({});
                    }
                  }),
                );
              }}
            >
              Save Locations
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SiteLabelsAndInputs({
  site,
}: {
  site?: Partial<z.infer<typeof AmbulatorySite>>;
}) {
  const idElementId = useId();
  const nameElementId = useId();
  const parkingPriceElementId = useId();
  const lobbyLocationElementId = useId();
  const parkingLocationTextElementId = useId();
  const dropOffLocationElementId = useId();
  const lobbyOverlayElementId = useId();

  const [parkingLocation, setParkingLocation] = useState<PartialSiteLocation>(
    site?.parkingLocation ?? {},
  );
  const [dropOffLocation, setDropOffLocation] = useState<PartialSiteLocation>(
    site?.dropOffLocation ?? {},
  );
  const [lobbyLocation, setLobbyLocation] = useState<PartialSiteLocation>(
    site?.lobbyLocation ?? {},
  );

  const [lobbyOverlay, setLobbyOverlay] = useState<PartialOverlay>(
    site?.overlay ?? {},
  );

  // Show that the overlay data is loading
  const [overlayLoading, setOverlayLoading] = useState(site?.id ? true : false);

  const { execute: loadOverlay, result: databaseOverlay } =
    useAction(getOverlayAction);
  // Load the overlay on component mount
  useEffect(() => {
    if (!site?.id) {
      return;
    }
    loadOverlay({ id: site?.id });
  }, [loadOverlay, site?.id]);

  const setOverlayInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!databaseOverlay || databaseOverlay.data === undefined) {
      return;
    }

    setOverlayLoading(false);
    setLobbyOverlay(databaseOverlay.data ?? {}); // Could be null here
  }, [databaseOverlay]);

  const mapLocations = useMemo(
    () => [
      { name: "Lobby", location: lobbyLocation, setLocation: setLobbyLocation },
      {
        name: "Parking",
        location: parkingLocation,
        setLocation: setParkingLocation,
      },
      {
        name: "Drop-Off",
        location: dropOffLocation,
        setLocation: setDropOffLocation,
      },
    ],
    [dropOffLocation, lobbyLocation, parkingLocation],
  );

  // Ensure the location is present when an overlay image is
  useEffect(() => {
    if (!setOverlayInputRef.current) {
      return;
    }

    if (
      lobbyOverlay.image &&
      (!lobbyOverlay.topLeft || !lobbyOverlay.bottomRight)
    ) {
      setOverlayInputRef.current.setCustomValidity("Set the overlay location");
    } else {
      setOverlayInputRef.current.setCustomValidity("");
    }
  }, [lobbyOverlay.image, lobbyOverlay.bottomRight, lobbyOverlay.topLeft]);

  return (
    <div className="grid grid-cols-[min-content_auto] gap-x-5 gap-y-2">
      {site?.id && (
        <Fragment>
          <Label
            className="col-start-1 self-center text-right"
            htmlFor={idElementId}
          >
            ID*:
          </Label>
          <Input
            className="col-start-2 cursor-not-allowed opacity-50"
            value={site.id}
            name="id"
            readOnly
            id={idElementId}
          />
        </Fragment>
      )}
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={nameElementId}
      >
        Name*:
      </Label>
      <Input
        className="col-start-2"
        defaultValue={site?.name}
        required
        name="name"
        id={nameElementId}
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={parkingPriceElementId}
      >
        Parking Price*:
      </Label>
      <div className="relative col-start-2">
        <span className="absolute left-2 top-1/2 -translate-y-1/2">$</span>
        <Input
          className="pl-6"
          defaultValue={site?.parkingPrice}
          type="number"
          min={0}
          step={0.01}
          required
          name="parkingPrice"
          id={parkingPriceElementId}
        />
        <span className="absolute right-8 top-1/2 -translate-y-1/2">/hr</span>
      </div>
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={lobbyLocationElementId}
      >
        Lobby Location*:
      </Label>
      <SetSiteLocationPopup
        locations={mapLocations}
        trigger={
          <span className="relative w-full">
            <Input
              className="text-primary placeholder:text-primary pr-11 overflow-ellipsis cursor-default"
              value={lobbyLocation.closestStreetAddress ?? ""}
              id={lobbyLocationElementId}
              name="lobbyLocation.closestStreetAddress"
              placeholder="Click to Set"
              required
              onChange={() => {
                /* Ignored */
              }}
            />
            <LocateFixed className="absolute right-[14px] top-1/2 -translate-y-1/2 h-1/2 text-primary" />
          </span>
        }
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={parkingLocationTextElementId}
      >
        Parking Location*:
      </Label>
      <SetSiteLocationPopup
        locations={mapLocations}
        trigger={
          <span className="relative w-full">
            <Input
              className="text-primary placeholder:text-primary pr-11 overflow-ellipsis cursor-default"
              value={parkingLocation.closestStreetAddress ?? ""}
              id={parkingLocationTextElementId}
              name="parkingLocation.closestStreetAddress"
              placeholder="Click to Set"
              required
              onChange={() => {
                /* Ignored */
              }}
            />
            <LocateFixed className="absolute right-[14px] top-1/2 -translate-y-1/2 h-1/2 text-primary" />
          </span>
        }
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={dropOffLocationElementId}
      >
        Drop-Off Location*:
      </Label>
      <SetSiteLocationPopup
        locations={mapLocations}
        trigger={
          <span className="relative w-full">
            <Input
              className="text-primary placeholder:text-primary pr-11 overflow-ellipsis cursor-default"
              value={dropOffLocation.closestStreetAddress ?? ""}
              id={dropOffLocationElementId}
              name="dropOffLocation.closestStreetAddress"
              placeholder="Click to Set"
              required
              onChange={() => {
                /* Ignore, so that we still have this as editable */
              }}
            />
            <LocateFixed className="absolute right-[14px] top-1/2 -translate-y-1/2 h-1/2 text-primary" />
          </span>
        }
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={lobbyOverlayElementId}
      >
        Lobby Image:
      </Label>
      <div className="col-start-2 flex flex-row gap-2">
        <Input
          type="file"
          id={lobbyOverlayElementId}
          ref={setOverlayInputRef}
          disabled={overlayLoading}
          onChange={async (fileChangeEvent) => {
            const file = fileChangeEvent.target.files?.[0];
            if (!file) {
              setLobbyOverlay({ ...lobbyOverlay, image: undefined });
              return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            await new Promise<ProgressEvent<FileReader>>((resolve, reject) => {
              reader.onloadend = resolve;
              reader.onerror = reject;
            });
            if (typeof reader.result !== "string") {
              setLobbyOverlay({ ...lobbyOverlay, image: undefined });
              return;
            }
            setLobbyOverlay({
              ...lobbyOverlay,
              image: reader.result,
              rotation: 0,
            });
          }}
        />
        {typeof lobbyOverlay.image === "string" ? (
          <SetServiceOverlayPopup
            trigger={<Button>Set Location</Button>}
            locations={mapLocations}
            overlayLocation={lobbyOverlay as PartialOverlayRequiredBase64}
            setOverlay={(newOverlay) =>
              setLobbyOverlay({ ...lobbyOverlay, ...newOverlay })
            }
          />
        ) : (
          <Button disabled>
            {overlayLoading && <Loader2 className="animate-spin" />} Set
            Location
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          disabled={
            overlayLoading ||
            (!lobbyOverlay.image &&
              !lobbyOverlay.topLeft &&
              !lobbyOverlay.bottomRight)
          }
          onClick={() => {
            setLobbyOverlay({});
            if (!setOverlayInputRef.current) {
              return;
            }
            setOverlayInputRef.current.value = "";
          }}
        >
          <Trash />
        </Button>
      </div>

      <Input
        className="hidden"
        value={lobbyOverlay.image ?? ""}
        readOnly
        name="overlay.image"
      />
      <Input
        className="hidden"
        value={lobbyOverlay.rotation ?? ""}
        readOnly
        name="overlay.rotation"
      />
      <Input
        className="hidden"
        value={lobbyOverlay.topLeft?.latitude ?? ""}
        readOnly
        name="overlay.topLeft.latitude"
      />
      <Input
        className="hidden"
        value={lobbyOverlay.topLeft?.longitude ?? ""}
        readOnly
        name="overlay.topLeft.longitude"
      />
      <Input
        className="hidden"
        value={lobbyOverlay.bottomRight?.latitude ?? ""}
        readOnly
        name="overlay.bottomRight.latitude"
      />
      <Input
        className="hidden"
        value={lobbyOverlay.bottomRight?.longitude ?? ""}
        readOnly
        name="overlay.bottomRight.longitude"
      />
      <Input
        className="hidden"
        value={parkingLocation.longitude ?? ""}
        readOnly
        name="parkingLocation.longitude"
      />
      <Input
        className="hidden"
        value={parkingLocation.latitude ?? ""}
        readOnly
        name="parkingLocation.latitude"
      />
      <Input
        className="hidden"
        value={dropOffLocation.longitude ?? ""}
        readOnly
        name="dropOffLocation.longitude"
      />
      <Input
        className="hidden"
        value={dropOffLocation.latitude ?? ""}
        readOnly
        name="dropOffLocation.latitude"
      />
      <Input
        className="hidden"
        value={lobbyLocation.longitude ?? ""}
        readOnly
        name="lobbyLocation.longitude"
      />
      <Input
        className="hidden"
        value={lobbyLocation.latitude ?? ""}
        readOnly
        name="lobbyLocation.latitude"
      />
    </div>
  );
}

export function AddSiteDialog({
  trigger,
  action,
}: {
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  action: (input: FormData) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Ambulatory Sites</DialogTitle>
          <DialogDescription>
            Enter the details of the new site:
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="contents" ref={formRef}>
          <SiteLabelsAndInputs />
          <DialogFooter>
            <p className="order-1 sm:-order-1 sm:grow self-center text-muted-foreground text-sm">
              *Required
            </p>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={() => {
                if (!formRef.current || !formRef.current.checkValidity()) {
                  return;
                }

                setDialogOpen(false);
              }}
            >
              Create Site
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditSitePopup({
  site,
  trigger,
  action,
}: {
  site: z.infer<typeof AmbulatorySite>;
  trigger: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  action: (input: FormData) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {React.cloneElement(trigger, {
          ...trigger.props,
          onSelect: (clickEvent) => {
            trigger.props.onSelect?.(clickEvent);

            clickEvent.preventDefault(); // Prevent the dropdown from closing
          },
        })}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Ambulatory Site</DialogTitle>
          <DialogDescription>
            Enter the new details of{" "}
            <span className="font-semibold">{site.name}</span>:
          </DialogDescription>
        </DialogHeader>
        <form className="contents" action={action} ref={formRef}>
          <SiteLabelsAndInputs site={site} />
          <DialogFooter>
            <p className="order-1 sm:-order-1 sm:grow self-center text-muted-foreground text-sm">
              *Required
            </p>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={() => {
                if (!formRef.current || formRef.current.checkValidity()) {
                  return;
                }

                setDialogOpen(false);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteSitePopup({
  site,
  trigger,
  action,
}: {
  site: z.infer<typeof AmbulatorySite>;
  trigger: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  action: (input: FormData) => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {React.cloneElement(trigger, {
          ...trigger.props,
          onSelect: (clickEvent) => {
            trigger.props.onSelect?.(clickEvent);

            clickEvent.preventDefault();
          },
        })}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Ambulatory Site</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{site.name}</span>? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form className="contents" action={action}>
            <Input
              className="hidden"
              readOnly
              name="id"
              value={site.id}
            ></Input>
            <Input
              className="hidden"
              readOnly
              name="name"
              value={site.name}
            ></Input>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              type="submit"
            >
              Delete Site
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
