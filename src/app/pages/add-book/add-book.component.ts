import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { AuthService } from '../../shared/services/auth.service';
import { Book } from '../../shared/models/book.model';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.scss']
})
export class AddBookComponent {
  loading = false;
  errorMessage = '';
  successMessage = '';

  bookData: Partial<Book> = {
    bookName: '',
    description: '',
    author: '',
    genre: '',
    condition: 'Good',
    bookImages: []
  };

  conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
  genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy',
    'Biography', 'History', 'Self-Help', 'Education', 'Children', 'Young Adult',
    'Poetry', 'Drama', 'Horror', 'Adventure', 'Philosophy', 'Religion', 'Other'
  ];

  selectedImages: File[] = [];

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    private router: Router
  ) {}

  onImageSelect(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedImages = Array.from(files);
      
      this.bookData.bookImages = [];
      for (let file of this.selectedImages) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.bookData.bookImages!.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.bookData.bookImages!.splice(index, 1);
    this.selectedImages.splice(index, 1);
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'You must be logged in to add a book';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newBook: Partial<Book> = {
      bookName: this.bookData.bookName!.trim(),
      description: this.bookData.description!.trim(),
      author: this.bookData.author!.trim(),
      genre: this.bookData.genre!,
      condition: this.bookData.condition!,
      owner_id: currentUser.user_id,
      is_taken: false,
      created_at: new Date().toISOString(),
      view_count: 0,
      bookImages: this.bookData.bookImages || []
    };

    this.bookService.addBook(newBook).subscribe({
      next: (response) => {
        console.log('Book added successfully:', response);
        this.successMessage = 'Book added successfully!';
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error adding book:', error);
        this.errorMessage = error.error?.message || 'Failed to add book. Please try again.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private validateForm(): boolean {
    if (!this.bookData.bookName?.trim()) {
      this.errorMessage = 'Book name is required';
      return false;
    }

    if (!this.bookData.author?.trim()) {
      this.errorMessage = 'Author is required';
      return false;
    }

    if (!this.bookData.genre) {
      this.errorMessage = 'Genre is required';
      return false;
    }

    if (!this.bookData.condition) {
      this.errorMessage = 'Condition is required';
      return false;
    }

    if (!this.bookData.description?.trim()) {
      this.errorMessage = 'Description is required';
      return false;
    }

    if (this.bookData.description.trim().length < 10) {
      this.errorMessage = 'Description must be at least 10 characters long';
      return false;
    }

    return true;
  }

  cancel() {
    this.router.navigate(['/profile']);
  }
} 