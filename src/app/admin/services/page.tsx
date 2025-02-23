import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Service, services } from "@/db";
import { createService } from "./actions";

export default async function Services() {
  const servicesList = (await services.find({}).toArray()) as Service[];

  // Extract unique building names
  const buildingNames = Array.from(
    new Set(servicesList.map((service) => service.building)),
  );

  // Helper function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services Directory</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default">Add New Service</Button>
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
                <label htmlFor="building">Building</label>
                <Select name="building" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingNames.map((building, index) => (
                      <SelectItem key={index} value={building}>
                        {capitalizeFirstLetter(building)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogTrigger asChild>
                <Button type="submit" className="w-full">
                  Create Service
                </Button>
              </DialogTrigger>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
