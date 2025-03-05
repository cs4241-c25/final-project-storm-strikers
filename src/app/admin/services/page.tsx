import { getAllServicesCached, getAllSitesCached } from "@/caches";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import { createService, deleteService, editService } from "./actions";
import { DeleteSitePopup, EditSitePopup } from "./dialogs";

export default async function Services() {
  const servicesList = await getAllServicesCached();
  const sitesList = await getAllSitesCached();

  // Extract unique site names
  const siteNames = Array.from(new Set(sitesList.map((site) => site.name)));

  // Helper function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services Directory</h1>

        {/* Dialog for Adding a Service */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Fill in the details for the new service
              </DialogDescription>
            </DialogHeader>
            <form action={createService} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name">Name</label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="specialities">
                  Specialities (comma-separated)
                </label>
                <Input id="specialities" name="specialities" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="floor">Floor Numbers</label>
                  <Input id="floor" name="floor" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="suite">Suite Numbers</label>
                  <Input id="suite" name="suite" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone">Phone</label>
                  <Input id="phone" name="phone" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="hours">Hours</label>
                  <Input id="hours" name="hours" required />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="building">Location</label>
                <Select name="building" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {siteNames.map((siteName, index) => (
                      <SelectItem key={index} value={siteName}>
                        {capitalizeFirstLetter(siteName)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Create Service
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Name</TableHead>
            <TableHead className="font-bold">Specialities</TableHead>
            <TableHead className="font-bold">Floor</TableHead>
            <TableHead className="font-bold">Suite</TableHead>
            <TableHead className="font-bold">Phone</TableHead>
            <TableHead className="font-bold">Hours</TableHead>
            <TableHead className="font-bold">Building</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servicesList.map((service) => (
            <TableRow key={service._id.toString()}>
              <TableCell>{service.name}</TableCell>
              <TableCell>{service.specialities.join(", ")}</TableCell>
              <TableCell>{service.floor.join(", ")}</TableCell>
              <TableCell>{service.suite.join(", ")}</TableCell>
              <TableCell>{service.phone}</TableCell>
              <TableCell>{service.hours}</TableCell>
              <TableCell>{service.building}</TableCell>

              <TableCell>
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
                      service={service}
                      trigger={
                        <DropdownMenuItem>
                          <Pencil />
                          Edit Service
                        </DropdownMenuItem>
                      }
                      action={editService}
                    />

                    <DeleteSitePopup
                      service={service}
                      action={deleteService}
                      trigger={
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash className="text-destructive" />
                          Delete Service
                        </DropdownMenuItem>
                      }
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
