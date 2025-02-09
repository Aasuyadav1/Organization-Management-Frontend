import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-g  ray-50 p-4">
      <div class="max-w-md w-full flex flex-col gap-8 bg-white p-8 rounded-lg shadow-md">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">Create Account</h2>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
          <!-- Name Field -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter your full name"
            >
            <div *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.invalid" 
              class="text-red-500 text-sm mt-1">
              Name is required
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter your email"
            >
            <div *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid" 
              class="text-red-500 text-sm mt-1">
              Please enter a valid email
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter your password"
            >
            <div *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid" 
              class="text-red-500 text-sm mt-1">
              Password must be at least 6 characters
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="!registerForm.valid"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Create Account
          </button>

          <!-- Login Link -->
          <div class="text-center">
            <a routerLink="/login" class="text-indigo-600 hover:text-indigo-500">
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Registration failed:', error);
        }
      });
    }
  }
}
