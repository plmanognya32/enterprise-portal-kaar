import { Routes } from '@angular/router';
import { VendorAuthGuard } from './auth/vendorauth.guard';
import { VendorLoginComponent } from './components/login/vendorlogin.component';
import { VendorDashboardComponent } from './components/dashboard/vendordashboard.component';
import { VendorProfileComponent } from './components/profile/vendorprofile.component';
import { VendorInvoicesComponent } from './components/invoices/vendorinvoices.component';
import { VendorPaymentsComponent } from './components/payments/vendorpayments.component';
import { VendorCreditDebitComponent } from './components/memos/vendormemos.component';

export const VENDOR_ROUTES: Routes = [
    { path: 'login', component: VendorLoginComponent },
    {
        path: '',
        canActivateChild: [VendorAuthGuard],
        children: [
            { path: 'dashboard', component: VendorDashboardComponent },
            { path: 'vendordashboard', component: VendorDashboardComponent }, // Matches the logo link
            { path: 'profile', component: VendorProfileComponent },
            {
                path: 'financial-sheet',
                children: [
                    { path: 'invoices', component: VendorInvoicesComponent },
                    { path: 'payments', component: VendorPaymentsComponent },
                    { path: 'memos', component: VendorCreditDebitComponent },
                    { path: '', redirectTo: 'invoices', pathMatch: 'full' }
                ]
            }
        ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];