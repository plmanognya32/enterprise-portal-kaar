import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
    const loginService = inject(LoginService);
    const router = inject(Router);

    if (loginService.isLoggedIn()) {
        return true;
    }
    return router.createUrlTree(['/customer/login']);
};