import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { CUSTOMER_ROUTES } from './customer.routes';
import { LoginComponent } from './components/login/login.component';
import { CustomerDashboardComponent } from './components/dashboard/customerdashboard.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forChild(CUSTOMER_ROUTES),
        LoginComponent,
        CustomerDashboardComponent
    ]
})
export class CustomerPortalModule { }