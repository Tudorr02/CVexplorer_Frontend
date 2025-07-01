import { Component, OnInit, inject, computed, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NotificationService } from '../../_services/notification.service';
import { AccountService } from '../../_services/account.service';
import { CommonModule } from '@angular/common';
import { NavManageUsersComponent } from '../nav-manage-users/nav-manage-users.component';
import { NavUserDetailsComponent } from '../nav-user-details/nav-user-details.component';
import { NavEnrollUserComponent } from '../nav-enroll-user/nav-enroll-user.component';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { HasRoleDirective } from '../../_directives/has-role.directive';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-nav', imports: [
    FormsModule,CommonModule,
    NavManageUsersComponent,NavUserDetailsComponent,NavEnrollUserComponent,
    ButtonModule, Dialog, 
    HasRoleDirective, RouterModule
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {

  @ViewChild(NavManageUsersComponent) manageUsersComponent!: NavManageUsersComponent; // Reference to child component
  @ViewChild(NavUserDetailsComponent) userDetailsComponent!: NavUserDetailsComponent; // Reference to child component
  @ViewChild(NavEnrollUserComponent) enrollUserComponent!: NavEnrollUserComponent; // Reference to child component


  visibleDetails: boolean = false;
  visibleEnrollUser: boolean = false;
  visibleManageUsers: boolean = false;

  Router = inject(Router);
  AccountService = inject(AccountService);
  NotificationService = inject(NotificationService);
    
  isLoginRoute: boolean = false;
  isDarkMode: boolean = true;
  buttonText: string = 'Dark Mode';
  logoPath: string = 'logos/CVexplorerDark.svg';
  iconClass: string = 'pi pi-moon';

  username = computed(() => this.AccountService.currentUser()?.username || '');
 

  ngOnInit(): void {
    this.Router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginRoute = this.Router.url === '/login';
      }
    });

    this.applyTheme(localStorage.getItem('theme') === 'dark');
  }

  toggleTheme(): void {
    this.applyTheme(!this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean): void {
    this.isDarkMode = isDark;
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark', isDark);
    element?.classList.toggle('my-app-light', !isDark);
    this.logoPath = isDark ? 'logos/CVexplorerDark.svg' : 'logos/CVexplorerLight.svg';
    this.iconClass = isDark ? 'pi pi-moon' : 'pi pi-sun';
    
  }

  isLogin(): boolean {
    return this.Router.url.includes('/login'); 
  }

  signOut(): void {
    this.AccountService.logout();
    this.Router.navigate(['/login']);
  }

  openAccountDetailsDialog(): void {
    this.userDetailsComponent.loadUserDetails();
    this.visibleDetails = true;
  }

  closeAccountDetailsDialog(): void {
    this.visibleDetails = false;
  }

  openManageUsersDialog(): void {
    this.manageUsersComponent.init();
    this.visibleManageUsers = true;
    
  }

  closeManageUsersDialog(): void {
    this.visibleManageUsers = false;
  }

  openEnrollUserDialog(): void {
    this.enrollUserComponent.init();
    this.visibleEnrollUser = true;
  }

  closeEnrollUserDialog(): void {
    this.visibleEnrollUser = false;
  }

 
}
