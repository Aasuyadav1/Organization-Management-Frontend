import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrganization, Organization, UpdateOrganization } from '../interfaces/organization.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  constructor(private http: HttpClient) {}

  createOrganization(data: CreateOrganization): Observable<{ success: boolean; message: string; data: { organization: Organization } }> {
    return this.http.post<any>(`${environment.apiUrl}/organizations`, data);
  }

  getUserOrganizations(): Observable<{ success: boolean; message: string; data: { organizations: Organization[] } }> {
    return this.http.get<any>(`${environment.apiUrl}/organizations/all`);
  }

  getOrganizationMembers(orgId: string): Observable<{ success: boolean; message: string; data: { members: Organization['members'] } }> {
    return this.http.get<any>(`${environment.apiUrl}/organizations/${orgId}/members`);
  }

  updateOrganization(orgId: string, data: UpdateOrganization): Observable<{ success: boolean; message: string; data: { organization: Organization } }> {
    return this.http.put<any>(`${environment.apiUrl}/organizations/${orgId}`, data);
  }

  deleteOrganization(orgId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${environment.apiUrl}/organizations/${orgId}`);
  }

  updateUserRole(orgId: string, userId: string, role: string): Observable<{
    success: boolean;
    message: string;
    data: Organization;
  }> {
    return this.http.put<{
      success: boolean;
      message: string;
      data: Organization;
    }>(`${environment.apiUrl}/organizations/${orgId}/users/${userId}/role`, { role });
  }

  manageOrganizationMember(orgId: string, userId: string, action: 'add' | 'remove', role?: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<any>(`${environment.apiUrl}/organizations/${orgId}/users/${userId}`, { action, role });
  }

  addMember(organizationId: string, userId: string, role: string): Observable<{
    success: boolean;
    message: string;
    data: Organization;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: Organization;
    }>(`${environment.apiUrl}/organizations/${organizationId}/users/${userId}`, {
      role,
      action: 'add'
    });
  }

  getOrganizationById(orgId: string): Observable<{ success: boolean; message: string; data: Organization }> {
    return this.http.get<any>(`${environment.apiUrl}/organizations/${orgId}`);
  }

  getRemainingUsers(orgId: string): Observable<{ success: boolean; message: string; data: { users: any[] } }> {
    return this.http.get<any>(`${environment.apiUrl}/organizations/${orgId}/remaining-users`);
  }
}
