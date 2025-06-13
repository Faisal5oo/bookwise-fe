import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { StatsService } from '../../shared/services/stats.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExchangeService } from '../../shared/services/exchange.service';
import { PreferencesService } from '../../shared/services/preferences.service';
import { AIService, BookMatch } from '../../shared/services/ai.service';
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
    user_id: '',
    name: 'Loading...',
    email: '',
    exchanges: 0,
    booksListed: 0,
    created_at: new Date().toISOString(),
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  };

  // Reading stats
  readingStats: ReadingStats | null = null;

  // User's books collection
  books: Book[] = [];

  // AI Preferences - Dynamic data
  favoriteGenres = ['Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Classic', 'Romance', 'Biography', 'History', 'Philosophy', 'Adventure'];
  selectedGenres: string[] = [];
  
  favoriteAuthors: string[] = [];
  selectedAuthors: string[] = [];

  // Dynamic data from API
  availableGenres: string[] = [];
  availableAuthors: string[] = [];

  // AI Book Matches
  bookMatches: BookMatch[] = [];
  matchesLoading = false;

  // Enhanced AI Matching Algorithm Info
  matchingAlgorithmInfo = {
    directGenreMatching: 50,
    authorMatching: 40,
    descriptionAnalysis: 30,
    keywordMatching: 20,
    qualityBonus: 10,
    baseRecommendations: 20
  };

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
    private preferencesService: PreferencesService,
    private aiService: AIService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Get current user from auth service
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.user_id = currentUser.user_id;
      this.user.name = `${currentUser.fname} ${currentUser.lname}`;
      this.user.created_at = (currentUser as any).created_at || new Date().toISOString();
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
    
    // Load user preferences
    this.loadUserPreferences();
    
    // Load dynamic data
    this.loadDynamicData();
  }

  loadUserPreferences() {
    if (!this.user.user_id) return;

    this.preferencesService.getUserPreferences(this.user.user_id).subscribe({
      next: (preferences) => {
        console.log('✅ User preferences loaded:', preferences);
        if (preferences) {
          this.selectedGenres = preferences.favorite_genres || this.selectedGenres;
          this.selectedAuthors = preferences.favorite_authors || this.selectedAuthors;
          this.readingPreferences = { ...this.readingPreferences, ...preferences.reading_preferences };
        }
      },
      error: (error) => {
        console.log('No existing preferences found, using defaults');
      }
    });
  }

  loadDynamicData() {
    // Load all available genres from API
    this.bookService.getAllGenres().subscribe({
      next: (genres) => {
        this.availableGenres = genres;
        console.log('✅ Available genres loaded:', genres);
      },
      error: (error) => {
        console.log('📚 Using default genres, API not available:', error);
        this.availableGenres = [];
      }
    });

    // Load all available authors from API
    this.bookService.getAllAuthors().subscribe({
      next: (authors) => {
        this.availableAuthors = authors;
        console.log('✅ Available authors loaded:', authors);
      },
      error: (error) => {
        console.log('👥 Using authors from user books, API not available:', error);
        this.availableAuthors = [];
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
          
          // Extract authors from books for AI preferences
          this.extractAuthorsFromBooks();
          
          // Update user info if provided by API
          if (response.user_name) {
            this.user.name = response.user_name;
          }
          
          // Handle user creation date
          if (response.user_created_at) {
            this.user.created_at = response.user_created_at;
          } else if (response.created_at) {
            this.user.created_at = response.created_at;
          }
          
          console.log('📚 Books loaded successfully:', {
            count: this.books.length,
            total_from_api: response.total_user_books,
            books_listed: this.user.booksListed,
            member_since: this.user.created_at
          });
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading user books:', error);
        
        // Show detailed error information
        let errorMsg = 'Unknown error occurred';
        if (error.error?.detail) {
          errorMsg = Array.isArray(error.error.detail) ? 
            error.error.detail.map((d: any) => d.msg || d).join(', ') : 
            error.error.detail;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        console.error('📋 Detailed error:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: errorMsg
        });
        
        // Don't set default books - keep empty array
        this.books = [];
        this.user.booksListed = 0;
        this.loading = false;
      }
    });

    // Load reading stats
    this.statsService.getReadingStats(this.user.user_id).subscribe({
      next: (stats) => {
        this.readingStats = stats;
        console.log('📊 Reading stats loaded:', stats);
      },
      error: (error) => {
        console.log('📊 No reading stats available:', error);
        this.readingStats = null;
      }
    });

    // Load exchanges
    this.loadExchanges();
    
    // Load AI book matches
    this.loadBookMatches();
  }

  private extractAuthorsFromBooks() {
    const authorSet = new Set<string>();
    
    this.books.forEach(book => {
      if (book.authorName && book.authorName.trim()) {
        authorSet.add(book.authorName.trim());
      }
    });
    
    this.favoriteAuthors = Array.from(authorSet).sort();
    console.log('👥 Extracted authors from books:', this.favoriteAuthors);
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
    if (!this.user.user_id) {
      alert('Please log in to save preferences');
      return;
    }

    // Call API to save preferences
    const preferences = {
      user_id: this.user.user_id,
      favorite_genres: this.selectedGenres,
      favorite_authors: this.selectedAuthors,
      reading_preferences: {
        bookLength: this.readingPreferences.bookLength || 'Medium',
        writingStyle: this.readingPreferences.writingStyle || 'Moderate',
        publicationEra: this.readingPreferences.publicationEra || 'Modern'
      }
    };

    console.log('Saving preferences:', preferences);
    
    this.preferencesService.setUserPreferences(this.user.user_id, preferences).subscribe({
      next: (response) => {
        console.log('✅ Preferences saved successfully:', response);
        
        // Set flag for AI recommendations to refresh
        localStorage.setItem('preferencesUpdated', new Date().toISOString());
        
        alert('Preferences updated successfully! The AI will now use these to generate better recommendations for you.');
      },
      error: (error) => {
        console.error('❌ Error saving preferences:', error);
        let errorMsg = 'Failed to save preferences.';
        
        if (error.error?.detail) {
          errorMsg += ' ' + (Array.isArray(error.error.detail) ? 
            error.error.detail.map((d: any) => d.msg || d).join(', ') : 
            error.error.detail);
        }
        
        alert(errorMsg + ' Please try again.');
      }
    });
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

  loadBookMatches() {
    if (!this.user.user_id) return;

    this.matchesLoading = true;
    console.log('🎯 Loading AI book matches for user:', this.user.user_id);
    
    this.aiService.getBookMatches(this.user.user_id).subscribe({
      next: (response: any) => {
        console.log('✅ Book matches response:', response);
        
        if (response && response.matches) {
          this.bookMatches = response.matches;
          console.log(`🎯 Found ${this.bookMatches.length} book matches`);
        } else if (Array.isArray(response)) {
          this.bookMatches = response;
          console.log(`🎯 Found ${this.bookMatches.length} book matches`);
        } else {
          this.bookMatches = [];
          console.log('📚 No book matches found');
        }
        
        this.matchesLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading book matches:', error);
        this.bookMatches = [];
        this.matchesLoading = false;
      }
    });
  }

  // AI Book Matches helper methods
  trackByMatchId(index: number, match: BookMatch): string {
    return match.book_id || index.toString();
  }

  getMatchPercentageClass(percentage: number): string {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  }

  viewBookDetails(match: BookMatch | any) {
    const bookId = match.book_id || match._id;
    if (bookId) {
      this.router.navigate(['/book', bookId]);
    }
  }

  requestExchange(match: BookMatch) {
    // Navigate to exchange request page or open modal
    console.log('Requesting exchange for book:', match.book_name);
    // Implementation depends on your exchange system
    alert(`Exchange request for "${match.book_name}" - Feature coming soon!`);
  }
} 