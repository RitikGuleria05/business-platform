export interface DashboardSummary {
    todaySales: number;
    todayOrders: number;
    todayReturns: number;
    totalCustomers: number;
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
}

export interface SalesTrend {
    date: string;
    orders: number;
    revenue: number;
}

export interface TopProduct {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
}

export interface LowStockProduct {
    productId: string;
    productName: string;
    sku: string;
    categoryName: string;
    currentStock: number;
    reorderLevel: number;
    minimumStock: number;
    maximumStock: number;
    stockStatus: string;
}