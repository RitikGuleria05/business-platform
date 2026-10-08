export const PaymentMethod = {
    Cash: 1,
    Card: 2,
    UPI: 3,
    BankTransfer: 4,
} as const;

export type PaymentMethod =
    (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
    Pending: 1,
    Paid: 2,
    PartiallyPaid: 3,
    Cancelled: 4,
    Refunded: 5,
} as const;

export type PaymentStatus =
    (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const SaleStatus = {
    Completed: 1,
    Cancelled: 2,
} as const;

export type SaleStatus =
    (typeof SaleStatus)[keyof typeof SaleStatus];


/* =========================
   SALE REQUESTS
========================= */

export interface SaleItemRequest {
    productId: string;
    quantity: number;
    discount: number;
}

export interface PaymentRequest {
    amount: number;
    method: PaymentMethod;
    transactionReference: string | null;
}

export interface CreateSaleRequest {
    customerId: string;
    discount: number;
    tax: number;
    remarks: string | null;
    items: SaleItemRequest[];
    payments: PaymentRequest[];
}


/* =========================
   SALE RESPONSES
========================= */

export interface PaymentResponse {
    id: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionReference: string | null;
    paymentDate: string;
}

export interface SaleItemResponse {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    total: number;
}

export interface SaleResponse {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    saleDate: string;
    subTotal: number;
    discount: number;
    tax: number;
    grandTotal: number;
    paymentStatus: PaymentStatus;
    status: SaleStatus;
    remarks: string | null;
    items: SaleItemResponse[];
    payments: PaymentResponse[];
}


/* =========================
   SALE RETURN REQUESTS
========================= */

export interface CreateSaleReturnItemRequest {
    productId: string;
    quantity: number;
}

export interface CreateSaleReturnRequest {
    saleId: string;
    reason: string | null;
    items: CreateSaleReturnItemRequest[];
}


/* =========================
   SALE RETURN RESPONSES
========================= */

export interface SaleReturnItemResponse {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface SaleReturnResponse {
    id: string;
    saleId: string;
    returnNumber: string;
    returnDate: string;
    totalAmount: number;
    status: number;
    reason: string | null;
    items: SaleReturnItemResponse[];
}