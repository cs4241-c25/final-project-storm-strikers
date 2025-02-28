"use client";

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
import { AmbulatorySite } from "@/types";
import { APIProvider, Map as GMap, Marker } from "@vis.gl/react-google-maps";
import { LocateFixed } from "lucide-react";
import React, {
  ButtonHTMLAttributes,
  Fragment,
  ReactElement,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { z } from "zod";

type PartialSiteLocation = Partial<
  z.infer<typeof AmbulatorySite>["parkingLocation"]
>;

function SetSiteLocationPopup({
  siteLocation: initialLocation,
  setSiteLocation: setFinalLocation,
  locationName,
  trigger,
}: {
  siteLocation: PartialSiteLocation;
  setSiteLocation: (siteLocation: PartialSiteLocation) => void;
  locationName: string;
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
}) {
  const DefaultLatitude = 42.36529; // this is boston
  const DefaultLongitude = -71.0555; // this is boston
  const mapId = useId();

  const [siteLocation, setSiteLocation] = useState<
    Omit<PartialSiteLocation, "closestStreetAddress">
  >(initialLocation ?? {});
  useMemo(() => setSiteLocation(initialLocation ?? {}), [initialLocation]);

  const [rightClickLocation, setRightClickLocation] = useState<
    Omit<PartialSiteLocation, "closestStreetAddress">
  >({});

  const contextMenuTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set {locationName} Location</DialogTitle>
          <DialogDescription>
            Right-click or drag the pin to set the location
          </DialogDescription>
        </DialogHeader>
        <ContextMenu>
          <ContextMenuTrigger ref={contextMenuTriggerRef}>
            <div className="h-96 rounded-sm overflow-clip border">
              <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY ?? ""}>
                <GMap
                  mapId={mapId}
                  defaultZoom={15}
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
                    lat: siteLocation.latitude ?? DefaultLatitude,
                    lng: siteLocation.longitude ?? DefaultLongitude,
                  }}
                  gestureHandling={"greedy"}
                  disableDefaultUI={true}
                >
                  <Marker
                    draggable
                    position={
                      siteLocation.latitude && siteLocation.longitude
                        ? {
                            lat: siteLocation.latitude,
                            lng: siteLocation.longitude,
                          }
                        : undefined
                    }
                    onDragEnd={(dragEvent) => {
                      setSiteLocation({
                        latitude: dragEvent.latLng?.lat(),
                        longitude: dragEvent.latLng?.lng(),
                      });
                    }}
                  ></Marker>
                </GMap>
              </APIProvider>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => {
                setSiteLocation({
                  ...rightClickLocation,
                });
              }}
            >
              Set {locationName} Name
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={async () => {
                if (!siteLocation.longitude || !siteLocation.latitude) {
                  setFinalLocation({});
                  return;
                }

                const geocoder = new google.maps.Geocoder();
                const reverseGeocodingResult = await geocoder.geocode({
                  location: {
                    lat: siteLocation.latitude,
                    lng: siteLocation.longitude,
                  },
                });
                setFinalLocation({
                  ...siteLocation,
                  closestStreetAddress:
                    reverseGeocodingResult.results[0].formatted_address,
                });
              }}
            >
              Save Location
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
  const addressElementId = useId();
  const parkingPriceElementId = useId();
  const parkingLocationTextElementId = useId();

  const [parkingLocation, setParkingLocation] = useState<PartialSiteLocation>(
    site?.parkingLocation ?? {},
  );

  return (
    <div className="grid grid-cols-[min-content_auto] gap-x-5 gap-y-2">
      {site?.id && (
        <Fragment>
          <Label
            className="col-start-1 self-center text-right"
            htmlFor={idElementId}
          >
            ID:
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
        Name:
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
        htmlFor={addressElementId}
      >
        Address:
      </Label>
      <Input
        className="col-start-2"
        defaultValue={site?.streetAddress}
        required
        name="streetAddress"
        id={addressElementId}
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={parkingPriceElementId}
      >
        Parking Price:
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
        htmlFor={parkingLocationTextElementId}
      >
        Parking Location:
      </Label>
      <SetSiteLocationPopup
        locationName="Parking"
        siteLocation={parkingLocation}
        setSiteLocation={setParkingLocation}
        trigger={
          <span className="relative w-full">
            <Input
              className="text-primary placeholder:text-primary pr-11 overflow-ellipsis"
              value={parkingLocation.closestStreetAddress ?? ""}
              id={parkingLocationTextElementId}
              name="parkingLocation.closestStreetAddress"
              required
              placeholder="Click to Set"
              readOnly
            />
            <LocateFixed className="absolute right-[14px] top-1/2 -translate-y-1/2 h-1/2 text-primary" />
          </span>
        }
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
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Ambulatory Sites</DialogTitle>
          <DialogDescription>
            Enter the details of the new site:
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="contents">
          <SiteLabelsAndInputs />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild type="submit">
              <Button>Create Site</Button>
            </DialogClose>
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
  return (
    <Dialog>
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
        <form className="contents" action={action}>
          <SiteLabelsAndInputs site={site} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild type="submit">
              <Button>Save Changes</Button>
            </DialogClose>
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
