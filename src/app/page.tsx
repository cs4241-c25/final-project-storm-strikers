import { getAllServicesCached } from "@/caches";
import ServiceList from "@/components/services/serviceList";

export default async function Home() {
  const servicesList = await getAllServicesCached();

  return (
    <div className="flex flex-col">
      <ServiceList initialServices={servicesList} />
    </div>
  );
}
