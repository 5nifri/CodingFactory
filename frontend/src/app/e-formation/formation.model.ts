export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Formation {
  id: number;
  title: string;
  description: string;
  duration: string;
  price: number;
  imageUrl: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  categoryName: string;
  totalCourses: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  videoUrl: string;
  materialUrl: string;
  duration: string;
}

export interface Enrollment {
  id: number;
  formationId: number;
  formationTitle: string;
  enrolledAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progress: number;
}
