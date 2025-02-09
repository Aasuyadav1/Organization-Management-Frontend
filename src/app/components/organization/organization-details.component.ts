import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Organization, OrganizationMember } from '../../interfaces/organization.interface';
import { User } from '../../interfaces/user.interface';
import { OrganizationService } from '../../services/organization.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-organization-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow rounded-lg">
          <!-- Organization Header -->
          <div class="px-6 py-5 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <img [src]="organization?.logo || 'assets/default-org-logo.png'" 
                  class="h-16 w-16 rounded-full" alt="Organization logo">
                <div class="ml-4">
                  <h1 class="text-2xl font-bold text-gray-900">{{organization?.name}}</h1>
                  <p class="text-gray-500">{{organization?.description}}</p>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <button *ngIf="canManageMembers()"
                  (click)="openUpdateDialog()"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Update Organization
                </button>
                <button *ngIf="canManageMembers()"
                  (click)="openAddMemberModal()"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Add Member
                </button>
              </div>
            </div>
          </div>

          <!-- Members Table -->
          <div class="px-6 py-5">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Members</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let member of members">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="text-sm font-medium text-gray-900">
                          {{member.user.name}}
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm text-gray-900">{{member.role}}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button *ngIf="canManageRoles(member.role)"
                        (click)="openUpdateRoleModal(member)"
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Change Role
                      </button>
                      <button *ngIf="canManageRoles(member.role)"
                        (click)="removeMember(member.user._id)"
                        class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        [disabled]="isRemovingMember[member.user._id]">
                        Remove
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div *ngIf="showAddMemberModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900">Add New Member</h3>
          <form [formGroup]="addMemberForm" (ngSubmit)="addMember()" class="mt-4">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                <div *ngIf="isLoadingUsers" class="flex justify-center py-4">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
                <select *ngIf="!isLoadingUsers" 
                        formControlName="userId" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Select a user</option>
                  <option *ngFor="let user of availableUsers" [value]="user._id">
                    {{user.name}} ({{user.email}})
                  </option>
                </select>
                <div *ngIf="!isLoadingUsers && availableUsers.length === 0" class="text-gray-500 text-sm mt-2">
                  No users available to add
                </div>
              </div>


            <div class="w-full mt-4">
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <select formControlName="role" class="mt-1 block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div class="flex justify-end space-x-4 mt-4">
              <button type="button" 
                class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                (click)="showAddMemberModal = false">
                Cancel
              </button>
              <button type="submit"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                [disabled]="!addMemberForm.valid || isLoading">
                Add Member
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Update Role Modal -->
    <div *ngIf="showUpdateRoleModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900">Update Member Role</h3>
          <form [formGroup]="updateRoleForm" (ngSubmit)="updateRole()" class="mt-4">
            <div class="w-full">
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <select formControlName="role" class="mt-1 block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div class="flex justify-end space-x-4 mt-4">
              <button type="button"
                class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                (click)="showUpdateRoleModal = false">
                Cancel
              </button>
              <button type="submit"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                [disabled]="!updateRoleForm.valid || isLoading">
                Update Role
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Update Organization Modal -->
    <div *ngIf="showUpdateOrganizationModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Update Organization</h3>
          <form [formGroup]="updateOrganizationForm" (ngSubmit)="updateOrganization()" class="mt-4">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input type="text"
                     formControlName="name"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                     placeholder="Organization name">
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea formControlName="description"
                        rows="3"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Organization description"></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Logo URL</label>
              <input type="text"
                     formControlName="logo"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                     placeholder="https://example.com/logo.png">
            </div>

            <div class="flex items-center justify-end mt-4 space-x-3">
              <button type="button"
                      (click)="showUpdateOrganizationModal = false"
                      class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                      [disabled]="!updateOrganizationForm.valid || isLoading"
                      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading ? 'Updating...' : 'Update Organization' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class OrganizationDetailsComponent implements OnInit {
  organization: Organization | null = null;
  members: OrganizationMember[] = [];
  isLoading = false;
  isLoadingUsers = false;
  isRemovingMember: { [key: string]: boolean } = {};  // Track loading state per member
  showUpdateRoleModal = false;
  selectedMember: OrganizationMember | null = null;
  updateRoleForm: FormGroup;
  currentUserRole: string = 'member';
  showAddMemberModal = false;
  availableUsers: User[] = [];
  addMemberForm: FormGroup;
  private currentUserId: string | null = null;
  showUpdateOrganizationModal = false;
  updateOrganizationForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.addMemberForm = this.fb.group({
      userId: ['', Validators.required],
      role: ['member', Validators.required]
    });

    this.updateRoleForm = this.fb.group({
      role: ['', Validators.required]
    });

    this.updateOrganizationForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      logo: ['']
    });

    // Subscribe to currentUser$ to get the current user's ID
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?._id ?? null;
    });
  }

  ngOnInit(): void {
    // Load organization details if we have the user and route params
    this.route.params.subscribe(params => {
      const orgId = params['id'];
      if (orgId) {
        this.loadOrganization(orgId);
      }
    });
  }

  loadOrganization(orgId: string) {
    this.organizationService.getOrganizationById(orgId).subscribe({
      next: (response) => {
        this.organization = response.data;
        this.members = response.data.members || [];
        
        // Set current user's role
        if (this.currentUserId) {
          const currentMember = this.members.find(m => m.user._id === this.currentUserId);
          this.currentUserRole = currentMember?.role || 'member';
        }

        this.loadAvailableUsers(orgId);
      },
      error: (error) => {
        console.error('Error loading organization:', error);
      }
    });
  }

  loadAvailableUsers(orgId: string) {
    this.isLoadingUsers = true;
    this.availableUsers = []; // Reset the list before loading

    this.authService.getRemainingUsers(orgId).subscribe({
      next: (response) => {
        console.log('Available users loaded:', response);
        if (response.success) {
          this.availableUsers = response.data;
          console.log('Available users set:', this.availableUsers);
        }
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading available users:', error);
        this.isLoadingUsers = false;
      }
    });
  }

  canManageMembers(): boolean {
    return this.currentUserRole === 'owner' || this.currentUserRole === 'admin';
  }

  canManageRoles(memberRole: string): boolean {
    // Owners can manage all roles except other owners
    if (this.currentUserRole === 'owner') {
      return memberRole !== 'owner';
    }
    // Admins can only manage members, not other admins or owners
    if (this.currentUserRole === 'admin') {
      return memberRole === 'member';
    }
    return false;
  }

  openAddMemberModal() {
    if (!this.canManageMembers() || !this.organization) {
      return;
    }
    
    // Reset the form
    this.addMemberForm.reset({
      userId: '',
      role: 'member'
    });

    // Load available users before showing the modal
    this.loadAvailableUsers(this.organization._id);
    this.showAddMemberModal = true;
  }

  addMember() {
    if (this.organization && this.addMemberForm.valid && !this.isLoading) {
      this.isLoading = true;
      const { userId, role } = this.addMemberForm.value;
      
      this.organizationService.addMember(
        this.organization._id,
        userId,
        role
      ).subscribe({
        next: (response) => {
          if (response) {
            // Update organization data
            this.loadOrganization(this.organization!._id);
            
            // Reset form and close modal
            this.addMemberForm.reset({
              userId: '',
              role: 'member'
            });
            this.showAddMemberModal = false;
          }
        },
        error: (error) => {
          console.error('Error adding member:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  openUpdateRoleModal(member: OrganizationMember) {
    if (!this.canManageRoles(member.role)) {
      return;
    }
    this.selectedMember = member;
    this.updateRoleForm.patchValue({
      role: member.role
    });
    this.showUpdateRoleModal = true;
  }

  updateRole() {
    if (!this.organization || !this.selectedMember || !this.updateRoleForm.valid || this.isLoading) return;

    this.isLoading = true;
    const newRole = this.updateRoleForm.get('role')?.value;

    this.organizationService.updateUserRole(
      this.organization._id,
      this.selectedMember.user._id,
      newRole
    ).subscribe({
      next: (response) => {
        if (response) {
          // Refresh organization data
          this.loadOrganization(this.organization!._id);
          
          // Close modal and reset form
          this.showUpdateRoleModal = false;
          this.selectedMember = null;
          this.updateRoleForm.reset();
        }
      },
      error: (error) => {
        console.error('Failed to update role:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  removeMember(userId: string) {
    if (this.organization && !this.isRemovingMember[userId]) {
      this.isRemovingMember[userId] = true;
      
      this.organizationService.manageOrganizationMember(
        this.organization._id,
        userId,
        'remove'
      ).subscribe({
        next: () => {
          // Refresh organization data
          this.loadOrganization(this.organization!._id);
        },
        error: (error) => {
          console.error('Failed to remove member:', error);
        },
        complete: () => {
          this.isRemovingMember[userId] = false;
        }
      });
    }
  }

  openUpdateDialog() {
    if (!this.organization) return;

    this.updateOrganizationForm.patchValue({
      name: this.organization.name,
      description: this.organization.description,
      logo: this.organization.logo
    });

    this.showUpdateOrganizationModal = true;
  }

  updateOrganization() {
    if (!this.organization || !this.updateOrganizationForm.valid || this.isLoading) return;

    this.isLoading = true;
    const { name, description, logo } = this.updateOrganizationForm.value;

    this.organizationService.updateOrganization(this.organization._id, { name, description, logo })
      .subscribe({
        next: (response) => {
          console.log("updated modal org",response);
          
          if (response) {
            this.organization = response;
            this.showUpdateOrganizationModal = false;
          }
        },
        error: (error) => {
          console.error('Error updating organization:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
}
