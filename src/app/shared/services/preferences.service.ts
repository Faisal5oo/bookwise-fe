import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserPreferences {
  user_id: string;
  favorite_genres: string[];
  favorite_authors: string[];
  reading_preferences: Record<string, any>;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  book_id: string;
  match_percentage: number;
  reason: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Get user preferences
  getUserPreferences(userId: string): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${this.apiUrl}/${userId}/preferences`);
  }

  // Set user preferences
  setUserPreferences(userId: string, preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http.post<UserPreferences>(`${this.apiUrl}/${userId}/preferences`, preferences);
  }

  // Get AI recommendations
  getAIRecommendations(userId: string, skip = 0, limit = 10): Observable<AIRecommendation[]> {
    return this.http.get<AIRecommendation[]>(`${this.apiUrl}/${userId}/ai-recommendations?skip=${skip}&limit=${limit}`);
  }

  // Generate new AI recommendations
  generateRecommendations(userId: string): Observable<AIRecommendation[]> {
    return this.http.post<AIRecommendation[]>(`${environment.apiUrl}/ai/generate-recommendations/${userId}`, {});
  }
} 