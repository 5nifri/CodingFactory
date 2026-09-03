export interface FormationResponse {
  id: number;
  title: string;
  description: string;
  duration: string;
  price: number;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  categoryName: string;
  totalCourses: number;
}

export interface FormationRequest {
  title: string;
  description: string;
  duration: string;
  price: number;
  imageUrl: string | null;
  published: boolean;
  categoryId: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}
