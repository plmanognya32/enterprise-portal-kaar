import { Routes } from '@angular/router';
import { EmployeeLoginComponent } from './components/login/employeelogin.component';
import { EmployeeDashboardComponent } from './components/dashboard/employeedashboard.component';
import { EmployeeProfileComponent } from './components/profile/employeeprofile.component';
import { LeaveDataComponent } from './components/leavedata/leavedata.component';
import { PaySlipComponent } from './components/payslip/payslip.component';
import { EmployeeNavbarComponent } from './components/navbar/navbar.component';

export const EMPLOYEE_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: EmployeeLoginComponent
    },
    {
        path: 'dashboard',
        component: EmployeeDashboardComponent, // This acts as the layout component
        children: [
            {
                path: '',
                redirectTo: 'profile',
                pathMatch: 'full'
            },
            {
                path: 'home',
                component: EmployeeDashboardComponent
            },
            {
                path: 'profile',
                component: EmployeeProfileComponent
            },
            {
                path: 'leave',
                component: LeaveDataComponent
            },
            {
                path: 'payslip',
                component: PaySlipComponent
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];