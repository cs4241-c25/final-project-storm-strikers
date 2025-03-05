import { getAllServicesCached, getAllSitesCached } from "@/caches";
import ServiceList from "@/components/services/serviceList";
import { Service } from "@/db";
<<<<<<< HEAD
import ParkingNavigation from "@/components/services/parkingNavigation";
=======
>>>>>>> 37884464d8a1ca4807099a16596885ddd1800f20

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
<<<<<<< HEAD
    <div>
      <div className="flex flex-col min-h-screen">
        <ServiceList initialServices={serializedServices} sites={sitesList} />
      </div>
      <div className="flex flex-col min-h-screen">
        <ParkingNavigation />
      </div>
=======
    <div className="flex flex-col min-h-screen">
      <ServiceList initialServices={serializedServices} sites={sitesList} />
>>>>>>> 37884464d8a1ca4807099a16596885ddd1800f20
    </div>
  );
}