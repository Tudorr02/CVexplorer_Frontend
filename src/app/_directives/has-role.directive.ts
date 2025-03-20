import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AccountService } from '../_services/account.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private accountService = inject(AccountService);

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

  @Input() set appHasRole(allowedRoles: string[]) {
    const userRole = this.accountService.currentUser()?.role || '';

    //  Check if user has any of the allowed roles
    if (allowedRoles.some(role => userRole === role)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
