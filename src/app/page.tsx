import { getAllServicesCached, getAllSitesCached } from "@/caches";
import ServiceList from "@/components/services/serviceList";
import { Service } from "@/db";
import ParkingNavigation from "@/components/services/parkingNavigation";

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
    <div>
      <div className="flex flex-col min-h-screen">
        <ServiceList initialServices={serializedServices} sites={sitesList} />
      </div>
      <div className="mt-8 flex flex-col items-center gap-4">
        <ParkingNavigation />
      </div>
    </div>
  );
}