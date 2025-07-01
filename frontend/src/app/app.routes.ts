import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    {
        path: 'customer',
        loadChildren: () => import('./customerportal/customer.routes').then(m => m.CUSTOMER_ROUTES)
    },
    {
        path: 'vendor',
        loadChildren: () => import('./vendorportal/vendor.routes').then(m => m.VENDOR_ROUTES)
    },
    {
        path: 'employee',
        loadChildren: () => import('./employeeportal/employee.routes').then(m => m.EMPLOYEE_ROUTES)
    },

    { path: '**', redirectTo: 'dashboard' }
];   