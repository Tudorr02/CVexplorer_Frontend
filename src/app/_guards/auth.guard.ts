import { CanActivateFn } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
export const authGuard: CanActivateFn = (route, state) => {
  
  const accountService = inject(AccountService);
  const router = inject(Router);
  
  if (!accountService.isLoggedIn()) {
    router.navigate(['/login']); 
    return false;
  }

  if (accountService.isTokenExpired() && accountService.isLoggedIn()) {
    accountService.logout();
    router.navigate(['/login']); 
    return false;
  }

  return true;
};
