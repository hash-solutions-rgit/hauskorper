import { clerkClient } from "@clerk/nextjs/server";
import { PrismaClient } from "@vapestation/database";

// get customers with clerk
export const getAllCustomers = async (
  prisma: PrismaClient,
  take: number,
  skip: number,
) => {
  // get customers
  const customers = await prisma.customer.findMany({
    take: take + 1,
    skip,
    orderBy: {
      createdAt: "desc",
    },
  });

  //  check if customers is empty then return empty array
  if (customers.length === 0) {
    return [];
  }

  //   modify customers with clerk
  const clerkCustomersData = await clerkClient.users.getUserList({
    userId: customers.map((customer) => customer.clerkId),
  });

  const clerkCustomers = clerkCustomersData.data.map((clerkCustomer) => {
    const customer = customers.find(
      (customer) => customer.clerkId === clerkCustomer.id,
    );
    return {
      id: clerkCustomer.id,
      email: customer?.email ?? "",
      first_name: clerkCustomer.firstName ?? "",
      last_name: clerkCustomer.lastName ?? "",
      full_name: clerkCustomer.fullName ?? "",
      image_url: clerkCustomer.imageUrl,
      username: clerkCustomer.username ?? "",
      created_at: customer?.createdAt ?? new Date(),
      updated_at: customer?.updatedAt ?? new Date(),
    };
  });

  return clerkCustomers;
};
