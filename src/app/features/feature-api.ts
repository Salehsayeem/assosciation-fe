import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClientService } from '../core/services/api-client.service';
import { GetAllUsersResponse, GetUsersWithRolesResponse, ProfileResponse } from '../core/models/response/user.response';
import { GetAllRolesResponse } from '../core/models/response/role.response';
import { GetPermissionsResponse } from '../core/models/response/permission.response';

export interface FeatureOption {
  featureId: number;
  name: string;
  description: string;
  status: string;
}

export interface GetAvailableFeaturesResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: FeatureOption[];
}

export interface FeatureListItem {
  featureId: number;
  name: string;
  description: string;
  status: string;
  isActive: boolean;
}

export interface GetFeatureListResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: FeatureListItem[];
}

@Injectable({
  providedIn: 'root',
})
export class FeatureApiService {
  private readonly api = inject(ApiClientService);

    getUserProfile(userId: string, applicationId: number): Observable<ProfileResponse> {
    return this.api.get<ProfileResponse>(
      `User/profile?id=${encodeURIComponent(userId)}&applicationId=${applicationId}`
    );
    
  }
  getAllUsers(): Observable<GetAllUsersResponse> {
    return this.api.get<GetAllUsersResponse>(
      `User/users`
    );
  }

  getUsersWithRoles(): Observable<GetUsersWithRolesResponse> {
    return this.api.get<GetUsersWithRolesResponse>('User/users-with-roles');
  }

  getFeatureList(): Observable<GetFeatureListResponse> {
    return this.api.get<GetFeatureListResponse>('User/features/list');
  }

  getAllRoles(): Observable<GetAllRolesResponse> {
    return this.api.get<GetAllRolesResponse>('User/roles');
  }

  getPermissionsByRole(roleId: string): Observable<GetPermissionsResponse> {
    return this.api
      .get<any>(`User/permissions?roleId=${encodeURIComponent(roleId)}`)
      .pipe(
        map((res: any) => {
          if (res && typeof res.data === 'string') {
            try {
              res.data = JSON.parse(res.data);
            } catch {
              res.data = {};
            }
          }
          return res as GetPermissionsResponse;
        })
      );
  }

  getAvailableFeatures(applicationId: number): Observable<GetAvailableFeaturesResponse> {
    return this.api.get<GetAvailableFeaturesResponse>(
      `User/features?applicationId=${encodeURIComponent(String(applicationId))}`
    );
  }

  getUserDetails(userId: string): Observable<import('../core/models/response/user.response').UserDetailsResponse> {
    return this.api.get<import('../core/models/response/user.response').UserDetailsResponse>(
      `User/user_details?userId=${encodeURIComponent(userId)}`
    );
  }

  getUserStatuses(): Observable<string[]> {
    return this.api.get<any>(`User/user_status`).pipe(
      map((res: any) => (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []))
    );
  }

  updateUser(body: {
    userId: string;
    email: string;
    applicationId: number;
    firstName: string;
    lastName: string;
    roleId: string;
    phoneNumber: string;
    status: string;
  }): Observable<any> {
    return this.api.put<any>('User/UpdateUser', body);
  }

  createUser(body: {
    userId: string;
    email: string;
    applicationId: number;
    firstName: string;
    lastName: string;
    roleId: string;
    phoneNumber: string;
  }): Observable<any> {
    return this.api.post<any>('User/CreateUser', body);
  }

  createOrUpdateRole(body: {
    roleId: string;
    applicationId: number;
    name: string;
    description: string;
  }): Observable<any> {
    return this.api.post<any>('User/CreateOrUpdateRole', body);
  }

  deleteRole(roleId: string): Observable<any> {
    // Using GET to match provided endpoint signature
    return this.api.delete<any>(`User/DeleteRole?roleId=${encodeURIComponent(roleId)}`);
  }

  /**
   * Remove a user by ID.
   * Backend expects a call to: `User/RemoveUser?userId=<id>`.
   */
  removeUser(userId: string): Observable<any> {
    // Using GET to match the provided endpoint; switch to DELETE if backend supports it.
    return this.api.delete<any>(`User/RemoveUser?userId=${encodeURIComponent(userId)}`);
  }

  manageRolePermissions(body: {
    roleId: string;
    featurePermissions: {
      featureId: number;
      featureName: string;
      permissions: { isCreate: boolean; isDelete: boolean; isRead: boolean }[];
    }[];
  }): Observable<any> {
    return this.api.post<any>('User/manage-role-permissions', body);
  }

  manageUserPermissions(body: {
    userId: string;
    featurePermissions: {
      featureId: number;
      featureName: string;
      permissions: { isCreate: boolean; isDelete: boolean; isRead: boolean }[];
    }[];
  }): Observable<any> {
    return this.api.post<any>('User/manage-user-permissions', body);
  }

  createOrUpdateFeature(body: {
    featureId: number;
    name: string;
    description: string;
    status: string;
  }): Observable<any> {
    return this.api.post<any>('User/features', body);
  }

  deleteFeature(featureId: number): Observable<any> {
    return this.api.delete<any>(`User/features/${encodeURIComponent(String(featureId))}`);
  }
}


