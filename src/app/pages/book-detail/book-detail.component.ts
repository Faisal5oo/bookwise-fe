import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExchangeService } from '../../shared/services/exchange.service';
import { Book } from '../../shared/models/book.model';
import { ExchangeRequest } from '../../shared/models/exchange.model';

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
    if (!this.book || !this.isAuthenticated) return;
    
    this.exchangeLoading = true;
    const bookId = this.book._id || this.book.book_id;
    
    if (bookId) {
      const exchangeRequest: ExchangeRequest = {
        book_id: bookId,
        requester_id: this.currentUserId,
        owner_id: this.book.user_id || this.book.owner_id || '',
        message: `I would like to exchange books with you. I'm interested in "${this.book.bookName}".`
      };

      this.exchangeService.requestExchange(exchangeRequest).subscribe({
        next: (response: any) => {
          console.log('Exchange request sent:', response);
          this.exchangeLoading = false;
          // You might want to show a success message here
        },
        error: (error: any) => {
          console.error('Error sending exchange request:', error);
          this.exchangeLoading = false;
          // You might want to show an error message here
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/browse']);
  }

  getConditionColor(condition: string): string {
    switch (condition?.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'very good': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      case 'acceptable': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  isOwner(): boolean {
    return this.book?.user_id === this.currentUserId || this.book?.owner_id === this.currentUserId;
  }
} 