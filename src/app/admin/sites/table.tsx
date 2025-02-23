"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AmbulatorySite } from "@/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { createContext, use, useEffect, useMemo, useState } from "react";
import type { z } from "zod";
import { DeleteSitePopup, EditSitePopup } from "./dialogs";

const EditActionContext = createContext<(input: FormData) => void>(() => {
  /* ignore */
});

const DeleteActionContext = createContext<(input: FormData) => void>(() => {
  /* ignore */
});

const DropdownColumn = function DropdownEdit({
  site,
}: {
  site: z.infer<typeof AmbulatorySite>;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const editAction = use(EditActionContext);
  const deleteAction = use(DeleteActionContext);

  // when the site changes, close the dropdown
  useEffect(() => setDropdownOpen(false), [site]);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <EditSitePopup
          site={site}
          trigger={
            <DropdownMenuItem>
              <Pencil />
              Edit Site
            </DropdownMenuItem>
          }
          action={editAction}
        />

        <DeleteSitePopup
          site={site}
          action={deleteAction}
          trigger={
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash className="text-destructive" />
              Delete Site
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const columns: ColumnDef<z.infer<typeof AmbulatorySite>>[] = [
  { accessorKey: "id", header: "ID", size: 1 },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "streetAddress", header: "Address" },
  {
    accessorFn: ({ parkingPrice }) =>
      parkingPrice.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
      }),
    header: "Parking Price",
  },
  {
    header: "",
    id: "actions",
    size: 1,
    cell: ({ row }) => {
      return <DropdownColumn site={row.original} />;
    },
  },
];

export default function SiteTable({
  sites,
  className,
  editAction: editAction,
  deleteAction: deleteAction,
}: {
  sites: z.infer<typeof AmbulatorySite>[];
  className: string | undefined;
  editAction: (input: FormData) => void;
  deleteAction: (input: FormData) => void;
}) {
  // For some reason, the updates don't seem to reach the table
  // unless we do this...
  const [sitesShallowCopy, setSitesShallowCopy] = useState(sites);
  useMemo(() => setSitesShallowCopy(sites), [sites]);

  const table = useReactTable<z.infer<typeof AmbulatorySite>>({
    data: sitesShallowCopy,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={`rounded-md border ${className}`}>
      {/* Drill the edit stuff down WITHOUT triggering column re-renders */}
      <EditActionContext.Provider value={editAction}>
        <DeleteActionContext.Provider value={deleteAction}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DeleteActionContext.Provider>
      </EditActionContext.Provider>
    </div>
  );
}
