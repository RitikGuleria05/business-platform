export interface Inventory {
    productId: string;
    productName: string;
    sku: string;
    quantityInStock: number;
    minimumStock: number;
    maximumStock: number;
    reorderLevel: number;
    lastUpdated?: string | null;
}

export interface UpdateInventoryRequest {
    minimumStock: number;
    maximumStock: number;
    reorderLevel: number;
}

export interface IncreaseStockRequest {
    productId: string;
    quantity: number;
}

export interface DecreaseStockRequest {
    productId: string;
    quantity: number;
}

export interface AdjustStockRequest {
    productId: string;
    newQuantity: number;
    reason?: string | null;
}