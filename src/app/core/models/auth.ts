export interface LoginRequest { email: string; password: string }
export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshTokenExpiresIn: number;
}
export interface LoginResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: {
    userId: string;
    email: string;
    applicationId: number;
    token: TokenInfo;
  };
}

export interface DecodedToken {
  UserId: string;
  Email: string;
  Permissions: string; // JSON string
  jti: string;
  iat: number;
  applicationId: string; // from token payload
  exp: number;
  iss: string;
  aud: string;
}
