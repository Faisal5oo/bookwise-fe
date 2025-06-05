import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExchangeService } from '../../shared/services/exchange.service';
import { Book } from '../../shared/models/book.model';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit {
  book: Book | null = null;
  loading = true;
  currentImageIndex = 0;
  isAuthenticated = false;
  currentUserId = '';
  exchangeLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private authService: AuthService,
    private exchangeService: ExchangeService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUserId = this.authService.getUserId() || '';
    
    this.route.params.subscribe(params => {
      const bookId = params['id'];
      if (bookId) {
        this.loadBookDetails(bookId);
      }
    });
  }

  loadBookDetails(bookId: string) {
    this.loading = true;
    this.bookService.getBook(bookId).subscribe({
      next: (book) => {
        this.book = book;
        this.bookService.trackInteraction(bookId, 'view').subscribe();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading book details:', error);
        this.loading = false;
        this.router.navigate(['/browse']);
      }
    });
  }

  nextImage() {
    if (this.book && this.book.bookImages && this.book.bookImages.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.book.bookImages.length;
    }
  }

  previousImage() {
    if (this.book && this.book.bookImages && this.book.bookImages.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.book.bookImages.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  requestExchange() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth']);
      return;
    }

    if (!this.book) return;

    this.exchangeLoading = true;
    
    const exchangeRequest = {
      book_id: this.book.id,
      owner_id: this.book.owner_id,
      message: `I would like to exchange this book: ${this.book.bookName}`
    };

    this.exchangeService.requestExchange(exchangeRequest).subscribe({
      next: (response) => {
        console.log('Exchange requested successfully:', response);
        alert('Exchange request sent successfully!');
        this.exchangeLoading = false;
      },
      error: (error) => {
        console.error('Error requesting exchange:', error);
        alert('Error sending exchange request. Please try again.');
        this.exchangeLoading = false;
      }
    });
  }

  addToWishlist() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth']);
      return;
    }

    if (!this.book) return;

    this.bookService.trackInteraction(this.book.id, 'wishlist').subscribe({
      next: () => {
        alert('Added to wishlist!');
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
        alert('Error adding to wishlist. Please try again.');
      }
    });
  }

  goBack() {
    window.history.back();
  }

  getConditionColor(condition: string): string {
    switch (condition.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'very good':
        return 'bg-blue-100 text-blue-800';
      case 'good':
        return 'bg-yellow-100 text-yellow-800';
      case 'fair':
        return 'bg-orange-100 text-orange-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  isOwner(): boolean {
    return this.book?.owner_id === this.currentUserId;
  }
} 