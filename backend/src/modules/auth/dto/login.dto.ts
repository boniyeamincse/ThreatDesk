export class LoginDto {
  email!: string;
  password!: string;
}

export class JwtPayload {
  sub!: string;
  email!: string;
  roleId!: string;
  roleName!: string;
  iat?: number;
  exp?: number;
}

export class AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
