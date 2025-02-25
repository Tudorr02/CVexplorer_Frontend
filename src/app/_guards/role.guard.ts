import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';

export const roleGuard = (requiredRoles: string[]) => {
  return (): boolean => {
    const userService = inject(UserService);
    const router = inject(Router);
    
    const userRoles = userService.currentUser()?.roles || [];

    // Check if user has at least one required role
    if (!requiredRoles.some(role => userRoles.includes(role))) {
      router.navigate(['/dashboard']); //Redirect unauthorized users
      return false;
    }

    return true;
  };
};
