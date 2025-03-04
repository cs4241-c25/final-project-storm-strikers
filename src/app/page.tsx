import { getAllServicesCached, getAllSitesCached } from "@/caches";
import ServiceList from "@/components/services/serviceList";
import { Service } from "@/db";

function serializeServices(servicesToSerialize: Service[]) {
  return servicesToSerialize.map((service) => ({
    ...service,
    _id: service._id.toString(),
  }));
}

// Remove serializeSites function as sites are already serialized in the cache

export default async function Home() {
  const servicesList = await getAllServicesCached();
  const sitesList = await getAllSitesCached();
  const serializedServices = serializeServices(servicesList);

  return (
    <div className="flex flex-col min-h-screen">
      <ServiceList initialServices={serializedServices} sites={sitesList} />
    </div>
  );
}
