export interface ICreateServicePayload {
  title: string;
  description: string;
  price: number;
  durationMins?: number;
  categoryId: string;
}

export interface IUpdateServicePayload {
  title?: string;
  description?: string;
  price?: number;
  durationMins?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface IServiceQuery {
  searchTerm?: string;
  categoryId?: string;
  technicianId?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}
