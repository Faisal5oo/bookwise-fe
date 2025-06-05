import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exchange, ExchangeRequest, ExchangeResponse } from '../models/exchange.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {
  private apiUrl = `${environment.apiUrl}/exchanges`;

  constructor(private http: HttpClient) {}

  // Request a book exchange
  requestExchange(request: ExchangeRequest): Observable<Exchange> {
    return this.http.post<Exchange>(`${this.apiUrl}/request`, request);
  }

  // Get user's exchanges
  getUserExchanges(userId: string, status?: string, skip = 0, limit = 10): Observable<Exchange[]> {
    let url = `${this.apiUrl}/user/${userId}?skip=${skip}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<Exchange[]>(url);
  }

  // Get exchange details
  getExchange(id: string): Observable<Exchange> {
    return this.http.get<Exchange>(`${this.apiUrl}/${id}`);
  }

  // Respond to exchange request
  respondToExchange(exchangeId: string, response: ExchangeResponse): Observable<Exchange> {
    return this.http.put<Exchange>(`${this.apiUrl}/${exchangeId}/respond`, response);
  }

  // Complete exchange
  completeExchange(exchangeId: string): Observable<Exchange> {
    return this.http.post<Exchange>(`${this.apiUrl}/${exchangeId}/complete`, {});
  }

  // Get exchange statistics
  getExchangeStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  // Rate exchange partner
  rateExchange(exchangeId: string, rating: number, comment?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${exchangeId}/rating`, { rating, comment });
  }

  // Get user's exchange history
  getUserExchangeHistory(userId: string): Observable<Exchange[]> {
    return this.http.get<Exchange[]>(`${this.apiUrl}/user/${userId}/exchange-history`);
  }

  // Report exchange dispute
  reportDispute(exchangeId: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${exchangeId}/dispute`, { reason });
  }
} 