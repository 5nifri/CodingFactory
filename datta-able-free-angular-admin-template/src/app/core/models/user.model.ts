export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  enabled: boolean;
  interests: string[];
}

export interface UserUpdateRequest {
  role?: Role;
  enabled?: boolean;
}
