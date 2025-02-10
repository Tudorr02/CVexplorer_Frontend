import { CanActivateFn } from '@angular/router';
import { UserService } from '../_services/user.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
export const authGuard: CanActivateFn = (route, state) => {
  
  const userService = inject(UserService);
  const router = inject(Router);
  
  if (!userService.isLoggedIn()) {
    router.navigate(['/login']); 
    return false;
  }

  return true;
};
