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
import { ButtonHTMLAttributes, ReactElement } from "react";
import { SiteLabelsAndInputs } from "./Forms";

export function AddSiteDialog({
  trigger,
}: {
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
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
        <SiteLabelsAndInputs />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Create Site</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
