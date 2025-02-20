import { Button } from "@/components/ui/button";
import { AmbulatorySite } from "@/db";
import { Plus } from "lucide-react";
import { AddSiteDialog } from "./Dialogs";
import SiteTable from "./Table";

export type AmbulatorySiteSerializable = Omit<AmbulatorySite, "_id"> & {
  _id: string;
};

export default async function Page() {
  // const sites = await AmbulatorySites.find().toArray();
  const data = [
    {
      _id: "test",
      name: "test",
      streetAddress: "1234 test ave",
    },
    {
      _id: "test2",
      name: "test",
      streetAddress: "1234 test ave",
    },
    {
      _id: "test3",
      name: "test",
      streetAddress: "1234 test ave",
    },
  ];

  return (
    <div className="flex flex-col grow m-3 gap-5">
      <AddSiteDialog
        trigger={
          <Button className="self-end">
            <Plus />
            Add Ambulatory Site
          </Button>
        }
      />
      <SiteTable className="grow" sites={data} />
    </div>
  );
}
