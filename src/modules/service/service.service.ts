import httpStatus from "http-status";
import { ServiceWhereInput } from "../../../generated/prisma/models";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import {
  ICreateServicePayload,
  IServiceQuery,
  IUpdateServicePayload,
} from "./service.interface";

const getTechnicianProfileOrThrow = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please create your technician profile before adding services",
    );
  }

  return profile;
};

const createService = async (userId: string, payload: ICreateServicePayload) => {
  const profile = await getTechnicianProfileOrThrow(userId);

  return prisma.service.create({
    data: {
      ...payload,
      technicianId: profile.id,
    },
  });
};

const getAllServices = async (query: IServiceQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const andConditions: ServiceWhereInput[] = [{ isActive: true }];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.categoryId) {
    andConditions.push({ categoryId: query.categoryId });
  }

  if (query.technicianId) {
    andConditions.push({ technicianId: query.technicianId });
  }

  if (query.location) {
    andConditions.push({
      technician: { location: { contains: query.location, mode: "insensitive" } },
    });
  }

  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      price: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      },
    });
  }

  const where: ServiceWhereInput = { AND: andConditions };

  const services = await prisma.service.findMany({
    where,
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
    include: {
      category: true,
      technician: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  const total = await prisma.service.count({ where });

  return {
    data: services,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

const getServiceById = async (id: string) => {
  return prisma.service.findUniqueOrThrow({
    where: { id },
    include: {
      category: true,
      technician: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });
};

const updateService = async (
  serviceId: string,
  userId: string,
  payload: IUpdateServicePayload,
) => {
  const profile = await getTechnicianProfileOrThrow(userId);

  const service = await prisma.service.findUniqueOrThrow({
    where: { id: serviceId },
  });

  if (service.technicianId !== profile.id) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not the owner of this service");
  }

  return prisma.service.update({
    where: { id: serviceId },
    data: payload,
  });
};

const deleteService = async (serviceId: string, userId: string) => {
  const profile = await getTechnicianProfileOrThrow(userId);

  const service = await prisma.service.findUniqueOrThrow({
    where: { id: serviceId },
  });

  if (service.technicianId !== profile.id) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not the owner of this service");
  }

  await prisma.service.delete({ where: { id: serviceId } });
};

export const serviceService = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};
