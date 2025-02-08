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
    <!-- Main Dashboard Container -->
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header with Create Button -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-semibold text-gray-900">My Organizations</h1>
          <button 
            (click)="showCreateModal = true"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Organization
          </button>
        </div>

        <!-- Organizations Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Organization Card -->
          <div 
            *ngFor="let org of organizations" 
            (click)="navigateToOrganization(org._id)"
            class="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <!-- Organization Header -->
            <div class="flex items-center space-x-4">
              <img 
                [src]="org.logo || 'assets/default-org-logo.png'" 
                alt="Organization logo"
                class="w-12 h-12 rounded-full object-cover"
                (error)="org.logo = 'assets/default-org-logo.png'"
              >
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{org.name}}</h3>
                <p class="text-sm text-gray-500">{{org.description}}</p>
              </div>
            </div>
            <!-- Member Count -->
            <div class="mt-4 text-sm text-gray-500">
              {{org.members?.length || 0}} members
            </div>
          </div>
        </div>

        <!-- Create Organization Modal -->
        <div *ngIf="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 class="text-xl font-semibold mb-4">Create New Organization</h2>
            
            <!-- Create Organization Form -->
            <form [formGroup]="createForm" (ngSubmit)="createOrganization()" class="space-y-4">
              <!-- Name Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" 
                  formControlName="name"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Organization name"
                >
              </div>

              <!-- Description Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  formControlName="description"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Organization description"
                  rows="3"
                ></textarea>
              </div>

              <!-- Logo URL Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Logo URL (optional)</label>
                <input 
                  type="text" 
                  formControlName="logo"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="https://example.com/logo.png"
                >
              </div>

              <!-- Form Actions -->
              <div class="flex justify-end space-x-3">
                <button 
                  type="button" 
                  (click)="showCreateModal = false"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  [disabled]="!createForm.valid"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
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

  constructor(
    private organizationService: OrganizationService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      logo: ['']
    });
  }

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.organizationService.getUserOrganizations().subscribe({
      next: (response: any) => {
        this.organizations = Array.isArray(response) ? response : [];
        console.log('Organizations loaded:', this.organizations);
      },
      error: (error) => {
        console.error('Failed to load organizations:', error);
        this.organizations = [];
      }
    });
  }

  createOrganization() {
    if (this.createForm.valid) {
      this.organizationService.createOrganization(this.createForm.value).subscribe({
        next: (response) => {
          this.showCreateModal = false;
          this.loadOrganizations();
          this.createForm.reset();
        },
        error: (error) => {
          console.error('Failed to create organization:', error);
        }
      });
    }
  }

  navigateToOrganization(orgId: string) {
    this.router.navigate(['/organizations', orgId]);
  }
}
