import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExchangeService } from '../../shared/services/exchange.service';
import { BookService } from '../../shared/services/book.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExchangeDetails, ExchangeRequest, ExchangeStatus, ExchangeResponse } from '../../shared/models/exchange.model';
import { Book } from '../../shared/models/book.model';

@Component({
  selector: 'app-my-exchanges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-exchanges.component.html',
  styleUrls: ['./my-exchanges.component.scss']
})
export class MyExchangesComponent implements OnInit {
  activeTab = 'sent';
  loading = false;
  
  // Current user from auth service
  currentUserId = '';
  
  // Exchange data
  sentExchanges: ExchangeDetails[] = [];
  receivedExchanges: ExchangeDetails[] = [];
  exchangeHistory: ExchangeDetails[] = [];
  
  // Books for reference
  availableBooks: Book[] = [];
  
  // Form for new exchange request
  exchangeForm = {
    bookTitle: '',
    yourName: '',
    exchangeDetails: ''
  };

  constructor(
    private exchangeService: ExchangeService,
    private bookService: BookService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get current user
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      // Redirect to auth if not logged in (this shouldn't happen due to guard)
      this.router.navigate(['/auth']);
      return;
    }
    
    this.currentUserId = currentUser.user_id;
    this.loadExchangeData();
  }

  async loadExchangeData() {
    this.loading = true;
    try {
      // Load sent exchanges
      this.exchangeService.getUserExchanges(this.currentUserId, ExchangeStatus.PENDING).subscribe({
        next: (exchanges: ExchangeDetails[]) => {
          this.sentExchanges = exchanges.filter(ex => ex.requester_id === this.currentUserId);
        },
        error: (error: any) => {
          console.error('Error loading sent exchanges:', error);
          this.setMockExchanges();
        }
      });

      // Load received exchanges
      this.exchangeService.getUserExchanges(this.currentUserId).subscribe({
        next: (exchanges: ExchangeDetails[]) => {
          this.receivedExchanges = exchanges.filter(ex => ex.owner_id === this.currentUserId);
        },
        error: (error: any) => {
          console.error('Error loading received exchanges:', error);
        }
      });

      // Load exchange history - using the same method with no status filter
      this.exchangeService.getUserExchanges(this.currentUserId).subscribe({
        next: (history: ExchangeDetails[]) => {
          this.exchangeHistory = history.filter(ex => 
            ex.status === ExchangeStatus.COMPLETED || 
            ex.status === ExchangeStatus.DECLINED || 
            ex.status === ExchangeStatus.CANCELLED
          );
        },
        error: (error: any) => {
          console.error('Error loading exchange history:', error);
        }
      });

      // Load available books for new exchanges
      this.bookService.getBooks(0, 50).subscribe({
        next: (response) => {
          this.availableBooks = (response.books || []).filter(book => 
            (book.user_id || book.owner_id) !== this.currentUserId && !book.is_taken
          );
        },
        error: (error) => {
          console.error('Error loading available books:', error);
        }
      });

    } catch (error) {
      console.error('Error loading exchange data:', error);
    } finally {
      this.loading = false;
    }
  }

  setMockExchanges() {
    // Mock data for demo purposes
    this.sentExchanges = [
      {
        id: '1',
        requester_id: this.currentUserId,
        book_id: 'book1',
        owner_id: 'user2',
        message: 'I would love to read this book!',
        status: ExchangeStatus.PENDING,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        requester_id: this.currentUserId,
        book_id: 'book2',
        owner_id: 'user3',
        message: 'This looks interesting, would like to exchange',
        status: ExchangeStatus.ACCEPTED,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    this.receivedExchanges = [
      {
        id: '3',
        requester_id: 'user4',
        book_id: 'book3',
        owner_id: this.currentUserId,
        message: 'Can I borrow this book please?',
        status: ExchangeStatus.PENDING,
        created_at: new Date().toISOString()
      }
    ];
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onSubmitExchange() {
    // Check if user is authenticated before allowing exchange
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    console.log('Exchange request submitted:', this.exchangeForm);
    // Here you would typically send the data to a service
    
    // Reset form after submission
    this.exchangeForm = {
      bookTitle: '',
      yourName: '',
      exchangeDetails: ''
    };
    
    // Show success message (you could add a proper notification system)
    alert('Exchange request submitted successfully!');
  }

  // Request an exchange for a specific book
  requestExchange(book: Book, message?: string) {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    const request: ExchangeRequest = {
      requester_id: this.currentUserId,
      book_id: book._id || book.book_id || '',
      owner_id: book.user_id || book.owner_id || '',
      message: message || 'I would like to exchange this book'
    };

    this.exchangeService.requestExchange(request).subscribe({
      next: (exchange) => {
        console.log('Exchange requested successfully:', exchange);
        this.sentExchanges.push(exchange);
        alert('Exchange request sent successfully!');
      },
      error: (error) => {
        console.error('Error requesting exchange:', error);
        alert('Error sending exchange request. Please try again.');
      }
    });
  }

  // Respond to an exchange request
  respondToExchange(exchange: ExchangeDetails, responseType: ExchangeStatus, message?: string) {
    const response: ExchangeResponse = {
      exchange_id: exchange.id,
      response_type: responseType,
      message: message || (responseType === ExchangeStatus.ACCEPTED ? 'Exchange accepted!' : 'Exchange declined.'),
      created_at: new Date().toISOString()
    };

    this.exchangeService.respondToExchange(exchange.id, response).subscribe({
      next: (updatedExchange) => {
        console.log('Exchange response sent:', updatedExchange);
        
        // Update the exchange in our local array
        const index = this.receivedExchanges.findIndex(ex => ex.id === exchange.id);
        if (index > -1) {
          this.receivedExchanges[index] = updatedExchange;
        }
        
        alert(`Exchange ${responseType}!`);
      },
      error: (error) => {
        console.error('Error responding to exchange:', error);
        alert('Error responding to exchange. Please try again.');
      }
    });
  }

  // Complete an exchange
  completeExchange(exchange: ExchangeDetails) {
    this.exchangeService.completeExchange(exchange.id, 'Exchange completed successfully!').subscribe({
      next: (updatedExchange) => {
        console.log('Exchange completed:', updatedExchange);
        
        // Move to history
        this.exchangeHistory.push(updatedExchange);
        
        // Remove from active exchanges
        this.sentExchanges = this.sentExchanges.filter(ex => ex.id !== exchange.id);
        this.receivedExchanges = this.receivedExchanges.filter(ex => ex.id !== exchange.id);
        
        alert('Exchange completed!');
      },
      error: (error) => {
        console.error('Error completing exchange:', error);
        alert('Error completing exchange. Please try again.');
      }
    });
  }

  getStatusClass(status: ExchangeStatus): string {
    switch (status) {
      case ExchangeStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ExchangeStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case ExchangeStatus.DECLINED:
        return 'bg-red-100 text-red-800';
      case ExchangeStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case ExchangeStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  trackByExchangeId(index: number, exchange: ExchangeDetails): string {
    return exchange.id;
  }
} 