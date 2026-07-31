import { prisma } from "@/lib/db/prisma";

export async function getCategories(options?: { includeInactive?: boolean }) {
  return prisma.primaryCategory.findMany({
    where: options?.includeInactive ? undefined : { isActive: true },
    include: {
      secondaryCategories: {
        where: options?.includeInactive ? undefined : { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ subject: "desc" }, { sortOrder: "asc" }],
  });
}
