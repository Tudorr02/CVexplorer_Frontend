import { Component, inject , computed} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './navbar/nav/nav.component'; // Ensure this path is correct and the file exists
import { Toast } from 'primeng/toast';
import { SplitterModule } from 'primeng/splitter';
import { DepartmentsTreeComponent } from './departments-menu/departments-tree/departments-tree.component';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from './_services/account.service';
import { HasRoleDirective } from './_directives/has-role.directive';
@Component({
  selector: 'app-root',
  imports: [Toast,RouterOutlet, NavComponent,RouterModule,
    HasRoleDirective, SplitterModule,DepartmentsTreeComponent,CommonModule,TabsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: []
  
})
export class AppComponent  {


  AccountService = inject(AccountService);
  Router = inject(Router);

  title(title: any) {
    throw new Error('Method not implemented.');
  }

  private userService = inject(AccountService);

  constructor(private router: Router) {
    if (this.userService.isTokenExpired()) {
      this.userService.logout(); 
    }

  }

  isUserAdmin(): boolean {
    return (this.AccountService.currentUser()?.role === 'Admin' || this.AccountService.currentUser()?.role === 'Moderator' ? true : false);
  }

  isDashboard(): boolean {
    return !this.router.url.includes('/login'); 
  }

  isUserLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  private userTabs = [
    { label: 'Dashboard', route: '/dashboard', icon: 'pi pi-home' },
    { label: 'Settings', route: '/settings', icon: 'pi pi-cog' },
    { label: 'Profile', route: '/profile', icon: 'pi pi-user' },
    { label: 'Help', route: '/help', icon: 'pi pi-question-circle' }
  ];

  private adminTabs = [
    { label: 'Manage Users', route: 'admin/manage-users', icon: 'pi pi-users' },
    { label: 'Manage Companies', route: 'admin/manage-companies', icon: 'pi pi-building' },
    { label: 'Enroll User', route: 'admin/enroll-user', icon: 'pi pi-user-plus' },
    { label: 'Logs', route: '/logs', icon: 'pi pi-file' }
  ];


  // ✅ Compute tabs dynamically based on user role
  tabs = computed(() => {
    return (this.AccountService.currentUser()?.role === 'Admin' || this.AccountService.currentUser()?.role === 'Moderator' ) ? this.adminTabs : this.userTabs;
  });
}
