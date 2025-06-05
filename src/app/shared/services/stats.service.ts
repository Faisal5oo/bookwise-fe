import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReadingStats, BookInteraction, UserActivity } from '../models/stats.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Get user reading statistics
  getReadingStats(userId: string): Observable<ReadingStats> {
    return this.http.get<ReadingStats>(`${this.apiUrl}/${userId}/stats`);
  }

  // Update reading stats
  updateReadingStats(userId: string, stats: Partial<ReadingStats>): Observable<ReadingStats> {
    return this.http.post<ReadingStats>(`${this.apiUrl}/${userId}/stats/update`, stats);
  }

  // Get reading habits and insights
  getReadingHabits(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/reading-habits`);
  }

  // Track book interaction
  trackBookInteraction(interaction: BookInteraction): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/books/${interaction.book_id}/interaction`, interaction);
  }

  // Get user activity feed
  getUserActivity(userId: string, skip = 0, limit = 20): Observable<UserActivity[]> {
    return this.http.get<UserActivity[]>(`${this.apiUrl}/${userId}/activity?skip=${skip}&limit=${limit}`);
  }

  // Get reading recommendations based on stats
  getRecommendations(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/ai-recommendations`);
  }

  // Get genre distribution
  getGenreDistribution(userId: string): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/${userId}/stats/genres`);
  }

  // Get reading progress over time
  getReadingProgress(userId: string, timeframe: 'week' | 'month' | 'year'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/stats/progress?timeframe=${timeframe}`);
  }
} 