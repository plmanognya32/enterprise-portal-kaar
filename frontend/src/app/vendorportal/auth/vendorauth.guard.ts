import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { VendorLoginService } from '../services/vendorlogin.service';
import { inject } from '@angular/core';

export const VendorAuthGuard: CanActivateFn = () => {
    const loginService = inject(VendorLoginService);
    const router = inject(Router);

    if (loginService.isLoggedIn()) {
        return true;
    }
    return router.createUrlTree(['/customer/login']);
};