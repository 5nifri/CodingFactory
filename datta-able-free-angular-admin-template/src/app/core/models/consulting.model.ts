export interface Consulting {
  id: number;
  title: string;
  description: string;
  category?: string;
  image?: string;
  icon?: string;
}

// Alias kept for compatibility with existing imports across the app
// (admin-consulting-offer.service.ts, consulting-offer-list.component.ts, etc.)
export type ConsultingOffer = Consulting;

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface ConsultationRequest {
  id: number;
  consultingId: number;
  consultingTitle: string;
  userEmail: string;
  userFullName: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}
