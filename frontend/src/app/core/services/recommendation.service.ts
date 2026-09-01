import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecommendationResponse } from '../models/recommendation.model';

@Injectable({ providedIn: 'root' })
export class RecommendationService {

  private readonly apiUrl = 'http://localhost:8080/api/recommendations';

  constructor(private http: HttpClient) {}

  getMyRecommendations(): Observable<RecommendationResponse> {
    return this.http.get<RecommendationResponse>(`${this.apiUrl}/me`);
  }
}
