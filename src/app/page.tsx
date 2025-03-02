import { getAllBuildingsCached, getAllServicesCached } from "@/caches";
import ServiceList from "@/components/services/serviceList";
import { Building, Service } from "@/db";

function serializeServices(servicesToSerialize: Service[]) {
  return servicesToSerialize.map((service) => ({
    ...service,
    _id: service._id.toString(),
  }));
}

function serializeData(servicesToSerialize: Building[]) {
  return servicesToSerialize.map((building) => ({
    ...building,
    _id: building._id.toString(),
  }));
}

export default async function Home() {
  const servicesList = await getAllServicesCached();
  const buildingsList = await getAllBuildingsCached();
  const serializedServices = serializeServices(servicesList);
  const serializedBuildings = serializeData(buildingsList);

  return (
    <div className="flex flex-col min-h-screen">
      <ServiceList
        initialServices={serializedServices}
        buildingDirections={serializedBuildings}
      />
    </div>
  );
}
