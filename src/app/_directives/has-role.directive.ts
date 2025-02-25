import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { UserService } from '../_services/user.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private userService = inject(UserService);

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

  @Input() set appHasRole(allowedRoles: string[]) {
    const userRoles = this.userService.currentUser()?.roles || [];

    //  Check if user has any of the allowed roles
    if (allowedRoles.some(role => userRoles.includes(role))) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
