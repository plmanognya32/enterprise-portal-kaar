//customer.model.ts
export interface CustomerProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    companyName?: string;
    joinDate: Date;
}

export interface Order {
    id: number;
    documentNumber: string;
    customerNumber: string;
    date: Date;
    dueDate: Date | null;
    subject: string;
    description: string;
    currency: string;
    position: string;
    quantity: string;
    units: string;
    netValue: number;
    status: string;
}

export interface Inquiry {
    id: string;
    documentNumber: string;
    customerNumber: string;
    date: Date;
    dueDate: Date | null;
    subject: string;
    description: string;
    currency: string;
    quantity: number;
    unit: string;
    netValue: number;
    status: string;
}

export interface Sales {
    id: string;
    documentNumber: string;
    customerNumber: string;
    position: string;
    date: Date | null;
    requestDeliveryDate: Date | null;
    material: string;
    description: string;
    quantity: string;
    unit: string;
    netValue: string;
    currency: string;
    orderType: string;
    reference: string;
    processingStatus: string;
    deliveryStatus: string;
    storageLocation: string;
    division: string;
    status: string;
}

export interface Delivery {
    id: string;
    documentNumber: string;
    customerNumber: string;
    shippingPoint: string;
    deliveryType: string;
    deliveryDate: Date | null;
    goodsIssueDate: Date | null;
    salesOrganization: string;
    createdBy: string;
    creationDate: Date | null;
    position: string;
    material: string;
    description: string;
    quantity: string;
    unit: string;
    plant: string;
    storageLocation: string;
    status: string;
}

export interface Payment {
    id: string;
    documentNumber: string;
    customerNumber: string;
    postingDate: Date | null;
    billingDate: Date | null;
    dueDate: Date | null;
    amount: number;
    currency: string;
    status: string;
    aging: number;
}

export interface Memo {
    id: string;
    documentNumber: string;
    customerNumber: string;
    postingDate: Date | null;
    billingDate: Date | null;
    dueDate: Date | null;
    amount: number;
    currency: string;
    type: string;
    status: string;
    aging: number;
    billingType: string;
}

export interface InvoicePage {
    id: string;
    invoiceNumber: string;
    itemNumber: string;
    customerNumber: string;
    billingDate: Date | null;
    amount: number;
    currency: string;
    material: string;
    description: string;
    quantity: number;
    unit: string;
    status: string;
}


export interface Invoice {
    invoiceNumber: string;
    itemNumber: string;
}

export interface ApiResponse {
    success: boolean;
    data: Invoice[];
    error?: string;
    sapFault?: string;
}
