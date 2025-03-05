export interface UserEnrollment{
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userRoles: string[];
    companyName?: string;
  }