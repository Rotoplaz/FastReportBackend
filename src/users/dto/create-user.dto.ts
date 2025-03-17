
export class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    role: "student" | "admin" | "worker";
    code: string;
}
