import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ExchangeRequest, 
  ExchangeResponse, 
  ExchangeDetails, 
  ExchangeStatus,
  ExchangeApiResponse 
} from '../models/exchange.model';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  /**
   * Request an exchange for a book
   */
  requestExchange(exchangeRequest: ExchangeRequest): Observable<ExchangeDetails> {
    return this.http.post<ExchangeDetails>(`${this.apiUrl}/exchanges/request`, exchangeRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get all exchanges for a user (both sent and received)
   */
  getUserExchanges(
    userId: string, 
    status?: ExchangeStatus, 
    skip: number = 0, 
    limit: number = 10
  ): Observable<ExchangeDetails[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ExchangeDetails[]>(`${this.apiUrl}/exchanges/user/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Respond to an exchange request (accept/decline)
   */
  respondToExchange(exchangeId: string, response: ExchangeResponse): Observable<ExchangeDetails> {
    return this.http.put<ExchangeDetails>(`${this.apiUrl}/exchanges/${exchangeId}/respond`, response)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get exchanges where user is the requester
   */
  getSentExchanges(userId: string, status?: ExchangeStatus): Observable<ExchangeDetails[]> {
    return this.getUserExchanges(userId, status).pipe(
      map(exchanges => exchanges.filter(exchange => exchange.requester_id === userId))
    );
  }

  /**
   * Get exchanges where user is the owner
   */
  getReceivedExchanges(userId: string, status?: ExchangeStatus): Observable<ExchangeDetails[]> {
    return this.getUserExchanges(userId, status).pipe(
      map(exchanges => exchanges.filter(exchange => exchange.owner_id === userId))
    );
  }

  /**
   * Get pending exchanges that need user's response
   */
  getPendingExchanges(userId: string): Observable<ExchangeDetails[]> {
    return this.getReceivedExchanges(userId, ExchangeStatus.PENDING);
  }

  /**
   * Accept an exchange request
   */
  acceptExchange(exchangeId: string, message?: string): Observable<ExchangeDetails> {
    const response: ExchangeResponse = {
      exchange_id: exchangeId,
      response_type: ExchangeStatus.ACCEPTED,
      message: message || 'Exchange request accepted!',
      created_at: new Date().toISOString()
    };
    
    return this.respondToExchange(exchangeId, response);
  }

  /**
   * Decline an exchange request
   */
  declineExchange(exchangeId: string, message?: string): Observable<ExchangeDetails> {
    const response: ExchangeResponse = {
      exchange_id: exchangeId,
      response_type: ExchangeStatus.DECLINED,
      message: message || 'Exchange request declined.',
      created_at: new Date().toISOString()
    };
    
    return this.respondToExchange(exchangeId, response);
  }

  /**
   * Mark exchange as completed
   */
  completeExchange(exchangeId: string, message?: string): Observable<ExchangeDetails> {
    const response: ExchangeResponse = {
      exchange_id: exchangeId,
      response_type: ExchangeStatus.COMPLETED,
      message: message || 'Exchange completed successfully!',
      created_at: new Date().toISOString()
    };
    
    return this.respondToExchange(exchangeId, response);
  }

  /**
   * Cancel an exchange request
   */
  cancelExchange(exchangeId: string, message?: string): Observable<ExchangeDetails> {
    const response: ExchangeResponse = {
      exchange_id: exchangeId,
      response_type: ExchangeStatus.CANCELLED,
      message: message || 'Exchange request cancelled.',
      created_at: new Date().toISOString()
    };
    
    return this.respondToExchange(exchangeId, response);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.detail) {
        if (Array.isArray(error.error.detail)) {
          errorMessage = error.error.detail.map((detail: any) => 
            typeof detail === 'string' ? detail : detail.msg || JSON.stringify(detail)
          ).join(', ');
        } else {
          errorMessage = error.error.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.statusText}`;
      }
    }
    
    console.error('Exchange Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 