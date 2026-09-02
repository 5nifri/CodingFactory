import { Formation } from './formation.model';

export type SortMode = 'RECENT' | 'POPULAR' | 'RECOMMENDED';

export interface FormationPageResponse {
  formations: Formation[];
  page: number;          // current page, 0-indexed
  size: number;           // page size
  totalElements: number;
  totalPages: number;
}

export interface FormationSearchParams {
  q?: string;
  categoryId?: number | null;
  sort?: SortMode;
  page?: number;
  size?: number;
}
