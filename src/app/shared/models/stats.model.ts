export interface ReadingStats {
  user_id: string;
  books_read: number;
  pages_read: number;
  authors_explored: number;
  top_genres: string[];
  reading_habits: Record<string, any>;
  updated_at: string;
}

export interface BookInteraction {
  user_id: string;
  book_id: string;
  interaction_type: 'view' | 'favorite' | 'exchange_request' | 'share';
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface UserActivity {
  user_id: string;
  activity_type: string;
  description: string;
  timestamp: string;
} 