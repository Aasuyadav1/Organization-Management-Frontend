import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef } from '../../services/dialog.service';
import { Organization } from '../../interfaces/organization.interface';

@Component({
  selector: 'app-update-organization-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Update Organization</h2>
        <button 
          (click)="dialogRef.close()" 
          class="text-gray-500 hover:text-gray-700"
          aria-label="Close dialog">
          ✕
        </button>
      </div>
      
      <form [formGroup]="updateForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
        <div class="form-group">
          <label for="name" class="block mb-2">Organization Name</label>
          <input 
            type="text" 
            id="name"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            formControlName="name" 
            placeholder="Enter organization name">
          <div *ngIf="updateForm.get('name')?.hasError('required') && updateForm.get('name')?.touched" 
               class="text-red-500 text-sm mt-1">
            Name is required
          </div>
        </div>

        <div class="form-group">
          <label for="description" class="block mb-2">Description</label>
          <textarea 
            id="description"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            formControlName="description" 
            placeholder="Enter organization description"
            rows="3"></textarea>
        </div>

        <div class="form-group">
          <label for="logo" class="block mb-2">Logo URL</label>
          <input 
            type="text" 
            id="logo"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            formControlName="logo" 
            placeholder="Enter logo URL">
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button 
            type="button"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            (click)="dialogRef.close()">
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            [disabled]="!updateForm.valid">
            Update
          </button>
        </div>
      </form>
    </div>
  `
})
export class UpdateOrganizationDialogComponent implements OnInit {
  updateForm: FormGroup;
  @Input() data!: { organization: Organization };
  @Input() dialogRef!: DialogRef;

  constructor(private fb: FormBuilder) {
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      logo: ['']
    });
  }

  ngOnInit() {
    if (this.data?.organization) {
      this.updateForm.patchValue({
        name: this.data.organization.name,
        description: this.data.organization.description,
        logo: this.data.organization.logo
      });
    }
  }

  onSubmit() {
    if (this.updateForm.valid) {
      this.dialogRef.close(this.updateForm.value);
    }
  }
}
