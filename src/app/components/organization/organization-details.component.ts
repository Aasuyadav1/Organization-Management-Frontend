import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Organization, OrganizationMember } from '../../interfaces/organization.interface';
import { User } from '../../interfaces/user.interface';
import { OrganizationService } from '../../services/organization.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { OrganizationHeaderComponent } from './organization-header.component';
import { OrganizationMembersTableComponent } from './organization-members-table.component';

@Component({
  selector: 'app-organization-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrganizationHeaderComponent, OrganizationMembersTableComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow rounded-lg">
          <!-- Organization Header -->
          <app-organization-header
            [organization]="organization"
            [isOwner]="isOwner()"
            [canManageMembers]="canManageMembers()"
            (updateOrganization)="openUpdateDialog()"
            (deleteOrganization)="openDeleteConfirmModal()"
            (addMember)="openAddMemberModal()">
          </app-organization-header>

          <!-- Members Table -->
          <app-organization-members-table
            [members]="members"
            [isRemovingMember]="isRemovingMember"
            [canManageRoles]="canManageRoles.bind(this)"
            (updateRole)="openUpdateRoleModal($event)"
            (removeMember)="openRemoveConfirmModal($event)">
          </app-organization-members-table>
        </div>
      </div>

      <!-- Add Member Modal -->
      <div *ngIf="showAddMemberModal" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black opacity-40"></div>
        <div class="relative z-50 h-full flex items-center justify-center p-4">
          <div class="bg-white rounded-lg w-96 p-6 shadow-xl">
            <div class="mt-2">
              <h3 class="text-lg text-gray-900 mb-4">Add New Member</h3>
              <form [formGroup]="addMemberForm" (ngSubmit)="addMember()" class="mt-4">
                <div class="mb-4">
                    <label class="block text-sm text-gray-700 mb-2">Select User</label>
                    <div *ngIf="isLoadingUsers" class="flex justify-center py-4">
                      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                    <select *ngIf="!isLoadingUsers" 
                            formControlName="userId" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="">Select a user</option>
                      <option *ngFor="let user of availableUsers" [value]="user._id">
                        {{user.name}} ({{user.email}})
                      </option>
                    </select>
                    <div *ngIf="!isLoadingUsers && availableUsers.length === 0" class="text-gray-500 text-sm mt-2">
                      No users available to add
                    </div>
                </div>

                <div class="mb-4">
                  <label class="block text-sm text-gray-700 mb-2">Role</label>
                  <select formControlName="role" 
                          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div class="flex justify-end space-x-3 mt-6">
                  <button type="button" 
                    class="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    (click)="showAddMemberModal = false">
                    Cancel
                  </button>
                  <button type="submit"
                    class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
                    [disabled]="!addMemberForm.valid || isLoading">
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Role Modal -->
      <div *ngIf="showUpdateRoleModal" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black opacity-40"></div>
        <div class="relative z-50 h-full flex items-center justify-center p-4">
          <div class="bg-white rounded-lg w-96 p-6 shadow-xl">
            <div class="mt-2">
              <h3 class="text-lg text-gray-900 mb-4">Update Member Role</h3>
              <form [formGroup]="updateRoleForm" (ngSubmit)="updateRole()" class="mt-4">
                <div class="mb-4">
                  <label class="block text-sm text-gray-700 mb-2">Role</label>
                  <select formControlName="role" 
                          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div class="flex justify-end space-x-3 mt-6">
                  <button type="button"
                    class="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    (click)="showUpdateRoleModal = false">
                    Cancel
                  </button>
                  <button type="submit"
                    class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
                    [disabled]="!updateRoleForm.valid || isLoading">
                    Update Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Remove Confirmation Modal -->
      <div *ngIf="showRemoveConfirmModal" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black opacity-40"></div>
        <div class="relative z-50 h-full flex items-center justify-center p-4">
          <div class="bg-white rounded-lg w-96 p-6 shadow-xl">
            <div class="mt-2">
              <h3 class="text-lg text-gray-900 mb-2">Remove Member</h3>
              <p class="text-sm text-gray-600 mb-4">
                Are you sure you want to remove {{memberToRemove?.user?.name ?? 'this member'}} from this organization?
              </p>
              <div class="flex justify-end space-x-3">
                <button type="button"
                        (click)="showRemoveConfirmModal = false"
                        class="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                  Cancel
                </button>
                <button type="button"
                        (click)="confirmRemoveMember()"
                        [disabled]="isRemovingMember[memberToRemove?.user?._id ?? '']"
                        class="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Organization Confirmation Modal -->
      <div *ngIf="showDeleteConfirmModal" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black opacity-40"></div>
        <div class="relative z-50 h-full flex items-center justify-center p-4">
          <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Delete Organization</h3>
            <p class="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this organization? This action cannot be undone and all data associated with this organization will be permanently deleted.
            </p>
            <div class="flex justify-end space-x-4">
              <button
                (click)="showDeleteConfirmModal = false"
                class="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                (click)="deleteOrganization()"
                [disabled]="isDeleting"
                class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {{isDeleting ? 'Deleting...' : 'Delete'}}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Organization Modal -->
      <div *ngIf="showUpdateOrganizationModal" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black opacity-40"></div>
        <div class="relative z-50 h-full flex items-center justify-center p-4">
          <div class="bg-white rounded-lg w-96 p-6 shadow-xl">
            <div class="mt-2">
              <h3 class="text-lg text-gray-900 mb-4">Update Organization</h3>
              <form [formGroup]="updateOrganizationForm" (ngSubmit)="updateOrganization()" class="mt-4">
                <div class="mb-4">
                  <label class="block text-sm text-gray-700 mb-2">Name</label>
                  <input type="text"
                         formControlName="name"
                         class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                         placeholder="Organization name">
                </div>

                <div class="mb-4">
                  <label class="block text-sm text-gray-700 mb-2">Description</label>
                  <textarea formControlName="description"
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Organization description"></textarea>
                </div>

                <div class="flex justify-end space-x-3 mt-6">
                  <button type="button"
                          (click)="showUpdateOrganizationModal = false"
                          class="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                          [disabled]="!updateOrganizationForm.valid || isLoading"
                          class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50">
                    {{ isLoading ? 'Updating...' : 'Update Organization' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
  isRemovingMember: { [key: string]: boolean } = {};
  showUpdateRoleModal = false;
  showRemoveConfirmModal = false;
  memberToRemove: OrganizationMember | null = null;
  selectedMember: OrganizationMember | null = null;
  updateRoleForm: FormGroup;
  currentUserRole: string = 'member';
  showAddMemberModal = false;
  availableUsers: User[] = [];
  addMemberForm: FormGroup;
  private currentUserId: string | null = null;
  showUpdateOrganizationModal = false;
  updateOrganizationForm: FormGroup;
  showDeleteConfirmModal = false;
  isDeleting = false;

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
      description: ['']
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

  isOwner(): boolean {
    if (!this.organization || !this.currentUserId) return false;
    const currentMember = this.members.find(m => m.user._id === this.currentUserId);
    return currentMember?.role === 'owner';
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

  openRemoveConfirmModal(member: OrganizationMember) {
    if (!this.canManageRoles(member.role)) {
      return;
    }
    this.memberToRemove = member;
    this.showRemoveConfirmModal = true;
  }

  confirmRemoveMember() {
    if (this.organization && this.memberToRemove) {
      this.isRemovingMember[this.memberToRemove.user._id] = true;
      
      this.organizationService.manageOrganizationMember(this.organization._id, this.memberToRemove.user._id, 'remove').subscribe({
        next: () => {
          // Remove member from local array
          this.members = this.members.filter(m => m.user._id !== this.memberToRemove?.user._id);
          this.showRemoveConfirmModal = false;
          this.memberToRemove = null;
          this.isRemovingMember[this.memberToRemove!.user._id] = false;
        },
        error: (error) => {
          console.error('Failed to remove member:', error);
        },
        complete: () => {
        }
      });
    }
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
    
    // Only allow owners to update the organization
    if (!this.isOwner()) {
      console.warn('Only organization owners can update the organization');
      return;
    }

    this.updateOrganizationForm.patchValue({
      name: this.organization.name,
      description: this.organization.description
    });

    this.showUpdateOrganizationModal = true;
  }

  updateOrganization() {
    if (!this.organization || !this.isOwner()) {
      console.warn('Only organization owners can update the organization');
      return;
    }
    if (!this.updateOrganizationForm.valid || this.isLoading) return;

    this.isLoading = true;
    const { name, description } = this.updateOrganizationForm.value;

    this.organizationService.updateOrganization(this.organization._id, { name, description })
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

  openDeleteConfirmModal() {
    if (!this.isOwner()) {
      console.warn('Only organization owners can delete the organization');
      return;
    }
    this.showDeleteConfirmModal = true;
  }

  deleteOrganization() {
    if (!this.organization || !this.isOwner()) {
      console.warn('Only organization owners can delete the organization');
      return;
    }

    this.isDeleting = true;
    this.organizationService.deleteOrganization(this.organization._id).subscribe({
      next: (response) => {
        console.log('Organization deleted successfully');
        // Navigate to organizations list or home page
        this.router.navigate(['/organizations']);
      },
      error: (error) => {
        console.error('Failed to delete organization:', error);
        this.isDeleting = false;
      }
    });
  }
}
