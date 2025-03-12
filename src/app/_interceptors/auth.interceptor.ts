import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { catchError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(AccountService);
  const token = userService.currentUser()?.token // Retrieve the token

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(clonedRequest).pipe(
      catchError((error) => {
        if (error.status === 401) {
          userService.logout(); // Logout on 401 Unauthorized
        }
        throw error;
      })
    ); 
  }

  return next(req); // Forward the original request if no token exists
};
