import httpStatus from "http-status";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";

const createCategory = async (payload: { name: string; description?: string }) => {
  const existing = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category with this name already exists");
  }

  return prisma.category.create({ data: payload });
};

const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

export const categoryService = {
  createCategory,
  getAllCategories,
};
