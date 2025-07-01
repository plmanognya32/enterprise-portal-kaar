import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Add auth header only for SAP proxy requests
    if (req.url.includes('/api/sap-login')) {
        const authReq = req.clone({
            headers: req.headers.set(
                'Authorization',
                'Basic ' + btoa('K901501:Welcome@123')
            )
        });
        return next(authReq);
    }
    return next(req);
};