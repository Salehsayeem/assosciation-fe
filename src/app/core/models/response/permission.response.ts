export interface PermissionEntry {
  feature_Id: number;
  permissions: string[];
}

export interface PermissionMap {
  [featureName: string]: PermissionEntry;
}

export interface GetPermissionsResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: PermissionMap;
}
