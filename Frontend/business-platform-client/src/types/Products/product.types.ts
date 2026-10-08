export interface Product {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    categoryId: string;
    categoryName: string;
    costPrice: number;
    sellingPrice: number;
    isActive: boolean;
    quantityInStock: number;
    minimumStock: number;
    maximumStock: number;
    reorderLevel: number;
}

export interface CreateProductRequest {
    name: string;
    sku: string;
    barcode?: string | null;
    description?: string | null;

    categoryId: string;

    costPrice: number;
    sellingPrice: number;

    initialStock: number;
    minimumStock: number;
    maximumStock: number;
    reorderLevel: number;
}

export interface UpdateProductRequest {
    name: string;
    sku: string;
    barcode?: string | null;
    description?: string | null;

    categoryId: string;

    costPrice: number;
    sellingPrice: number;

    isActive: boolean;
}