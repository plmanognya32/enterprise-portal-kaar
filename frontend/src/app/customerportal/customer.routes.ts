// src/app/customerportal/customer.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { CustomerDashboardComponent } from './components/dashboard/customerdashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { MemosComponent } from './components/memos/memos.component';
import { SalesComponent } from './components/sales/sales.component';

export const CUSTOMER_ROUTES: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        canActivateChild: [authGuard],
        children: [
            { path: 'dashboard', component: CustomerDashboardComponent },
            { path: 'profile', component: ProfileComponent },
            {
                path: 'financial-sheet',
                children: [
                    { path: 'invoices', component: InvoicesComponent },
                    { path: 'payments', component: PaymentsComponent },
                    { path: 'memos', component: MemosComponent },
                    { path: 'sales', component: SalesComponent },
                    { path: '', redirectTo: 'invoices', pathMatch: 'full' }
                ]
            }
        ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];