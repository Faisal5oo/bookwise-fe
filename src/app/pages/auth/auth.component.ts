import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest } from '../../shared/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  isLogin = true;
  loading = false;
  errorMessage = '';
  successMessage = '';

  loginForm: LoginRequest = {
    email: '',
    password: ''
  };

  registerForm: RegisterRequest = {
    fname: '',
    lname: '',
    email: '',
    password: ''
  };

  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.clearMessages();
    this.resetForms();
  }

  onLogin() {
    if (!this.validateLoginForm()) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    this.authService.login(this.loginForm).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.successMessage = 'Welcome back!';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Invalid email or password';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onRegister() {
    if (!this.validateRegisterForm()) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    this.authService.register(this.registerForm).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.successMessage = 'Welcome to BookWise!';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private validateLoginForm(): boolean {
    if (!this.loginForm.email?.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }

    if (!this.isValidEmail(this.loginForm.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    if (!this.loginForm.password?.trim()) {
      this.errorMessage = 'Password is required';
      return false;
    }

    return true;
  }

  private validateRegisterForm(): boolean {
    if (!this.registerForm.fname?.trim()) {
      this.errorMessage = 'First name is required';
      return false;
    }

    if (!this.registerForm.lname?.trim()) {
      this.errorMessage = 'Last name is required';
      return false;
    }

    if (!this.registerForm.email?.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }

    if (!this.isValidEmail(this.registerForm.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    if (!this.registerForm.password?.trim()) {
      this.errorMessage = 'Password is required';
      return false;
    }

    if (this.registerForm.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return false;
    }

    if (this.registerForm.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private resetForms() {
    this.loginForm = {
      email: '',
      password: ''
    };

    this.registerForm = {
      fname: '',
      lname: '',
      email: '',
      password: ''
    };

    this.confirmPassword = '';
  }
} 