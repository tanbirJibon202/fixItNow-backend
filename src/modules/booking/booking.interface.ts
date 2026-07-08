export interface ICreateBookingPayload {
  serviceId: string;
  scheduledAt: string;
  address?: string;
  notes?: string;
}
