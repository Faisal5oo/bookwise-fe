import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, BookSearchParams } from '../models/book.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) {}

  // Get all books with pagination
  getBooks(skip = 0, limit = 10): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}?skip=${skip}&limit=${limit}`);
  }

  // Get a single book by ID
  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  // Search books with filters
  searchBooks(params: BookSearchParams): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/search`, { params: { ...params } as any });
  }

  // Get trending books
  getTrendingBooks(limit = 10): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/trending?limit=${limit}`);
  }

  // Get featured books
  getFeaturedBooks(limit = 10): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/featured?limit=${limit}`);
  }

  // Get recent books
  getRecentBooks(limit = 10): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }

  // Get books by user
  getBooksByUser(userId: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/by-user/${userId}`);
  }

  // Add new book
  addBook(book: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book);
  }

  // Update book
  updateBook(id: string, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, book);
  }

  // Delete book
  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Toggle book availability
  toggleAvailability(id: string): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}/availability`, {});
  }

  // Reserve book
  reserveBook(id: string): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/${id}/reserve`, {});
  }

  // Update book status
  updateBookStatus(id: string, status: string): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Track book interaction
  trackInteraction(id: string, interactionType: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/interaction`, { interaction_type: interactionType });
  }
} 