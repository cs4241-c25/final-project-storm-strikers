"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AmbulatorySite, Service } from "@/types";
import { Plus } from "lucide-react";
import { useOptimisticAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zfd } from "zod-form-data";
import {
  createServiceAction,
  deleteServiceAction,
  updateServiceAction,
} from "./actions";
import { AddServiceDialog } from "./dialogs";
import ServiceTable from "./table";

export interface PopupFormData {
  action: (input: FormData) => void;
  isIdle: boolean;
  reset: () => void;
}

function ErrorDialog({
  input,
  presentTense,
  pastTense,
  isOpen,
}: {
  input: unknown;
  isOpen: boolean;
  presentTense: string;
  pastTense: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setDialogOpen(true);
    }
  }, [isOpen]);

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Failed to {presentTense} Service</AlertDialogTitle>
          <AlertDialogDescription>
            Service{" "}
            <span className="font-semibold">
              {zfd.formData(Service.partial()).safeParse(input ?? {}).data
                ?.name ?? "unknown"}
            </span>{" "}
            was not {pastTense}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function useSuccessToast(show: boolean, input: unknown, pastTense: string) {
  useEffect(() => {
    if (show) {
      toast.success(`Service ${pastTense}`, {
        description: (
          <p>
            Successfully {pastTense} Service{" "}
            <span className="font-semibold">
              {
                zfd
                  .formData(
                    Service.merge(
                      z.strictObject({
                        building: zfd.text(z.string().optional()),
                      }),
                    )
                      .partial()
                      .required({ name: true }),
                  )
                  .parse(input).name
              }
            </span>
          </p>
        ),
      });
    }
  }, [show, pastTense, input]);
}

const LoadingLocation = {
  closestStreetAddress: "Loading...",
  latitude: NaN,
  longitude: NaN,
} satisfies z.infer<typeof AmbulatorySite>["parkingLocation"];
const LoadingSite = {
  dropOffLocation: LoadingLocation,
  id: "Loading...",
  lobbyLocation: LoadingLocation,
  name: "Loading...",
  parkingLocation: LoadingLocation,
  parkingPrice: NaN,
} satisfies z.infer<typeof AmbulatorySite>;

/**
 * Wrapper around the client-side page contents
 * (table and interaction) that handles ensuring
 * the cached client state is managed correctly
 */
export default function ClientStateManager({
  serverState,
  ambulatorySites,
}: {
  serverState: z.infer<typeof Service>[];
  ambulatorySites: z.infer<typeof AmbulatorySite>[];
}) {
  const {
    execute: addServiceExecute,
    status: addServiceStatus,
    input: addServiceInput,
    optimisticState: addServiceOptimisticState,
  } = useOptimisticAction(createServiceAction, {
    currentState: serverState,
    updateFn: (state, data) => {
      const newService = zfd
        .formData(
          Service.omit({ id: true }).merge(
            z.strictObject({
              building: zfd.text(z.string().optional()),
            }),
          ),
        )
        .parse(data);

      return [
        ...state,
        {
          ...newService,
          id: "Loading...",
          building: newService.building
            ? (ambulatorySites.find(
                (site) => site.id === newService.building,
              ) ?? LoadingSite)
            : undefined,
        },
      ];
    },
  });

  const {
    execute: editServiceExecute,
    status: editServiceStatus,
    input: editServiceInput,
    optimisticState: editServiceOptimisticState,
  } = useOptimisticAction(updateServiceAction, {
    currentState: addServiceOptimisticState,
    updateFn: (state, data) => {
      const editedService = zfd
        .formData(
          Service.merge(
            z.strictObject({
              building: zfd.text(z.string().optional()),
            }),
          ),
        )
        .parse(data);

      return state.map((service) =>
        service.id === editedService.id
          ? {
              ...editedService,
              building: editedService.building
                ? service.building?.id === editedService.building
                  ? service.building
                  : (ambulatorySites.find(
                      (site) => site.id === editedService.building,
                    ) ?? LoadingSite)
                : undefined,
            }
          : service,
      );
    },
  });

  const {
    execute: deleteServiceExecute,
    status: deleteServiceStatus,
    input: deleteServiceInput,
    optimisticState: deleteServiceOptimisticState,
  } = useOptimisticAction(deleteServiceAction, {
    currentState: editServiceOptimisticState,
    updateFn: (state, data) => {
      const deletedService = zfd
        .formData(Service.partial().required({ id: true }))
        .parse(data);

      return state.filter((service) => service.id !== deletedService.id);
    },
  });

  useSuccessToast(
    addServiceStatus === "hasSucceeded",
    addServiceInput,
    "added",
  );
  useSuccessToast(
    editServiceStatus === "hasSucceeded",
    editServiceInput,
    "edited",
  );
  useSuccessToast(
    deleteServiceStatus === "hasSucceeded",
    deleteServiceInput,
    "deleted",
  );

  return (
    <div className="flex flex-col m-3 gap-5 flex-grow container mx-auto px-4 py-8">
      <div className="flex flex-row justify-between items-end">
        <h1 className="text-3xl font-bold">Ambulatory Services</h1>
        <AddServiceDialog
          ambulatorySites={ambulatorySites}
          trigger={
            <Button className="self-end">
              <Plus />
              Add Service
            </Button>
          }
          action={addServiceExecute}
        />
      </div>
      <ErrorDialog
        isOpen={addServiceStatus === "hasErrored"}
        input={addServiceInput}
        presentTense="create"
        pastTense="created"
      />
      <ErrorDialog
        isOpen={editServiceStatus === "hasErrored"}
        input={editServiceInput}
        presentTense="edit"
        pastTense="edited"
      />
      <ErrorDialog
        isOpen={deleteServiceStatus === "hasErrored"}
        input={deleteServiceInput}
        presentTense="delete"
        pastTense="deleted"
      />
      <ServiceTable
        ambulatorySites={ambulatorySites}
        className="grow"
        services={deleteServiceOptimisticState}
        editAction={editServiceExecute}
        deleteAction={deleteServiceExecute}
      />
    </div>
  );
}
