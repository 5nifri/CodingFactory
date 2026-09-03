export interface CourseResponse {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  videoUrl: string | null;
  materialUrl: string | null;
  duration: string;
}

export interface CourseRequest {
  title: string;
  description: string;
  orderIndex: number;
  videoUrl: string | null;
  materialUrl: string | null;
  duration: string;
}
