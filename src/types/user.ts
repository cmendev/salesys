export type User = {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    full_name: string;
    is_active: boolean;
};
  
export enum UserRole {
    Admin = 'Admin',
    Seller = 'Seller',
    Manager = 'Manager'
}