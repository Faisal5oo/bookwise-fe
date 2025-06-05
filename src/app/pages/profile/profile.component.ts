import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../shared/services/book.service';
import { StatsService } from '../../shared/services/stats.service';
import { Book } from '../../shared/models/book.model';
import { ReadingStats } from '../../shared/models/stats.model';

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
  
  // Profile data
  user = {
    id: 'current-user-id', // This should come from auth service
    name: 'Alice Johnson',
    memberSince: '2023-01-15',
    booksListed: 6,
    exchanges: 12,
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
  defaultBooks = [
    {
      id: '1',
      bookName: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      condition: 'Very Good',
      description: 'A classic American novel',
      bookImages: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop'],
      owner_id: this.user.id,
      genre: 'Classic',
      is_taken: false,
      created_at: new Date().toISOString(),
      view_count: 120
    },
    {
      id: '2',
      bookName: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      condition: 'Good',
      description: 'An unexpected journey',
      bookImages: ['https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=200&h=300&fit=crop'],
      owner_id: this.user.id,
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
    private statsService: StatsService
  ) {}

  ngOnInit() {
    this.loadProfileData();
  }

  async loadProfileData() {
    this.loading = true;
    try {
      // Load user's books
      this.bookService.getBooksByUser(this.user.id).subscribe({
        next: (books) => {
          this.books = books;
          this.user.booksListed = books.length;
        },
        error: (error) => {
          console.error('Error loading user books:', error);
          this.books = this.defaultBooks;
        }
      });

      // Load reading statistics
      this.statsService.getReadingStats(this.user.id).subscribe({
        next: (stats) => {
          this.readingStats = stats;
        },
        error: (error) => {
          console.error('Error loading reading stats:', error);
          // Use default stats for demo
        }
      });

      // Load user preferences (this would be from a preferences API)
      // For now, keeping the existing mock data

    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      this.loading = false;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
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
    return book.id;
  }
} 