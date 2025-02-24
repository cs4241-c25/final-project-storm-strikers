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
import { AmbulatorySite } from "@/types";
import { Plus } from "lucide-react";
import { useOptimisticAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import { zfd } from "zod-form-data";
import { addSiteAction, deleteSiteAction, editSiteAction } from "./actions";
import { AddSiteDialog } from "./dialogs";
import SiteTable from "./table";

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
          <AlertDialogTitle>
            Failed to {presentTense} Ambulatory Site
          </AlertDialogTitle>
          <AlertDialogDescription>
            Site{" "}
            <span className="font-semibold">
              {zfd.formData(AmbulatorySite.partial()).safeParse(input ?? {})
                .data?.name ?? "unknown"}
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
      toast(`Site ${pastTense}`, {
        description: (
          <p>
            Successfully {pastTense} Ambulatory Site{" "}
            <span className="font-semibold">
              {
                zfd
                  .formData(AmbulatorySite.partial().required({ name: true }))
                  .parse(input).name
              }
            </span>
          </p>
        ),
      });
    }
  }, [show, pastTense, input]);
}

/**
 * Wrapper around the client-side page contents
 * (table and interaction) that handles ensuring
 * the cached client state is managed correctly
 */
export default function ClientStateManager({
  serverState,
}: {
  serverState: z.infer<typeof AmbulatorySite>[];
}) {
  const {
    execute: addSiteExecute,
    status: addSiteStatus,
    input: addSiteInput,
    optimisticState: addSiteOptimisticState,
  } = useOptimisticAction(addSiteAction, {
    currentState: serverState,
    updateFn: (state, data) => {
      return [
        ...state,
        {
          ...zfd.formData(AmbulatorySite.omit({ id: true })).parse(data),
          id: "Loading...",
        },
      ];
    },
  });

  const {
    execute: editSiteExecute,
    status: editSiteStatus,
    input: editSiteInput,
    optimisticState: editSiteOptimisticState,
  } = useOptimisticAction(editSiteAction, {
    currentState: addSiteOptimisticState,
    updateFn: (state, data) => {
      const editedSite = zfd.formData(AmbulatorySite).parse(data);

      return state.map((site) =>
        site.id === editedSite.id ? editedSite : site,
      );
    },
  });

  const {
    execute: deleteSiteExecute,
    status: deleteSiteStatus,
    input: deleteSiteInput,
    optimisticState: deleteSiteOptimisticState,
  } = useOptimisticAction(deleteSiteAction, {
    currentState: editSiteOptimisticState,
    updateFn: (state, data) => {
      const deletedSite = zfd
        .formData(AmbulatorySite.partial().required({ id: true }))
        .parse(data);

      return state.filter((site) => site.id !== deletedSite.id);
    },
  });

  useSuccessToast(addSiteStatus === "hasSucceeded", addSiteInput, "added");
  useSuccessToast(editSiteStatus === "hasSucceeded", editSiteInput, "edited");
  useSuccessToast(
    deleteSiteStatus === "hasSucceeded",
    deleteSiteInput,
    "deleted",
  );

  return (
    <div className="flex flex-col grow m-3 gap-5">
      <div className="flex flex-row justify-between items-end">
        <h1 className="text-2xl font-bold">Ambulatory Sites</h1>
        <AddSiteDialog
          trigger={
            <Button className="self-end">
              <Plus />
              Add Ambulatory Site
            </Button>
          }
          action={addSiteExecute}
        />
      </div>
      <ErrorDialog
        isOpen={addSiteStatus === "hasErrored"}
        input={addSiteInput}
        presentTense="create"
        pastTense="created"
      />
      <ErrorDialog
        isOpen={editSiteStatus === "hasErrored"}
        input={editSiteInput}
        presentTense="edit"
        pastTense="edited"
      />
      <ErrorDialog
        isOpen={deleteSiteStatus === "hasErrored"}
        input={deleteSiteInput}
        presentTense="delete"
        pastTense="deleted"
      />
      <SiteTable
        className="grow"
        sites={deleteSiteOptimisticState}
        editAction={editSiteExecute}
        deleteAction={deleteSiteExecute}
      />
    </div>
  );
}
