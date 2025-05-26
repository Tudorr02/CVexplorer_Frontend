import { Component, inject , computed, signal} from '@angular/core';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { NavComponent } from './navbar/nav/nav.component'; // Ensure this path is correct and the file exists
import { Toast } from 'primeng/toast';
import { SplitterModule } from 'primeng/splitter';
import { DepartmentsTreeComponent } from './departments-menu/departments-tree/departments-tree.component';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from './_services/account.service';
import { HasRoleDirective } from './_directives/has-role.directive';
import { NodeSelectionService } from './_services/node-selection.service';
import { filter } from 'rxjs';
import { Tab } from './_models/tab';

@Component({
  selector: 'app-root',
  imports: [Toast,RouterOutlet, NavComponent,RouterModule,
    HasRoleDirective, SplitterModule,DepartmentsTreeComponent,CommonModule,TabsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: []
  
})
export class AppComponent  {

  currentTab = signal<string>('/dashboard'); // Default value
  AccountService = inject(AccountService);
  Router = inject(Router);
  NodeSelectionService = inject(NodeSelectionService);
  private userService = inject(AccountService);

  constructor(private router: Router) {
    if (this.userService.isTokenExpired()) {
      this.userService.logout(); 

      this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('📍 Current route:', event.urlAfterRedirects);
      });
  
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

  
  private userTabs : Tab[]= [
    { label: 'Dashboard', route: '/dashboard', icon: 'pi pi-home' },
    { label: 'Upload', route: '/cv-upload', icon: 'pi pi-file-arrow-up',disabled: true },
    { label: 'Explore', route: 'explore', icon: 'pi pi-globe',disabled: true },
    { label: 'Evaluate', route: '/evaluation-rounds', icon: 'pi pi-search',disabled: true },
    
  ];

  private adminTabs:Tab[]= [
    { label: 'Manage Users', route: 'admin/manage-users', icon: 'pi pi-users' },
    { label: 'Manage Companies', route: 'admin/manage-companies', icon: 'pi pi-building' },
    { label: 'Enroll User', route: 'admin/enroll-user', icon: 'pi pi-user-plus' },
    { label: 'Logs', route: '/logs', icon: 'pi pi-file' }
  ];

  isAdmin(): boolean {
    const user = this.AccountService.currentUser();
    return user?.role === 'Admin' || user?.role === 'Moderator';
  }
  
  tabs = computed<Tab[]>(() => {
    
    const isAdmin = this.isAdmin();

    if (isAdmin) return this.adminTabs;

    const selectedNode = this.NodeSelectionService.getSelectedNode(); // ← signal() version preferred
    const publicId = selectedNode?.data?.publicId;
    const departmentId = selectedNode?.data?.type==="department"? selectedNode?.data?.id : null; // Get departmentId from selected node
    
    return this.userTabs.map(tab => {
      if (tab.label === 'Upload' && publicId) {
        return { ...tab, route: `/positions/${publicId}`+tab.route, disabled: false };
      } else if (tab.label === 'Explore') {

        if (departmentId) {
          return { ...tab, queryParams:{ departmentId}, disabled: false };
        }else
        if (publicId) {
          return { ...tab, queryParams: { positionPublicId: publicId } , disabled: false };
        }
        
      } else if (tab.label === 'Evaluate') {

        if (departmentId) {
          return { ...tab, queryParams:{ departmentId}, disabled: false };
        }else
        if (publicId) {
          return { ...tab, queryParams: { positionPublicId: publicId } , disabled: false };
        }
        
      } 

      return tab;
     })
    
  });
    

}
