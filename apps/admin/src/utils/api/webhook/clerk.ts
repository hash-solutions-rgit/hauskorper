import { UserJSON } from "@clerk/nextjs/server";
import { prisma } from "@vapestation/database";

export async function createCustomer(data: UserJSON) {
  await prisma.customer.create({
    data: {
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address ?? "",
      name: (data.first_name ?? "" + " " + data.last_name ?? "").trim(),
      phone: data.private_metadata.phone
        ? `${data.private_metadata.phone}`
        : "",
      isGuest:
        !!data.public_metadata.type && data.public_metadata.type === "Guest",
    },
  });
}

export async function createUser(data: UserJSON) {
  await prisma.user.create({
    data: {
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address ?? "",
      name: data.first_name + " " + data.last_name,
      role: "USER",
    },
  });
}
