import ServiceList from "@/components/services/serviceList";
import { Service, services } from "@/db";

function serializeServices(servicesToSerialize: Service[]) {
  return servicesToSerialize.map((service) => ({
    ...service,
    _id: service._id.toString(),
  }));
}

export default async function Home() {
  const servicesList = (await services.find({}).toArray()) as Service[];
  const serializedServices = serializeServices(servicesList);

  return (
    <div className="flex flex-col min-h-screen">
      <ServiceList initialServices={serializedServices} />
    </div>
  );
}
