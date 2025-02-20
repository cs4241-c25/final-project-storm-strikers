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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { createRef } from "react";
import { SiteLabelsAndInputs } from "./Forms";
import type { AmbulatorySiteSerializable } from "./page";

export function EditSitePopup({
  site,
  trigger,
}: {
  site: AmbulatorySiteSerializable;
  trigger: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
}) {
  const buttonRef = createRef<HTMLButtonElement | null>();

  return (
    <Dialog>
      <DialogTrigger ref={buttonRef} className="contents">
        {React.cloneElement(trigger, {
          ...trigger.props,
          onClick: (clickEvent) => {
            trigger.props.onClick?.(clickEvent);

            clickEvent.preventDefault();

            buttonRef.current?.click();
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
        <SiteLabelsAndInputs site={site} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteSitePopup({
  site,
  trigger,
}: {
  site: AmbulatorySiteSerializable;
  trigger: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
}) {
  const buttonRef = createRef<HTMLButtonElement | null>();

  return (
    <AlertDialog>
      <AlertDialogTrigger ref={buttonRef} className="contents">
        {React.cloneElement(trigger, {
          ...trigger.props,
          onClick: (clickEvent) => {
            trigger.props.onClick?.(clickEvent);

            clickEvent.preventDefault();

            buttonRef.current?.click();
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
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete Site
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
