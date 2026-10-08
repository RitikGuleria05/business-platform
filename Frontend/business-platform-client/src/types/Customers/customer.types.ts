export interface Customer {
    name: string;
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    isActive: boolean;
}

export interface CreateCustomerRequest {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
}

export interface UpdateCustomerRequest {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    isActive: boolean;
}