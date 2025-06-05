export type NotificationType = 
  | 'exchange_request' 
  | 'exchange_response' 
  | 'exchange_completed' 
  | 'book_available' 
  | 'system_update' 
  | 'new_recommendation';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  exchange_notifications: boolean;
  recommendation_notifications: boolean;
  system_notifications: boolean;
  email_notifications: boolean;
} 