export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface ConsultingOffer {
  id: number;
  title: string;
  description: string;
  category?: string;
}

export interface ConsultingOfferPayload {
  title: string;
  description: string;
  category?: string;
}

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

export interface ConsultationRequestCreate {
  consultingId: number;
  message: string;
}
