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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Service } from "@/db";
import React, { useId } from "react";

function SiteLabelsAndInputs({ service }: { service?: Service }) {
  const nameElementId = useId();
  const specialtiesElementId = useId();
  const floorElementId = useId();
  const suiteElementId = useId();
  const phoneElementId = useId();
  const hoursElementId = useId();
  const buildingElementId = useId();

  return (
    <div className="grid grid-cols-[min-content_auto] gap-x-5 gap-y-2">
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={nameElementId}
      >
        Name:
      </Label>
      <Input
        className="col-start-2"
        defaultValue={service?.name}
        required
        name="name"
        id={nameElementId}
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={specialtiesElementId}
      >
        Specialties:
      </Label>
      <Input
        className="col-start-2"
        defaultValue={service?.specialities}
        required
        name="specialties"
        id={specialtiesElementId}
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={floorElementId}
      >
        Floor:
      </Label>
      <div className="relative col-start-2">
        <span className="absolute left-2 top-1/2 -translate-y-1/2">$</span>
        <Input
          className="pl-6"
          defaultValue={service?.floor}
          type="number"
          step={0.01}
          required
          name="floor"
          id={floorElementId}
        />
      </div>
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={suiteElementId}
      >
        Suite:
      </Label>
      <Input
        className="col-start-2"
        defaultValue={service?.suite}
        required
        name="suite"
        id={suiteElementId}
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={phoneElementId}
      >
        Phone:
      </Label>
      <Input
        className="col-start-2"
        defaultValue={service?.phone}
        required
        name="phone"
        id={phoneElementId}
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={hoursElementId}
      >
        Hours:
      </Label>
      <Input
        className="col-start-2"
        defaultValue={service?.hours}
        required
        name="hours"
        id={hoursElementId}
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={buildingElementId}
      >
        Building:
      </Label>
      <Input
        className="col-start-2"
        defaultValue={service?.building}
        required
        name="building"
        id={buildingElementId}
      />
    </div>
  );
}

export function EditSitePopup({
  service,
  trigger,
  action,
}: {
  service: Service;
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
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>
            Enter the new details of{" "}
            <span className="font-semibold">{service.name}</span>:
          </DialogDescription>
        </DialogHeader>
        <form className="contents" action={action}>
          <SiteLabelsAndInputs service={service} />
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
  service,
  trigger,
  action,
}: {
  service: Service;
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
          <AlertDialogTitle>Delete Service</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{service.name}</span>? This action
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
              value={service._id.toString()}
            ></Input>
            <Input
              className="hidden"
              readOnly
              name="name"
              value={service.name}
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
