import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification, NotificationPreferences } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  // Get user notifications
  getUserNotifications(userId: string, unreadOnly = false, skip = 0, limit = 20): Observable<Notification[]> {
    let url = `${this.apiUrl}/users/${userId}?skip=${skip}&limit=${limit}`;
    if (unreadOnly) {
      url += '&unread_only=true';
    }
    return this.http.get<Notification[]>(url);
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }

  // Get notification preferences
  getNotificationPreferences(userId: string): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.apiUrl}/preferences/${userId}`);
  }

  // Update notification preferences
  updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.apiUrl}/preferences/${userId}`, preferences);
  }

  // Get unread notification count
  getUnreadCount(userId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/users/${userId}/unread-count`);
  }
} 