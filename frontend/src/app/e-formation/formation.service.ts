import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formation, Course, Category } from './formation.model';
import { FormationPageResponse, FormationSearchParams } from './formation-search.model';

@Injectable({ providedIn: 'root' })
export class FormationService {

  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getPublishedFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/formations`);
  }

  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/formations/${id}`);
  }

  getCoursesByFormation(formationId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/formations/${formationId}/courses`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Catalogue search: free text + optional category filter + sort mode,
   * paginated (9 per page by default). Backed by GET /api/formations/search.
   * `sort: 'RECOMMENDED'` is only meaningful for a logged-in student —
   * the backend silently falls back to RECENT for guests.
   */
  searchFormations(params: FormationSearchParams): Observable<FormationPageResponse> {
    let httpParams = new HttpParams()
      .set('sort', params.sort ?? 'RECENT')
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 9));

    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (params.categoryId != null) {
      httpParams = httpParams.set('categoryId', String(params.categoryId));
    }

    return this.http.get<FormationPageResponse>(`${this.apiUrl}/formations/search`, { params: httpParams });
  }
}
