import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { VENDOR_ROUTES } from './vendor.routes';
import { VendorDashboardComponent } from './components/dashboard/vendordashboard.component';
import { VendorLoginComponent } from './components/login/vendorlogin.component';
import { VendorProfileComponent } from './components/profile/vendorprofile.component';
import { VendorInvoicesComponent } from './components/invoices/vendorinvoices.component';
import { VendorPaymentsComponent } from './components/payments/vendorpayments.component';
import { VendorCreditDebitComponent } from './components/memos/vendormemos.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        RouterModule.forChild(VENDOR_ROUTES),
        // Import standalone components
        VendorDashboardComponent,
        VendorLoginComponent,
        VendorProfileComponent,
        VendorInvoicesComponent,
        VendorPaymentsComponent,
        VendorCreditDebitComponent
    ]
})
export class VendorModule { }