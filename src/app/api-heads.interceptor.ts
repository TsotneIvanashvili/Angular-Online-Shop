import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SsrCookieService } from 'ngx-cookie-service-ssr';

export const apiHeadsInterceptor: HttpInterceptorFn = (req, next) => {
  const cookie = inject(SsrCookieService)
  const token = cookie.get("user")

  const auth = req.clone({
    headers: req.headers.set("Authorization", `Bearer ${token}`)
  })
  return next(auth);
};
