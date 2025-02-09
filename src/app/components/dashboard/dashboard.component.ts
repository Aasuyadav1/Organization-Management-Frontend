import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Organization } from '../../interfaces/organization.interface';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header with Create Button -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">My Organizations</h1>
          <button 
            (click)="showCreateModal = true"
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Organization
          </button>
        </div>

        <!-- Loading State -->
        <ng-container *ngIf="isLoading">
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </ng-container>

        <!-- Content after loading -->
        <ng-container *ngIf="!isLoading">
          <!-- Organizations Grid -->
          <div *ngIf="organizations.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <!-- Organization Card -->
            <div 
              *ngFor="let org of organizations" 
              (click)="navigateToOrganization(org._id)"
              class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <!-- Organization Header -->
              <div class="p-4 sm:p-6">
                <div class="flex items-center space-x-4">
                  <div class="h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center bg-indigo-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg sm:text-xl font-semibold text-gray-900 truncate">{{org.name}}</h3>
                    <p class="text-sm text-gray-500 truncate">{{org.description}}</p>
                  </div>
                </div>
                <!-- Member Count -->
                <div class="mt-4 text-sm text-gray-500">
                  {{(org.members || []).length}} members
                </div>
              </div>
            </div>
          </div>

          <!-- No Organizations Message -->
          <div *ngIf="organizations.length === 0" class="text-center py-12">
            <div class="bg-white p-8 rounded-lg shadow-sm">
              <h3 class="text-xl font-medium text-gray-900 mb-2">No workspaces found</h3>
              <p class="text-gray-500 mb-4">Click the "Create Organization" button to get started</p>
            </div>
          </div>
        </ng-container>

        <!-- Create Organization Modal -->
        <div *ngIf="showCreateModal" class="fixed inset-0 z-50">
          <div class="absolute inset-0 bg-black opacity-40"></div>
          <div class="relative z-50 h-full flex items-center justify-center p-4">
            <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
              <div class="mt-2">
                <h3 class="text-lg text-gray-900 mb-4">Create New Organization</h3>
                <form [formGroup]="createForm" (ngSubmit)="createOrganization()" class="mt-4">
                  <!-- Name Field -->
                  <div class="mb-4">
                    <label class="block text-sm text-gray-700 mb-2">Name</label>
                    <input 
                      type="text" 
                      formControlName="name"
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Organization name">
                  </div>

                  <!-- Description Field -->
                  <div class="mb-4">
                    <label class="block text-sm text-gray-700 mb-2">Description</label>
                    <textarea 
                      formControlName="description"
                      rows="3"
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Organization description"></textarea>
                  </div>

                  <!-- Form Actions -->
                  <div class="flex justify-end space-x-3 mt-6">
                    <button 
                      type="button" 
                      (click)="showCreateModal = false"
                      class="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      [disabled]="!createForm.valid || isCreating"
                      class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                      <div *ngIf="isCreating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {{ isCreating ? 'Creating...' : 'Create' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  organizations: Organization[] = [];
  showCreateModal = false;
  createForm: FormGroup;
  isLoading = false;
  isCreating = false;

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.isLoading = true;
    this.organizationService.getUserOrganizations().subscribe({
      next: (response: any) => {
        this.organizations = Array.isArray(response) ? response : [];
        console.log('Organizations loaded:', this.organizations);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load organizations:', error);
        this.organizations = [];
        this.isLoading = false;
      }
    });
  }

  createOrganization() {
    if (this.createForm.valid) {
      this.isCreating = true;
      this.organizationService.createOrganization(this.createForm.value).subscribe({
        next: (response) => {
          this.showCreateModal = false;
          this.loadOrganizations();
          this.createForm.reset();
          this.isCreating = false;
        },
        error: (error) => {
          console.error('Failed to create organization:', error);
          this.isCreating = false;
        }
      });
    }
  }

  navigateToOrganization(orgId: string) {
    this.router.navigate(['/organizations', orgId]);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}