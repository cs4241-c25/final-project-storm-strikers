import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Service, services } from "@/db";

export default async function Services() {
  const servicesList = (await services.find({}).toArray()) as Service[];
  return (
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
  );
}
