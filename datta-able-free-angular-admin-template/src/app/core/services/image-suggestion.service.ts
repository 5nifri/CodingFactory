import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImageSuggestion {
  url: string;
  thumbnailUrl: string;
  photographer: string;
  photographerUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ImageSuggestionService {
  private readonly apiUrl = 'http://localhost:8080/api/consulting/image-suggestions';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<ImageSuggestion[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ImageSuggestion[]>(this.apiUrl, { params });
  }
}
