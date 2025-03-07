"use client";

import MultiInput from "@/components/multi-input";
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
import { Service } from "@/types";
import React, {
  ButtonHTMLAttributes,
  Fragment,
  ReactElement,
  useId,
  useRef,
  useState,
} from "react";
import { z } from "zod";

function ServiceLabelsAndInputs({
  service,
}: {
  service?: Partial<z.infer<typeof Service>>;
}) {
  const idElementId = useId();
  const nameElementId = useId();
  const specialtiesElementId = useId();
  const floorElementId = useId();
  const suiteElementId = useId();
  const phoneElementId = useId();
  const hoursElementId = useId();
  const buildingElementId = useId();

  return (
    <div className="grid grid-cols-[min-content_auto] gap-x-5 gap-y-2">
      {service?.id && (
        <Fragment>
          <Label
            className="col-start-1 self-center text-right"
            htmlFor={idElementId}
          >
            ID*:
          </Label>
          <Input
            className="col-start-2 cursor-not-allowed opacity-50"
            value={service.id}
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
        defaultValue={service?.name}
        required
        name="name"
        id={nameElementId}
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={specialtiesElementId}
      >
        Specialties*:
      </Label>
      <MultiInput
        className="col-start-2"
        defaultValue={service?.specialties}
        required
        minLength={1}
        placeholder="Click to view specialties"
        name="specialties"
        id={specialtiesElementId}
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={floorElementId}
      >
        Floor:
      </Label>
      <MultiInput
        className="relative col-start-2"
        defaultValue={service?.floor}
        placeholder="Click to view floors"
        minLength={1}
        type="number"
        name="floor"
        id={floorElementId}
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={suiteElementId}
      >
        Suite:
      </Label>
      <MultiInput
        className="col-start-2"
        defaultValue={service?.suite}
        placeholder="Click to view suites"
        minLength={1}
        name="suite"
        id={suiteElementId}
      />
      <Label
        className="col-start-1 self-center text-right"
        htmlFor={phoneElementId}
      >
        Phone*:
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
        Hours*:
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
        defaultValue={service?.building?.id}
        name="building"
        id={buildingElementId}
      />
    </div>
  );
}

export function AddServiceDialog({
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
          <DialogTitle>Create Ambulatory Service</DialogTitle>
          <DialogDescription>
            Enter the details of the new service:
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="contents" ref={formRef}>
          <ServiceLabelsAndInputs />
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
              Create Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditServicePopup({
  service,
  trigger,
  action,
}: {
  service: z.infer<typeof Service>;
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
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
          <DialogTitle>Edit Ambulatory Service</DialogTitle>
          <DialogDescription>
            Enter the new details of{" "}
            <span className="font-semibold">{service.name}</span>:
          </DialogDescription>
        </DialogHeader>
        <form className="contents" action={action} ref={formRef}>
          <ServiceLabelsAndInputs service={service} />
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteServicePopup({
  service,
  trigger,
  action,
}: {
  service: z.infer<typeof Service>;
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
          <AlertDialogTitle>Delete Ambulatory Service</AlertDialogTitle>
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
              value={service.id}
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
              Delete Service
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
