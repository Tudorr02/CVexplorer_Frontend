import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';

export const roleGuard = (requiredRoles: string[]) => {
  return (): boolean => {
    const accountService = inject(AccountService);
    const router = inject(Router);
    
    const userRoles = accountService.currentUser()?.roles || [];

    // Check if user has at least one required role
    if (!requiredRoles.some(role => userRoles.includes(role))) {
      router.navigate(['/dashboard']); //Redirect unauthorized users
      return false;
    }

    return true;
  };
};
