import { ActiveStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    omit: { password: true },
    include: { technicianProfile: true },
  });
};

const updateUserStatus = async (userId: string, activeStatus: ActiveStatus) => {
  return prisma.user.update({
    where: { id: userId },
    data: { activeStatus },
    omit: { password: true },
  });
};

const getAllBookings = async () => {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      technician: { include: { user: { select: { id: true, name: true } } } },
      service: true,
      payment: true,
    },
  });
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
};
