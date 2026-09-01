export interface Consulting {
  id: number;
  title: string;
  description: string;
  category?: string;
  image?: string;
  icon?: string;
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
