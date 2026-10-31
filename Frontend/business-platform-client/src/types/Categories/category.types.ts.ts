export interface Category {
    createdAt: string | number | Date;
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string | null;
}

export interface UpdateCategoryRequest {
    name: string;
    description?: string | null;
    isActive: boolean;
}