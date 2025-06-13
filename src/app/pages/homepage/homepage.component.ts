import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { Book } from '../../shared/models/book.model';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../home/home.component.html',
  styleUrls: ['../home/home.component.scss']
})
export class HomepageComponent implements OnInit {
  allBooks: Book[] = [];
  featuredBooks: Book[] = [];
  recentBooks: Book[] = [];
  loading = false;

  constructor(
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit() {
    this.loadHomeData();
  }

  async loadHomeData() {
    this.loading = true;
    try {
      // Load all books
      this.bookService.getBooks(0, 50).subscribe({
        next: (response) => {
          this.allBooks = response.books || [];
          this.featuredBooks = this.allBooks.slice(0, 8); // Show first 8 as featured
          this.recentBooks = this.allBooks.slice(0, 6); // Show first 6 as recent
        },
        error: (error) => {
          console.error('Error loading books:', error);
          this.allBooks = [];
          this.featuredBooks = [];
          this.recentBooks = [];
        }
      });

    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      this.loading = false;
    }
  }

  onBookClick(book: Book) {
    const bookId = book._id || book.book_id;
    if (bookId) {
      this.router.navigate(['/book-detail', bookId]);
    }
  }

  navigateToBookDetail(bookId: string) {
    if (bookId) {
      this.router.navigate(['/book-detail', bookId]);
    }
  }

  trackByBookId(index: number, book: Book): string {
    return book._id || book.book_id || index.toString();
  }

  navigateToBrowse() {
    this.router.navigate(['/browse']);
  }

  navigateToAIPicks() {
    this.router.navigate(['/ai-picks']);
  }

  getConditionClass(condition: string): string {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'very good':
        return 'bg-blue-100 text-blue-800';
      case 'good':
        return 'bg-yellow-100 text-yellow-800';
      case 'fair':
      case 'acceptable':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
} 