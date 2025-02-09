import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationMember } from '../../interfaces/organization.interface';

@Component({
  selector: 'app-organization-members-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-4 sm:px-6 py-4 sm:py-5">
      <h2 class="text-lg sm:text-xl font-medium text-gray-900 mb-4">Members</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let member of members">
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8">
                    <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{member.user.name}}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{member.user.email}}</div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800': member.role === 'owner',
                        'bg-blue-100 text-blue-800': member.role === 'admin',
                        'bg-gray-100 text-gray-800': member.role === 'member'
                      }">
                  {{member.role}}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button *ngIf="canManageRoles(member.role)"
                          (click)="onUpdateRole(member)"
                          class="text-sm py-2 px-4 rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors">
                    Change Role
                  </button>
                  <button *ngIf="canManageRoles(member.role)"
                          (click)="onRemoveMember(member)"
                          [disabled]="isRemovingMember[member.user._id]"
                          class="text-sm py-2 px-4 rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors disabled:opacity-50">
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class OrganizationMembersTableComponent {
  @Input() members: OrganizationMember[] = [];
  @Input() isRemovingMember: { [key: string]: boolean } = {};
  @Input() canManageRoles!: (role: string) => boolean;

  @Output() updateRole = new EventEmitter<OrganizationMember>();
  @Output() removeMember = new EventEmitter<OrganizationMember>();

  onUpdateRole(member: OrganizationMember) {
    this.updateRole.emit(member);
  }

  onRemoveMember(member: OrganizationMember) {
    this.removeMember.emit(member);
  }
}
