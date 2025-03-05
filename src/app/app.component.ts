import { Component, inject , computed} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { Toast } from 'primeng/toast';
import { SplitterModule } from 'primeng/splitter';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { Router, RouterModule } from '@angular/router';
import { UserService } from './_services/user.service';
import { HasRoleDirective } from './_directives/has-role.directive';
@Component({
  selector: 'app-root',
  imports: [Toast,RouterOutlet, NavComponent,RouterModule,
    HasRoleDirective, SplitterModule,LeftMenuComponent,CommonModule,TabsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: []
  
})
export class AppComponent  {


  UserService = inject(UserService);
  Router = inject(Router);

  title(title: any) {
    throw new Error('Method not implemented.');
  }

  private userService = inject(UserService);

  constructor(private router: Router) {
    if (this.userService.isTokenExpired()) {
      this.userService.logout(); 
    }
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
    { label: 'Manage Users', route: '/manage-users', icon: 'pi pi-users' },
    { label: 'Manage Companies', route: '/settings', icon: 'pi pi-building' },
    { label: 'Logs', route: '/logs', icon: 'pi pi-file' }
  ];


  // ✅ Compute tabs dynamically based on user role
  tabs = computed(() => {
    return (this.UserService.currentUser()?.roles.includes('Admin') || this.UserService.currentUser()?.roles.includes('Moderator') ) ? this.adminTabs : this.userTabs;
  });
}
