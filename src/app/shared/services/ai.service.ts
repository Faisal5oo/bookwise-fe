import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AIRecommendation {
  user_id: string;
  book_id: string;
  match_percentage: number; // 0-100
  reason: string; // AI-generated explanation
  created_at: string;
}

export interface BookMatch {
  book_id: string;
  book_name: string;
  author: string;
  description: string;
  match_percentage: number;
  reason: string;
  genre?: string;
  condition?: string;
  image_url?: string;
}

export interface ChatMessage {
  type: "user" | "ai";
  message: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  recommendations?: AIRecommendation[];
  timestamp: string;
}

export interface GenerateRecommendationsResponse {
  message: string;
  recommendations_count: number;
}

export interface AIInsights {
  user_id: string;
  insights: string; // AI-generated reading insights
  generated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // New chat endpoint for AI recommendations
  sendChatMessage(userId: string, chatRequest: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/ai/chat/${userId}`, chatRequest);
  }

  // New book matches endpoint
  getBookMatches(userId: string): Observable<BookMatch[]> {
    return this.http.get<BookMatch[]>(`${this.apiUrl}/ai/book-matches/${userId}`);
  }

  // Generate new AI recommendations for a user
  generateRecommendations(userId: string): Observable<GenerateRecommendationsResponse> {
    return this.http.post<GenerateRecommendationsResponse>(`${this.apiUrl}/ai/generate-recommendations/${userId}`, {});
  }

  // Get AI recommendations for a user
  getAIRecommendations(userId: string, skip = 0, limit = 10): Observable<AIRecommendation[]> {
    return this.http.get<AIRecommendation[]>(`${this.apiUrl}/users/${userId}/ai-recommendations?skip=${skip}&limit=${limit}`);
  }

  // Get AI insights for a user
  getAIInsights(userId: string): Observable<AIInsights> {
    return this.http.get<AIInsights>(`${this.apiUrl}/users/${userId}/ai-insights`);
  }

  // Get book recommendations for chatbot (with conversation context)
  getChatbotRecommendations(userId: string, message: string, conversationHistory?: any[]): Observable<AIRecommendation[]> {
    return this.http.post<AIRecommendation[]>(`${this.apiUrl}/ai/chatbot-recommendations/${userId}`, {
      message,
      conversation_history: conversationHistory || []
    });
  }

  // Get AI response for chatbot
  getChatbotResponse(userId: string, message: string, conversationHistory?: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ai/chatbot-response/${userId}`, {
      message,
      conversation_history: conversationHistory || []
    });
  }
} 