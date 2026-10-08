export interface SalesReportItem {
    saleId: string;
    invoiceNumber: string;
    saleDate: string;
    customerName: string;
    subTotal: number;
    discount: number;
    tax: number;
    grandTotal: number;
    paymentStatus: string;
}

export interface SalesReport {
    grossSales: number;
    totalReturns: number;
    netSales: number;
    totalOrders: number;
    averageOrderValue: number;
    sales: SalesReportItem[];
}

export interface ProductReportItem {
    productId: string;
    productName: string;
    sku: string;
    categoryName: string;
    currentStock: number;
    quantitySold: number;
    grossRevenue: number;
    quantityReturned: number;
    returnAmount: number;
    netQuantitySold: number;
    netRevenue: number;
}

export interface ProductReport {
    from: string;
    to: string;
    products: ProductReportItem[];
}

export interface InventoryReportItem {
    productId: string;
    productName: string;
    sku: string;
    categoryName: string;
    currentStock: number;
    reorderLevel: number;
    minimumStock: number;
    maximumStock: number;
    costPrice: number;
    sellingPrice: number;
    stockValue: number;
    stockStatus: string;
}

export interface InventoryReport {
    totalProducts: number;
    inStockProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalStockValue: number;
    products: InventoryReportItem[];
}


export interface CustomerReportItem {
    customerId: string; 
    customerName: string; 
    totalOrders: number; 
    totalPurchase: number; 
    totalReturns: number; 
    netPurchase: number; 
    averageOrderValue: number; 
    lastPurchaseDate: string;
}

export interface CustomerReport {
   from: string; 
   to: string; 
   totalCustomers: number; 
   totalSales: number; 
   totalReturns: number; 
   netSales: number; 
   customers: CustomerReportItem[];
}