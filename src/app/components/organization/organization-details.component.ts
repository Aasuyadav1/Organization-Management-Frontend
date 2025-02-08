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
              <div *ngIf="canManageMembers()">
                <button (click)="openAddMemberModal()"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
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
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let member of members">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img [src]="member.user.profilePicture || 'assets/default-avatar.png'" 
                          class="h-8 w-8 rounded-full" alt="User avatar">
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{member.user.name}}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{member.user.email}}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': member.role === 'owner',
                          'bg-blue-100 text-blue-800': member.role === 'admin',
                          'bg-gray-100 text-gray-800': member.role === 'member'
                        }">
                        {{member.role}}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex space-x-4 justify-end">
                        <button *ngIf="canManageRoles(member.role)"
                                (click)="openUpdateRoleModal(member)"
                                [disabled]="isRemovingMember[member.user._id]"
                                class="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400">
                          Update Role
                        </button>
                        <button *ngIf="canManageRoles(member.role)"
                                (click)="removeMember(member.user._id)"
                                [disabled]="isRemovingMember[member.user._id]"
                                class="text-red-600 hover:text-red-900 disabled:text-gray-400 flex items-center space-x-1">
                          <span>{{ isRemovingMember[member.user._id] ? 'Removing...' : 'Remove' }}</span>
                          <div *ngIf="isRemovingMember[member.user._id]" 
                               class="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Add Member Modal -->
        <div *ngIf="showAddMemberModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-xl font-semibold mb-4">Add New Member</h2>
            <form [formGroup]="addMemberForm" (ngSubmit)="addMember()">
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
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select formControlName="role"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div class="flex justify-end space-x-3">
                <button type="button" 
                        (click)="showAddMemberModal = false"
                        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                        [disabled]="!addMemberForm.valid || isLoading"
                        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                  {{isLoading ? 'Adding...' : 'Add Member'}}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Update Role Modal -->
        <div *ngIf="showUpdateRoleModal && selectedMember" 
             class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-xl font-semibold mb-4">Update Role for {{selectedMember.user.name}}</h2>
            <form [formGroup]="updateRoleForm" (ngSubmit)="updateRole()">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select formControlName="role"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div class="flex justify-end space-x-3">
                <button type="button" 
                        (click)="showUpdateRoleModal = false"
                        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                        [disabled]="!updateRoleForm.valid || isLoading"
                        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                  {{isLoading ? 'Updating...' : 'Update Role'}}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
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

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.addMemberForm = this.fb.group({
      userId: ['', Validators.required],
      role: ['member', Validators.required]
    });

    this.updateRoleForm = this.fb.group({
      role: ['', Validators.required]
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
    this.authService.getRemainingUsers(orgId).subscribe({
      next: (response) => {
        console.log('Available users loaded:', response);
        if (response.success) {
          this.availableUsers = response.data.users;
        }
      },
      error: (error) => {
        console.error('Error loading available users:', error);
        this.availableUsers = [];
      },
      complete: () => {
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
    if (!this.canManageMembers()) {
      return;
    }
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
}
