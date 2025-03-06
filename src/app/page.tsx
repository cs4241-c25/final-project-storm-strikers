import { getAllServicesCached } from "@/caches";
import ParkingNavigation from "@/components/services/parkingNavigation";
import ServiceList from "@/components/services/serviceList";

export default async function Home() {
  const servicesList = await getAllServicesCached();

  return (
    <div>
      <div className="flex flex-col min-h-screen">
        <ServiceList initialServices={servicesList} />
      </div>
      <div className="mt-8 flex flex-col items-center gap-4">
        <ParkingNavigation />
      </div>
    </div>
  );
}
