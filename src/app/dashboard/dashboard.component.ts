import { Component , OnInit , inject , computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplitterModule } from 'primeng/splitter';
import { LeftMenuComponent } from '../left-menu/left-menu.component';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../_services/user.service';
import { HasRoleDirective } from '../_directives/has-role.directive';
@Component({
  selector: 'app-dashboard',
  imports: [RouterModule,HasRoleDirective,RouterOutlet, SplitterModule,LeftMenuComponent,CommonModule,TabsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  UserService = inject(UserService);
  Router = inject(Router);
 
  ngOnInit(): void {
    
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
    return this.UserService.currentUser()?.roles.includes('Moderator') ? this.adminTabs : this.userTabs;
  });
}
