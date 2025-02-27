import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isLoggedIn()) {
    router.navigate(['/dashboard']); // Redirect to dashboard if already logged in
    return false;
  }

  return true;
};