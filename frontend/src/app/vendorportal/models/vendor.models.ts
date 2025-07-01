export interface RFQ {
    id: string;
    vendorNumber: string;
    documentNumber: string;
    documentType: string;
    date: Date;
    purchasingOrg: string;
    purchasingGroup: string;
    itemNumber: string;
    material: string;
    storageLocation: string;
    description?: string;
    priceUnit: string;
    quantity: string;
    unit: string;
    subject?: string;
    status?: string;
}

export interface PurchaseOrder {
    id: string;
    vendorNumber: string;
    documentNumber: string;
    companyCode: string;
    purchasingOrg: string;
    purchasingGroup: string;
    documentCategory: string;
    documentType: string;
    itemNumber: string;
    material: string;
    quantity: string;
    unit: string;
    priceUnit: string;
    date: Date;
    total: number;
    status: string;
}

export interface GoodsReceipt {
    id: string;
    vendorNumber: string;
    documentNumber: string;
    documentYear: string;
    postingDate: Date;
    documentDate: Date;
    createdBy: string;
    trackingNumber: string;
    itemNumber: string;
    movementType: string;
    purchaseOrderNumber: string;
    purchaseOrderItem: string;
    storageLocation: string;
    batchNumber: string;
    quantity: string;
    unit: string;
    eta?: Date;
    status?: string;
}

export interface CreditDebitMemo {
    BELNR: string;
    BUDAT: string;
    WRBTR: string;
    WAERS: string;
    BLART: string;
    SHKZG: string;
    vendorNumber: string;
    fiscalYear: string;
    companyCode: string;
    username: string;
    transactionCode: string;
    generalLedger: string;
    paymentKey: string;
    lineItem: string;
}

