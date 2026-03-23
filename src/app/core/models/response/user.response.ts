export interface UserProfile {
  userId: string;
  applicationId: number;
  username: string;
  email: string;
  profileData: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: UserProfile;
}

// Users listing
export interface UserListItem {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  status: string;
  updatedAt?: string;
}

export interface UsersResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: UserListItem[];
}

export type GetAllUsersResponse = UsersResponse;

export interface PermissionFlags {
  isCreate: boolean;
  isDelete: boolean;
  isRead: boolean;
}

export interface UserFeaturePermission {
  featureId: number;
  featureName: string;
  permissions: PermissionFlags[];
}

export interface UserWithRolesItem extends UserListItem {
  applicationId: number;
  createdAt: string;
  roles: string[];
  permissions: UserFeaturePermission[];
}

export interface GetUsersWithRolesResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: UserWithRolesItem[];
}

// User Details
export interface UserDetails {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  profileData: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  roles: string;
  featurePermissions: string;
  applicationId: number;
  appSpecificData: string;
}

export interface UserDetailsResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: UserDetails;
}