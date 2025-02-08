import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Organization, OrganizationMember } from '../../interfaces/organization.interface';
import { User } from '../../interfaces/user.interface';
import { OrganizationService } from '../../services/organization.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { DialogService } from '../../services/dialog.service';
import { UpdateOrganizationDialogComponent } from './update-organization-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-organization-details',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatSelectModule
  ],
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
                  mat-icon-button>
                  <mat-icon>settings</mat-icon>
                </button>
                <button *ngIf="canManageMembers()"
                  (click)="openAddMemberModal()"
                  mat-raised-button
                  color="primary">
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
                        mat-button
                        color="primary">
                        Change Role
                      </button>
                      <button *ngIf="canManageRoles(member.role)"
                        (click)="removeMember(member.user._id)"
                        mat-button
                        color="warn"
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
            <mat-form-field class="w-full">
              <mat-label>Select User</mat-label>
              <mat-select formControlName="userId">
                <mat-option *ngFor="let user of availableUsers" [value]="user._id">
                  {{user.name}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="w-full mt-4">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                <mat-option value="member">Member</mat-option>
                <mat-option value="admin">Admin</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="flex justify-end space-x-4 mt-4">
              <button type="button" 
                mat-button
                (click)="showAddMemberModal = false">
                Cancel
              </button>
              <button type="submit"
                mat-raised-button
                color="primary"
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
            <mat-form-field class="w-full">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                <mat-option value="member">Member</mat-option>
                <mat-option value="admin">Admin</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="flex justify-end space-x-4 mt-4">
              <button type="button"
                mat-button
                (click)="showUpdateRoleModal = false">
                Cancel
              </button>
              <button type="submit"
                mat-raised-button
                color="primary"
                [disabled]="!updateRoleForm.valid || isLoading">
                Update Role
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

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private router: Router,
    private dialog: DialogService,
    private fb: FormBuilder
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
    this.availableUsers = []; // Reset the list before loading

    this.organizationService.getRemainingUsers(orgId).subscribe({
      next: (response) => {
        console.log('Available users response:', response);
        if (response.success && response.data?.users) {
          this.availableUsers = response.data.users;
          console.log('Available users loaded:', this.availableUsers);
        } else {
          console.warn('No users data in response:', response);
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

    const dialogRef = this.dialog.open(UpdateOrganizationDialogComponent, {
      data: { organization: this.organization },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: { name: string; description?: string; logo?: string } | undefined) => {
      if (result) {
        this.updateOrganization(result);
      }
    });
  }

  private updateOrganization(data: { name: string; description?: string; logo?: string }) {
    if (!this.organization?._id) return;

    this.organizationService.updateOrganization(this.organization._id, data)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.organization = response.data.organization;
          }
        },
        error: (error) => {
          console.error('Error updating organization:', error);
        }
      });
  }
}
