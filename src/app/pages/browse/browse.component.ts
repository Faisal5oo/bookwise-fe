import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Book {
  id: string;
  title: string;
  author: string;
  condition: string;
  conditionColor: string;
  available: boolean;
  coverType: string;
}

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  books: Book[] = [];
  searchQuery = '';
  currentFilter = 'All Books';
  
  genres = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History'];
  conditions = ['Excellent', 'Very Good', 'Good', 'Fair'];
  
  selectedGenres: string[] = [];
  selectedConditions: string[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.books = [
      {
        id: '1',
        title: 'Milk and Honey',
        author: 'Rupi Kaur',
        condition: 'Excellent',
        conditionColor: 'bg-green-100 text-green-800',
        available: true,
        coverType: 'rupi-kaur'
      },
      {
        id: '2',
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        condition: 'Good',
        conditionColor: 'bg-yellow-100 text-yellow-800',
        available: true,
        coverType: 'teal-book'
      },
      {
        id: '3',
        title: '1984',
        author: 'George Orwell',
        condition: 'Very Good',
        conditionColor: 'bg-blue-100 text-blue-800',
        available: false,
        coverType: 'dark-book'
      },
      {
        id: '4',
        title: 'Jerusalem: A Cookbook',
        author: 'Yotam Ottolenghi',
        condition: 'Excellent',
        conditionColor: 'bg-green-100 text-green-800',
        available: true,
        coverType: 'jerusalem-cookbook'
      },
      {
        id: '5',
        title: 'Classic Literature',
        author: 'Various Authors',
        condition: 'Good',
        conditionColor: 'bg-yellow-100 text-yellow-800',
        available: true,
        coverType: 'classic-book'
      },
      {
        id: '6',
        title: 'Book Collection',
        author: 'Multiple Authors',
        condition: 'Fair',
        conditionColor: 'bg-orange-100 text-orange-800',
        available: true,
        coverType: 'stack-books'
      }
    ];
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
  }

  toggleGenre(genre: string) {
    const index = this.selectedGenres.indexOf(genre);
    if (index > -1) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genre);
    }
  }

  toggleCondition(condition: string) {
    const index = this.selectedConditions.indexOf(condition);
    if (index > -1) {
      this.selectedConditions.splice(index, 1);
    } else {
      this.selectedConditions.push(condition);
    }
  }

  viewBookDetails(book: Book) {
    this.router.navigate(['/book', book.id]);
  }
} 