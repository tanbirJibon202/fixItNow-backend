export interface IUpsertTechnicianProfilePayload {
  bio?: string;
  experienceYears?: number;
  skills?: string[];
  location?: string;
}

export interface IAvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ITechnicianQuery {
  searchTerm?: string;
  location?: string;
  categoryId?: string;
  minRating?: string;
  page?: string;
  limit?: string;
}
