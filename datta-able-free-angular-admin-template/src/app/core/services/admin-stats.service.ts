import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatsResponse {
  totalUsers: number;
  totalFormations: number;
  totalCourses: number;
  totalCategories: number;
  totalConsultingOffers: number;
  totalConsultingRequests: number;
  formationsByCategory: { [key: string]: number };
  requestsByStatus: { [key: string]: number };
  recentUsers: RecentUser[];
  recentRequests: RecentRequest[];
}

export interface RecentUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  enabled: boolean;
}

export interface RecentRequest {
  id: number;
  userFullName: string;
  consultingTitle: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private readonly apiUrl = 'http://localhost:8080/api/admin/stats';

  constructor(private http: HttpClient) {}

  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(this.apiUrl);
  }
}
