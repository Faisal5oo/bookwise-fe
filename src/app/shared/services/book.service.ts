import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Book, BookSearchParams, PostBookModel, UpdateBookModel, BookApiResponse } from '../models/book.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all books with pagination - matches backend /books/
  getBooks(skip = 0, limit = 100): Observable<BookApiResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<BookApiResponse>(`${this.apiUrl}/books/`, { params });
  }

  // Get books by user ID - matches backend /users/{user_id}/books
  getBooksByUser(userId: string, skip = 0, limit = 100): Observable<BookApiResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<BookApiResponse>(`${this.apiUrl}/users/${userId}/books`, { params });
  }

  // Get single book details - matches backend /books/{book_id}
  getBook(bookId: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${bookId}`);
  }

  // Add new book - matches backend /books/
  addBook(book: PostBookModel): Observable<any> {
    console.log('Adding book to backend:', book);
    return this.http.post<any>(`${this.apiUrl}/books/`, book);
  }

  // Update book - matches backend /updateBook/{book_id}
  updateBook(bookId: string, book: UpdateBookModel): Observable<any> {
    console.log('Updating book in backend:', bookId, book);
    return this.http.put<any>(`${this.apiUrl}/updateBook/${bookId}`, book);
  }

  // Delete book - matches backend DELETE /books/{book_id}
  deleteBook(bookId: string): Observable<any> {
    console.log('Deleting book from backend:', bookId);
    return this.http.delete<any>(`${this.apiUrl}/books/${bookId}`);
  }

  // Get featured books - matches backend /getBooks
  getFeaturedBooks(): Observable<BookApiResponse> {
    return this.http.get<BookApiResponse>(`${this.apiUrl}/getBooks`);
  }

  // Get trending books - matches backend /books/trending
  getTrendingBooks(skip = 0, limit = 10): Observable<Book[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<Book[]>(`${this.apiUrl}/books/trending`, { params });
  }

  // Track book interaction - matches backend /books/{book_id}/interaction
  trackInteraction(bookId: string, interactionType: string, userId?: string): Observable<{message: string}> {
    const interaction = {
      interaction_type: interactionType,
      user_id: userId
    };
    
    return this.http.post<{message: string}>(`${this.apiUrl}/books/${bookId}/interaction`, interaction);
  }

  // Search books with filters (keeping for compatibility)
  searchBooks(params: BookSearchParams): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books/search`, { params: { ...params } as any });
  }

  // Get recent books (keeping for compatibility)
  getRecentBooks(limit = 10): Observable<Book[]> {
    return this.getBooks(0, limit).pipe(
      map(response => response.books || [])
    );
  }

  // Toggle book availability
  toggleAvailability(bookId: string): Observable<BookApiResponse> {
    return this.updateBook(bookId, { is_taken: true });
  }

  // Reserve book
  reserveBook(bookId: string): Observable<BookApiResponse> {
    return this.updateBook(bookId, { is_taken: true });
  }

  // Update book status
  updateBookStatus(bookId: string, isTaken: boolean): Observable<BookApiResponse> {
    return this.updateBook(bookId, { is_taken: isTaken });
  }
} 