import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { AuthService } from '../../shared/services/auth.service';
import { PostBookModel } from '../../shared/models/book.model';

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

  bookData: PostBookModel = {
    user_id: '',
    bookName: '',
    authorName: '',
    description: '',
    bookCondition: 'Good',
    bookImages: [],
    is_taken: false
  };

  conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
  
  // Sample image URLs for demo purposes
  sampleImages = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'
  ];

  selectedImages: File[] = [];

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize with current user ID if available
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.bookData.user_id = currentUser.user_id || '';
    }
  }

  onImageSelect(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedImages = Array.from(files);
      
      this.bookData.bookImages = [];
      for (let file of this.selectedImages) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.bookData.bookImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Add sample image for demo
  addSampleImage() {
    const randomImage = this.sampleImages[Math.floor(Math.random() * this.sampleImages.length)];
    if (!this.bookData.bookImages.includes(randomImage)) {
      this.bookData.bookImages.push(randomImage);
    }
  }

  removeImage(index: number) {
    this.bookData.bookImages.splice(index, 1);
    if (this.selectedImages.length > index) {
      this.selectedImages.splice(index, 1);
    }
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

    // Ensure we have the user_id
    if (!this.bookData.user_id) {
      this.bookData.user_id = currentUser.user_id;
    }

    // Add some sample images if none provided
    if (this.bookData.bookImages.length === 0) {
      this.bookData.bookImages = [this.sampleImages[0], this.sampleImages[1]];
    }

    const newBook: PostBookModel = {
      user_id: this.bookData.user_id,
      bookName: this.bookData.bookName.trim(),
      authorName: this.bookData.authorName.trim(),
      description: this.bookData.description?.trim() || 'A wonderful book worth reading.',
      bookCondition: this.bookData.bookCondition,
      bookImages: this.bookData.bookImages,
      is_taken: false,
      created_at: new Date().toISOString()
    };

    console.log('Submitting book:', newBook);

    this.bookService.addBook(newBook).subscribe({
      next: (response) => {
        console.log('✅ Book added successfully:', response);
        
        // Handle different response formats
        if (response.book_id || response._id) {
          this.successMessage = `Book "${newBook.bookName}" added successfully! ID: ${response.book_id || response._id}`;
        } else if (response.message) {
          this.successMessage = response.message;
        } else {
          this.successMessage = `Book "${newBook.bookName}" added successfully!`;
        }
        
        setTimeout(() => {
          this.router.navigate(['/profile'], { 
            queryParams: { refresh: 'true' } 
          });
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error adding book:', error);
        let errorMsg = 'Failed to add book. Please try again.';
        
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
        
        this.errorMessage = errorMsg;
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

    if (!this.bookData.authorName?.trim()) {
      this.errorMessage = 'Author name is required';
      return false;
    }

    if (!this.bookData.bookCondition) {
      this.errorMessage = 'Book condition is required';
      return false;
    }

    return true;
  }

  cancel() {
    this.router.navigate(['/profile']);
  }
} 