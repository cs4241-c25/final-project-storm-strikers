"use server";

import { BuildingType, services } from "@/db";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  const service = {
    name: formData.get("name") as string,
    specialities: (formData.get("specialities") as string).split(","),
    floor: (formData.get("floor") as string).split(","),
    suite: (formData.get("suite") as string).split(","),
    phone: formData.get("phone") as string,
    hours: formData.get("hours") as string,
    building: formData.get("building") as BuildingType,
  };

  await services.insertOne(service);
  revalidatePath("/services");
}

export async function deleteService(formData: FormData) {
  const serviceName = formData.get("name") as string;
  const query = { name: serviceName };

  await services.deleteOne(query);
  revalidatePath("/services");
}
