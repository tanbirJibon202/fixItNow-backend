import { Role } from "../../../generated/prisma/enums.js";

export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IUpdateProfilePayload {
  name?: string;
  phone?: string;
}
