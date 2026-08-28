import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants';
import {
  ConsultingOffer,
  ConsultingOfferPayload,
  ConsultationRequest,
  ConsultationRequestCreate,
  RequestStatus
} from '../models/consulting.model';

@Injectable({ providedIn: 'root' })
export class ConsultingService {

  private readonly offersUrl = `${API_BASE_URL}/consulting`;
  private readonly requestsUrl = `${API_BASE_URL}/consulting-requests`;

  constructor(private http: HttpClient) {}

  getOffers(): Observable<ConsultingOffer[]> {
    return this.http.get<ConsultingOffer[]>(this.offersUrl);
  }

  getOffer(id: number): Observable<ConsultingOffer> {
    return this.http.get<ConsultingOffer>(`${this.offersUrl}/${id}`);
  }

  createOffer(payload: ConsultingOfferPayload): Observable<ConsultingOffer> {
    return this.http.post<ConsultingOffer>(this.offersUrl, payload);
  }

  updateOffer(id: number, payload: ConsultingOfferPayload): Observable<ConsultingOffer> {
    return this.http.put<ConsultingOffer>(`${this.offersUrl}/${id}`, payload);
  }

  deleteOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.offersUrl}/${id}`);
  }

  createRequest(payload: ConsultationRequestCreate): Observable<ConsultationRequest> {
    return this.http.post<ConsultationRequest>(this.requestsUrl, payload);
  }

  getMyRequests(): Observable<ConsultationRequest[]> {
    return this.http.get<ConsultationRequest[]>(`${this.requestsUrl}/my`);
  }

  getAllRequests(): Observable<ConsultationRequest[]> {
    return this.http.get<ConsultationRequest[]>(this.requestsUrl);
  }

  updateRequestStatus(id: number, status: RequestStatus): Observable<ConsultationRequest> {
    return this.http.put<ConsultationRequest>(`${this.requestsUrl}/${id}/status`, { status });
  }
}
