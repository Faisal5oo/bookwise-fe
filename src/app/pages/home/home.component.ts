import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { StatsService } from '../../shared/services/stats.service';
import { AuthService } from '../../shared/services/auth.service';
import { Book } from '../../shared/models/book.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredBooks: Book[] = [];
  recentBooks: Book[] = [];
  trendingBooks: Book[] = [];
  aiRecommendations: any[] = [];
  loading = false;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private bookService: BookService,
    private statsService: StatsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit() {
    this.loadHomeData();
  }

  async loadHomeData() {
    this.loading = true;
    try {
      // Load featured books
      this.bookService.getFeaturedBooks(4).subscribe({
        next: (books) => {
          this.featuredBooks = books;
        },
        error: (error) => {
          console.error('Error loading featured books:', error);
          // Set mock data for demo
          this.setMockFeaturedBooks();
        }
      });

      // Load recent books
      this.bookService.getRecentBooks(6).subscribe({
        next: (books) => {
          this.recentBooks = books;
        },
        error: (error) => {
          console.error('Error loading recent books:', error);
        }
      });

      // Load trending books for AI recommendations section
      this.bookService.getTrendingBooks(2).subscribe({
        next: (books) => {
          this.trendingBooks = books;
        },
        error: (error) => {
          console.error('Error loading trending books:', error);
          this.setMockRecommendations();
        }
      });

    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      this.loading = false;
    }
  }

  setMockFeaturedBooks() {
    this.featuredBooks = [
      {
        id: '1',
        bookName: 'The Great Gatsby',
        description: 'A classic American novel',
        bookImages: [],
        owner_id: 'user1',
        genre: 'Classic',
        author: 'F. Scott Fitzgerald',
        condition: 'Very Good',
        is_taken: false,
        created_at: new Date().toISOString(),
        view_count: 120
      },
      {
        id: '2',
        bookName: 'To Kill a Mockingbird',
        description: 'A gripping tale of racial injustice',
        bookImages: [],
        owner_id: 'user2',
        genre: 'Classic',
        author: 'Harper Lee',
        condition: 'Good',
        is_taken: false,
        created_at: new Date().toISOString(),
        view_count: 95
      },
      {
        id: '3',
        bookName: 'The Hobbit',
        description: 'An unexpected journey',
        bookImages: [],
        owner_id: 'user3',
        genre: 'Fantasy',
        author: 'J.R.R. Tolkien',
        condition: 'Good',
        is_taken: false,
        created_at: new Date().toISOString(),
        view_count: 150
      },
      {
        id: '4',
        bookName: 'Pride and Prejudice',
        description: 'A romantic classic',
        bookImages: [],
        owner_id: 'user4',
        genre: 'Romance',
        author: 'Jane Austen',
        condition: 'Acceptable',
        is_taken: false,
        created_at: new Date().toISOString(),
        view_count: 80
      }
    ];
  }

  setMockRecommendations() {
    this.aiRecommendations = [
      {
        id: '5',
        bookName: 'Pride and Prejudice',
        author: 'Jane Austen',
        match_percentage: 92,
        reason: 'Based on your interest in classic literature and previous exchanges of works by F. Scott Fitzgerald, this Jane Austen novel appears to align with your reading preferences.'
      },
      {
        id: '6',
        bookName: 'Dune',
        author: 'Frank Herbert',
        match_percentage: 85,
        reason: 'Your collection includes fantasy titles like The Hobbit, suggesting you might enjoy this acclaimed science fiction novel with similar world-building elements.'
      }
    ];
  }

  navigateToBrowse() {
    this.router.navigate(['/browse']);
  }

  navigateToAIPicks() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/ai-picks']);
    } else {
      this.router.navigate(['/auth']);
    }
  }

  navigateToAuth() {
    this.router.navigate(['/auth']);
  }

  navigateToBookDetail(bookId: string) {
    this.router.navigate(['/book-detail', bookId]);
  }

  trackBookView(book: Book) {
    // Only track if user is logged in
    if (this.authService.isAuthenticated()) {
      this.bookService.trackInteraction(book.id, 'view').subscribe({
        next: () => {
          // Track interaction successfully
        },
        error: (error) => {
          console.error('Error tracking book view:', error);
        }
      });
    }
  }

  onBookClick(book: Book) {
    this.trackBookView(book);
    this.navigateToBookDetail(book.id);
  }

  getConditionClass(condition: string): string {
    switch (condition.toLowerCase()) {
      case 'very good':
        return 'bg-blue-100 text-blue-800';
      case 'good':
        return 'bg-yellow-100 text-yellow-800';
      case 'acceptable':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  trackByBookId(index: number, book: Book): string {
    return book.id;
  }
}