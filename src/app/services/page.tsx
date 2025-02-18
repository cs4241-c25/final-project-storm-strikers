import { Service, services } from "@/db";

export default async function Services() {
  const servicesList = (await services.find({}).toArray()) as Service[];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Available Services</h1>
      <div className="grid gap-4">
        {servicesList.map((service: Service) => (
          <div key={service._id.toString()} className="border p-4">
            <h2 className="text-xl font-bold">{service.name}</h2>
            <p>Specialities: {service.specialities.join(", ")}</p>
            <p>Floor: {service.floor.join(", ")}</p>
            <p>Suite: {service.suite.join(", ")}</p>
            <p>Phone: {service.phone}</p>
            <p>Hours: {service.hours}</p>
            <p>Building: {service.building}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
