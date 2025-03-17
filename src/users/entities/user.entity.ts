export class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "admin" | "worker";
  code: string;
  registrationDate: Date;
  password: string;
}