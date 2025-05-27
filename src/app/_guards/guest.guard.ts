import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  if (accountService.isLoggedIn()) {
    accountService.isAdmin() ?
      router.navigate(['/admin/manage-users']) : // Redirect to admin if user is admin
    router.navigate(['/dashboard']); // Redirect to dashboard 
    return false;
  }

  return true;
};