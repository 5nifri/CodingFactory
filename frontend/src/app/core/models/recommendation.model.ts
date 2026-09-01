export interface RecommendedFormation {
  formationId: number;
  title: string;
  imageUrl: string | null;
  categoryName: string;
  matchScore: number; // 0..1, e.g. 0.7288
}

export interface RecommendationResponse {
  available: boolean;
  formations: RecommendedFormation[];
}
