export interface ConsultingOffer {
  id: number;
  title: string;
  description: string;
  category: string;
}

export interface ConsultationRequest {
  id: number;
  consultingId: number;
  consultingTitle: string;
  userEmail: string;
  userFullName: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}
