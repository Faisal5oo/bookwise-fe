import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { ExchangeService } from '../../shared/services/exchange.service';
import { AuthService } from '../../shared/services/auth.service';
import { Book } from '../../shared/models/book.model';
import { ExchangeRequest, ExchangeStatus } from '../../shared/models/exchange.model';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  loading = false;
  errorMessage = '';
  searchQuery = '';
  currentFilter = 'All Books';
  imageErrorBooks: Set<string> = new Set();
  requestingExchangeBookId = '';
  showExchangeModal = false;
  exchangeMessage = '';
  selectedBook: Book | null = null;
  
  genres: string[] = [];
  conditions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Acceptable'];
  
  selectedGenres: string[] = [];
  selectedConditions: string[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private bookService: BookService,
    private exchangeService: ExchangeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadBooks();
    this.loadGenres();
    
    // Handle search query from navbar
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
        this.performSearch();
      }
    });
  }

  loadBooks() {
    this.loading = true;
    this.errorMessage = '';
    this.imageErrorBooks.clear();
    
    console.log('📚 Loading all books from API...');
    
    this.bookService.getBooks(0, 1000).subscribe({
      next: (response) => {
        console.log('✅ Books loaded successfully:', response);
        this.books = response.books || [];
        this.filteredBooks = [...this.books];
        
        // Extract unique genres from books
        this.extractGenresFromBooks();
        
        this.applyFilters();
        this.loading = false;
        
        console.log(`📖 Total books loaded: ${this.books.length}`);
        console.log(`🏷️ Available genres: ${this.genres.join(', ')}`);
      },
      error: (error) => {
        console.error('❌ Error loading books:', error);
        this.errorMessage = this.getErrorMessage(error);
        this.loading = false;
        this.books = [];
        this.filteredBooks = [];
        this.genres = [];
      }
    });
  }

  private extractGenresFromBooks() {
    const genreSet = new Set<string>();
    
    this.books.forEach(book => {
      if (book.genre && book.genre.trim()) {
        genreSet.add(book.genre.trim());
      }
    });
    
    this.genres = Array.from(genreSet).sort();
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Cannot connect to server. Make sure the backend is running on http://localhost:8000';
    } else if (error.error?.detail) {
      return error.error.detail;
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred while loading books';
    }
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.applyFilters();
  }

  toggleGenre(genre: string) {
    const index = this.selectedGenres.indexOf(genre);
    if (index > -1) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genre);
    }
    this.applyFilters();
  }

  toggleCondition(condition: string) {
    const index = this.selectedConditions.indexOf(condition);
    if (index > -1) {
      this.selectedConditions.splice(index, 1);
    } else {
      this.selectedConditions.push(condition);
    }
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.books];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(book => 
        book.bookName?.toLowerCase().includes(query) ||
        book.authorName?.toLowerCase().includes(query)
      );
    }

    // Apply availability filter
    if (this.currentFilter === 'Available') {
      filtered = filtered.filter(book => !book.is_taken);
    }

    // Apply condition filters
    if (this.selectedConditions.length > 0) {
      filtered = filtered.filter(book => 
        this.selectedConditions.includes(book.bookCondition || '')
      );
    }

    // Apply genre filters (if you add genre to your backend)
    if (this.selectedGenres.length > 0) {
      filtered = filtered.filter(book => 
        this.selectedGenres.includes(book.genre || '')
      );
    }

    this.filteredBooks = filtered;
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

  trackByBookId(index: number, book: Book): string {
    return book._id || book.book_id || index.toString();
  }

  clearFilters() {
    this.searchQuery = '';
    this.currentFilter = 'All Books';
    this.selectedGenres = [];
    this.selectedConditions = [];
    this.applyFilters();
  }

  onImageError(book: Book) {
    const bookId = book._id || book.book_id || '';
    this.imageErrorBooks.add(bookId);
  }

  shouldShowDefaultCover(book: Book): boolean {
    const bookId = book._id || book.book_id || '';
    return !book.bookImages || book.bookImages.length === 0 || this.imageErrorBooks.has(bookId);
  }

  // Exchange functionality
  canRequestExchange(book: Book): boolean {
    const currentUser = this.authService.getCurrentUser();
    return !!(currentUser && 
           currentUser.user_id !== book.user_id && 
           !book.is_taken);
  }

  isOwnBook(book: Book): boolean {
    const currentUser = this.authService.getCurrentUser();
    return !!(currentUser && currentUser.user_id === book.user_id);
  }

  openExchangeModal(book: Book) {
    if (!this.canRequestExchange(book)) {
      return;
    }
    
    this.selectedBook = book;
    this.exchangeMessage = '';
    this.showExchangeModal = true;
  }

  closeExchangeModal() {
    this.showExchangeModal = false;
    this.selectedBook = null;
    this.exchangeMessage = '';
  }

  requestExchange() {
    if (!this.selectedBook) {
      console.error('❌ No selected book');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Please login to request exchanges');
      return;
    }

    console.log('🔍 DEBUG - Exchange Request Data:');
    console.log('Selected Book:', this.selectedBook);
    console.log('Book Properties:', Object.keys(this.selectedBook));
    
    // Try multiple ways to extract book ID
    let bookId = this.selectedBook._id || this.selectedBook.book_id || (this.selectedBook as any).id;
    
    // Handle MongoDB ObjectId format if needed
    if (bookId && typeof bookId === 'object' && bookId.$oid) {
      bookId = bookId.$oid;
    }
    
    // Convert to string if it's not already
    if (bookId && typeof bookId !== 'string') {
      bookId = String(bookId);
    }
    
    console.log('📋 ID Detection:', {
      '_id': this.selectedBook._id,
      'book_id': this.selectedBook.book_id,
      'id': (this.selectedBook as any).id,
      'final_bookId': bookId,
      'bookId_type': typeof bookId,
      'user_id': this.selectedBook.user_id,
      'owner_id': (this.selectedBook as any).owner_id
    });

    if (!bookId) {
      console.error('❌ No book ID found in any field');
      alert(`Invalid book ID\n\nBook: ${this.selectedBook.bookName}\nAvailable fields: ${Object.keys(this.selectedBook).join(', ')}`);
      return;
    }

    this.requestingExchangeBookId = bookId;

    const exchangeRequest: ExchangeRequest = {
      requester_id: currentUser.user_id,
      book_id: bookId,
      owner_id: this.selectedBook.user_id,
      message: this.exchangeMessage.trim() || `Hi! I'm interested in exchanging for your book "${this.selectedBook.bookName}".`,
      status: ExchangeStatus.PENDING
    };

    console.log('📤 Sending Exchange Request:', exchangeRequest);

    this.exchangeService.requestExchange(exchangeRequest).subscribe({
      next: (response) => {
        console.log('✅ Exchange request sent successfully:', response);
        alert(`Exchange request sent successfully!\n\nYour request for "${this.selectedBook?.bookName}" has been sent to the owner.`);
        this.closeExchangeModal();
        this.requestingExchangeBookId = '';
      },
      error: (error) => {
        console.error('❌ Error requesting exchange:', error);
        console.error('Full error object:', error);
        
        let errorMsg = 'Failed to send exchange request';
        
        if (error.error?.detail) {
          if (Array.isArray(error.error.detail)) {
            errorMsg = error.error.detail.map((d: any) => 
              typeof d === 'string' ? d : d.msg || JSON.stringify(d)
            ).join(', ');
          } else {
            errorMsg = error.error.detail;
          }
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        alert(`Error: ${errorMsg}\n\nCheck console for details.`);
        this.requestingExchangeBookId = '';
      }
    });
  }

  isRequestingExchange(book: Book): boolean {
    const bookId = book._id || book.book_id;
    return this.requestingExchangeBookId === bookId;
  }

  getBookOwnerName(book: Book): string {
    // You might want to fetch this from user service or include it in book data
    return 'Book Owner';
  }

  viewBookDetails(book: Book) {
    const bookId = book._id || book.book_id;
    if (bookId) {
      this.router.navigate(['/book', bookId]);
    } else {
      console.error('No book ID found for book:', book);
    }
  }

  loadGenres() {
    // Genres are already extracted from books in loadBooks method
    // This method is kept for compatibility
  }

  performSearch() {
    // Apply the search filter when search query is set from navbar
    this.applyFilters();
  }
} 