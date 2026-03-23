export interface Role {
  roleId: string;
  applicationId: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllRolesResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: Role[];
}
