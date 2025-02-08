export interface User {
  _id: string;
  id?: string;  // Optional id field for API compatibility
  name: string;
  email: string;
  profilePicture?: string;
  organizations: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
  };
}
