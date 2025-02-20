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
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import type { AmbulatorySiteSerializable } from "./page";
import { DeleteSitePopup, EditSitePopup } from "./TableDialogs";

const columns: ColumnDef<AmbulatorySiteSerializable>[] = [
  { accessorKey: "_id", header: "ID", size: 1 },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "streetAddress", header: "Address" },
  {
    header: "",
    id: "actions",
    size: 1,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <EditSitePopup
              site={row.original}
              trigger={
                <DropdownMenuItem>
                  <Pencil />
                  Edit Site
                </DropdownMenuItem>
              }
            />
            <DeleteSitePopup
              site={row.original}
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
    },
  },
];

export default function SiteTable({
  sites,
  className,
}: {
  sites: AmbulatorySiteSerializable[];
  className: string | undefined;
}) {
  const table = useReactTable<AmbulatorySiteSerializable>({
    data: sites,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={`rounded-md border ${className}`}>
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
