import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fragment, useId } from "react";
import type { AmbulatorySiteSerializable } from "./page";

export function SiteLabelsAndInputs({
  site,
}: {
  site?: Partial<AmbulatorySiteSerializable>;
}) {
  const idElementId = useId();
  const nameElementId = useId();
  const addressElementId = useId();

  return (
    <div className="grid grid-cols-[min-content_auto] gap-x-5 gap-y-2">
      {site?._id && (
        <Fragment>
          <Label
            className="col-start-1 self-center text-right"
            htmlFor={idElementId}
          >
            ID:
          </Label>
          <Input
            className="col-start-2"
            defaultValue={site._id}
            disabled
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
        name={addressElementId}
      />
    </div>
  );
}
