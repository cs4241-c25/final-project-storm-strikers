"use server";

import { BuildingType, Service, services } from "@/db";
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

export async function editService(formData: FormData) {
  const serviceId = formData.get("name") as string;
  if (!serviceId) {
    throw new Error("Service Name is required for editing.");
  }

  const existingService = await services.findOne({ name: serviceId });
  if (!existingService) {
    throw new Error("Service not found.");
  }

  const updatedService: Partial<Service> = {};

  // Only update fields that have a value
  if (formData.get("name"))
    updatedService.name = formData.get("name") as string;
  if (formData.get("specialities")) {
    updatedService.specialities = (
      formData.get("specialities") as string
    ).split(",");
  }
  if (formData.get("floor"))
    updatedService.floor = (formData.get("floor") as string).split(",");
  if (formData.get("suite"))
    updatedService.suite = (formData.get("suite") as string).split(",");
  if (formData.get("phone"))
    updatedService.phone = formData.get("phone") as string;
  if (formData.get("hours"))
    updatedService.hours = formData.get("hours") as string;
  if (formData.get("building")) {
    updatedService.building = formData.get("building") as BuildingType;
  }

  await services.updateOne({ name: serviceId }, { $set: updatedService });

  revalidatePath("/services");
}

export async function deleteService(formData: FormData) {
  const serviceId = formData.get("name") as string;

  if (!serviceId) {
    throw new Error("Service ID is required for deletion.");
  }

  const query = { name: serviceId };

  await services.deleteOne(query);
  revalidatePath("/services");
}
