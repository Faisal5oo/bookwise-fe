import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { StatsService } from '../../shared/services/stats.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExchangeService } from '../../shared/services/exchange.service';
import { Book } from '../../shared/models/book.model';
import { ReadingStats } from '../../shared/models/stats.model';
import { ExchangeDetails, ExchangeStatus } from '../../shared/models/exchange.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  activeTab = 'books';
  loading = false;
  deletingBookId = '';
  
  // Exchange management
  exchangeActiveTab = 'received';
  exchangesLoading = false;
  processingExchangeId = '';
  receivedExchanges: ExchangeDetails[] = [];
  sentExchanges: ExchangeDetails[] = [];
  
  // Profile data
  user = {
    user_id: '', // Will be set from auth service
    name: 'User',
    memberSince: '2023-01-15',
    booksListed: 0,
    exchanges: 0,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  };

  // Reading stats
  readingStats: ReadingStats | null = null;
  defaultReadingStats = {
    booksRead: 12,
    pagesRead: 3240,
    authorsExplored: 8,
    topGenres: [
      { name: 'Fantasy', percentage: 40 },
      { name: 'Classic', percentage: 30 },
      { name: 'Science Fiction', percentage: 20 },
      { name: 'Romance', percentage: 10 }
    ]
  };

  // User's books collection
  books: Book[] = [];
  defaultBooks: Book[] = [
    {
      _id: '1',
      book_id: '1',
      user_id: this.user.user_id,
      bookName: 'The Great Gatsby',
      authorName: 'F. Scott Fitzgerald',
      bookCondition: 'Very Good',
      description: 'A classic American novel',
      bookImages: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop'],
      genre: 'Classic',
      is_taken: false,
      created_at: new Date().toISOString(),
      view_count: 120
    },
    {
      _id: '2',
      book_id: '2',
      user_id: this.user.user_id,
      bookName: 'The Hobbit',
      authorName: 'J.R.R. Tolkien',
      bookCondition: 'Good',
      description: 'An unexpected journey',
      bookImages: ['https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=200&h=300&fit=crop'],
      genre: 'Fantasy',
      is_taken: false,
      created_at: new Date().toISOString(),
      view_count: 95
    }
  ];

  // AI Preferences
  favoriteGenres = ['Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Classic', 'Romance', 'Biography', 'History', 'Philosophy', 'Adventure'];
  selectedGenres = ['Fantasy', 'Science Fiction', 'Classic'];
  
  favoriteAuthors = ['J.R.R. Tolkien', 'F. Scott Fitzgerald', 'Jane Austen', 'George Orwell', 'Frank Herbert'];
  selectedAuthors = ['J.R.R. Tolkien', 'F. Scott Fitzgerald'];

  readingPreferences = {
    bookLength: 'Medium',
    writingStyle: 'Moderate',
    publicationEra: 'Modern'
  };

  constructor(
    private bookService: BookService,
    private statsService: StatsService,
    private authService: AuthService,
    private exchangeService: ExchangeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Get current user from auth service
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.user_id = currentUser.user_id;
      this.user.name = `${currentUser.fname} ${currentUser.lname}`;
    }
  }

  ngOnInit() {
    // Check if we should refresh data (coming from add-book page)
    this.route.queryParams.subscribe(params => {
      if (params['refresh']) {
        console.log('Refreshing profile data due to query param');
        this.loadProfileData();
      } else {
        this.loadProfileData();
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions if needed
  }

  // Method to refresh profile data
  refreshProfile() {
    console.log('Refreshing profile data...');
    this.loadProfileData();
  }

  loadProfileData() {
    this.loading = true;
    
    // Check if user is logged in
    if (!this.user.user_id) {
      console.error('❌ No user ID found - user needs to login');
      console.log('Current user object:', this.user);
      
      // Try to get user from auth service again
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        console.log('🔄 Found user in auth service:', currentUser);
        this.user.user_id = currentUser.user_id;
        this.user.name = `${currentUser.fname} ${currentUser.lname}`;
      } else {
        console.error('❌ No user found in auth service either');
        this.loading = false;
        return;
      }
    }

    console.log('👤 Loading profile data for user:', {
      user_id: this.user.user_id,
      name: this.user.name
    });

    // Load user's books from backend API
    console.log('📡 Calling API: GET /users/' + this.user.user_id + '/books');
    this.bookService.getBooksByUser(this.user.user_id, 0, 100).subscribe({
      next: (response) => {
        console.log('✅ API Response received:', response);
        
        // Handle your backend response format
        if (response) {
          this.books = response.books || [];
          this.user.booksListed = response.total_user_books || 0;
          
          // Update user name if provided by API
          if (response.user_name) {
            this.user.name = response.user_name;
          }
          
          console.log(`📚 User "${this.user.name}" has ${this.user.booksListed} books`);
          console.log('📖 Books loaded:', this.books.length, 'books');
          
          // Log individual books for debugging
          this.books.forEach((book, index) => {
            console.log(`Book ${index + 1}:`, {
              _id: book._id,
              book_id: book.book_id,
              combined_id: book._id || book.book_id,
              name: book.bookName,
              author: book.authorName,
              condition: book.bookCondition,
              full_book: book
            });
          });
        } else {
          console.warn('⚠️ Empty response from API');
          this.books = [];
          this.user.booksListed = 0;
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error calling /users/' + this.user.user_id + '/books:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        
        // Handle different error scenarios
        if (error.status === 404) {
          console.log('👤 User not found or user has no books');
          this.books = [];
          this.user.booksListed = 0;
        } else if (error.status === 0) {
          console.error('🔌 Backend server is not running or CORS issue');
          alert('Cannot connect to backend server. Please make sure your FastAPI server is running on http://localhost:8000');
          this.books = [];
          this.user.booksListed = 0;
        } else {
          console.log('📭 Setting empty books list due to error');
          this.books = [];
          this.user.booksListed = 0;
        }
        
        this.loading = false;
      }
    });

    // Load reading statistics
    this.statsService.getReadingStats(this.user.user_id).subscribe({
      next: (stats) => {
        this.readingStats = stats;
      },
      error: (error) => {
        console.error('Error loading reading stats:', error);
        // Use default stats for demo
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    
    // Load exchanges when switching to exchanges tab
    if (tab === 'exchanges') {
      this.loadExchanges();
    }
  }

  setExchangeTab(tab: string) {
    this.exchangeActiveTab = tab;
  }

  toggleGenre(genre: string) {
    const index = this.selectedGenres.indexOf(genre);
    if (index > -1) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genre);
    }
  }

  toggleAuthor(author: string) {
    const index = this.selectedAuthors.indexOf(author);
    if (index > -1) {
      this.selectedAuthors.splice(index, 1);
    } else {
      this.selectedAuthors.push(author);
    }
  }

  updatePreferences() {
    // Call API to save preferences
    const preferences = {
      favorite_genres: this.selectedGenres,
      favorite_authors: this.selectedAuthors,
      reading_preferences: this.readingPreferences
    };

    // This would call the preferences API once implemented
    console.log('Preferences updated:', preferences);
    
    // Show success message
    alert('Preferences updated successfully!');
  }

  // Method to get display stats
  getDisplayStats() {
    if (this.readingStats) {
      return {
        booksRead: this.readingStats.books_read,
        pagesRead: this.readingStats.pages_read,
        authorsExplored: this.readingStats.authors_explored,
        topGenres: this.getGenrePercentages()
      };
    }
    return this.defaultReadingStats;
  }

  private getGenrePercentages() {
    if (!this.readingStats?.top_genres) return this.defaultReadingStats.topGenres;
    
    // Convert genres array to percentage format
    const total = this.readingStats.top_genres.length;
    return this.readingStats.top_genres.map((genre, index) => ({
      name: genre,
      percentage: Math.max(10, (total - index) * 20) // Mock percentage calculation
    }));
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
    return book._id || book.book_id || (book as any).id || index.toString();
  }

  editBook(book: Book) {
    console.log('🔧 Attempting to edit book:', book);
    
    // Try multiple ways to get the book ID
    const bookId = book._id || book.book_id || (book as any).id;
    
    console.log('📋 Book ID detection:', {
      '_id': book._id,
      'book_id': book.book_id,
      'id': (book as any).id,
      'final_bookId': bookId,
      'full_book': book
    });
    
    if (!bookId) {
      console.error('❌ No book ID found in any field');
      alert(`Cannot edit book: Book ID not found\n\nBook data: ${JSON.stringify(book, null, 2)}`);
      return;
    }
    
    console.log('✅ Navigating to edit book with ID:', bookId);
    this.router.navigate(['/edit-book', bookId]);
  }

  deleteBook(book: Book) {
    console.log('🗑️ Attempting to delete book:', book);
    
    const bookName = book.bookName || 'this book';
    
    // Try multiple ways to get the book ID
    const bookId = book._id || book.book_id || (book as any).id;
    
    console.log('📋 Delete Book ID detection:', {
      '_id': book._id,
      'book_id': book.book_id,
      'id': (book as any).id,
      'final_bookId': bookId,
      'book_name': bookName
    });
    
    if (!bookId) {
      console.error('❌ No book ID found for deletion');
      alert(`Cannot delete book: Book ID not found\n\nBook: ${bookName}\nBook data: ${JSON.stringify(book, null, 2)}`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${bookName}"?\n\nBook ID: ${bookId}\n\nThis action cannot be undone and will permanently remove this book from your collection.`)) {
      return;
    }

    // Set loading state for this specific book
    this.deletingBookId = bookId;
    
    this.bookService.deleteBook(bookId).subscribe({
      next: (response) => {
        console.log('✅ Book deleted successfully:', bookId, response);
        
        // Remove book from local array
        this.books = this.books.filter(b => {
          const bId = b._id || b.book_id || (b as any).id;
          return bId !== bookId;
        });
        this.user.booksListed = this.books.length;
        
        // Clear loading state
        this.deletingBookId = '';
        
        // Show success message
        const successMsg = response?.message || 'Book deleted successfully!';
        alert(`"${bookName}" has been deleted successfully!\n\n${successMsg}`);
      },
      error: (error) => {
        console.error('❌ Error deleting book:', error);
        
        // Clear loading state
        this.deletingBookId = '';
        
        // Show detailed error message
        let errorMsg = 'Unknown error occurred';
        
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error.detail) {
            errorMsg = Array.isArray(error.error.detail) ? 
              error.error.detail.map((d: any) => d.msg || d).join(', ') : 
              error.error.detail;
          } else if (error.error.message) {
            errorMsg = error.error.message;
          }
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        alert(`Failed to delete "${bookName}".\n\nError: ${errorMsg}\n\nPlease try again later.`);
      }
    });
  }

  // Helper method to check if a book is being deleted
  isDeleting(book: Book): boolean {
    const bookId = book._id || book.book_id || (book as any).id;
    return this.deletingBookId === bookId;
  }

  // Exchange management methods
  loadExchanges() {
    if (!this.user.user_id) return;

    this.exchangesLoading = true;
    
    this.exchangeService.getUserExchanges(this.user.user_id).subscribe({
      next: (exchanges) => {
        // Separate received and sent exchanges
        this.receivedExchanges = exchanges.filter(exchange => exchange.owner_id === this.user.user_id);
        this.sentExchanges = exchanges.filter(exchange => exchange.requester_id === this.user.user_id);
        
        // Populate book names from our books array
        this.populateExchangeBookNames();
        
        this.exchangesLoading = false;
        console.log('Exchanges loaded:', { received: this.receivedExchanges.length, sent: this.sentExchanges.length });
      },
      error: (error) => {
        console.error('Error loading exchanges:', error);
        this.exchangesLoading = false;
        // Don't show alert here as it might be annoying on tab switch
      }
    });
  }

  private populateExchangeBookNames() {
    // Add book names to exchanges from our books array
    [...this.receivedExchanges, ...this.sentExchanges].forEach(exchange => {
      const book = this.books.find(b => 
        (b._id || b.book_id) === exchange.book_id
      );
      if (book) {
        exchange.book_name = book.bookName;
        exchange.book_author = book.authorName;
        exchange.book_image = book.bookImages?.[0];
      }
    });
  }

  acceptExchange(exchange: ExchangeDetails) {
    if (!confirm(`Accept exchange request for "${exchange.book_name || 'this book'}"?\n\nThis will mark the book as unavailable.`)) {
      return;
    }

    this.processingExchangeId = exchange.id;
    
    this.exchangeService.acceptExchange(exchange.id, 'Your exchange request has been accepted! Please contact the requester to arrange the exchange.').subscribe({
      next: (updatedExchange) => {
        console.log('Exchange accepted:', updatedExchange);
        
        // Update local exchanges
        const index = this.receivedExchanges.findIndex(e => e.id === exchange.id);
        if (index > -1) {
          this.receivedExchanges[index] = updatedExchange;
        }
        
        // Refresh books to reflect availability change
        this.loadProfileData();
        
        this.processingExchangeId = '';
        alert('Exchange request accepted successfully!');
      },
      error: (error) => {
        console.error('Error accepting exchange:', error);
        const errorMsg = error.message || 'Failed to accept exchange request';
        alert(`Error: ${errorMsg}`);
        this.processingExchangeId = '';
      }
    });
  }

  declineExchange(exchange: ExchangeDetails) {
    const reason = prompt(`Decline exchange request for "${exchange.book_name || 'this book'}"?\n\nOptional: Provide a reason (this will be sent to the requester):`);
    
    if (reason === null) return; // User cancelled

    this.processingExchangeId = exchange.id;
    
    const message = reason.trim() || 'Your exchange request has been declined.';
    
    this.exchangeService.declineExchange(exchange.id, message).subscribe({
      next: (updatedExchange) => {
        console.log('Exchange declined:', updatedExchange);
        
        // Update local exchanges
        const index = this.receivedExchanges.findIndex(e => e.id === exchange.id);
        if (index > -1) {
          this.receivedExchanges[index] = updatedExchange;
        }
        
        this.processingExchangeId = '';
        alert('Exchange request declined.');
      },
      error: (error) => {
        console.error('Error declining exchange:', error);
        const errorMsg = error.message || 'Failed to decline exchange request';
        alert(`Error: ${errorMsg}`);
        this.processingExchangeId = '';
      }
    });
  }

  cancelExchange(exchange: ExchangeDetails) {
    if (!confirm(`Cancel your exchange request for "${exchange.book_name || 'this book'}"?`)) {
      return;
    }

    this.processingExchangeId = exchange.id;
    
    this.exchangeService.cancelExchange(exchange.id, 'Exchange request cancelled by requester.').subscribe({
      next: (updatedExchange) => {
        console.log('Exchange cancelled:', updatedExchange);
        
        // Update local exchanges
        const index = this.sentExchanges.findIndex(e => e.id === exchange.id);
        if (index > -1) {
          this.sentExchanges[index] = updatedExchange;
        }
        
        this.processingExchangeId = '';
        alert('Exchange request cancelled.');
      },
      error: (error) => {
        console.error('Error cancelling exchange:', error);
        const errorMsg = error.message || 'Failed to cancel exchange request';
        alert(`Error: ${errorMsg}`);
        this.processingExchangeId = '';
      }
    });
  }

  getExchangeStatusClass(status: ExchangeStatus): string {
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
} 