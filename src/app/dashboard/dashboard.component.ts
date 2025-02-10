import { Component , OnInit , inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplitterModule } from 'primeng/splitter';
import { LeftMenuComponent } from '../left-menu/left-menu.component';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, SplitterModule,LeftMenuComponent,CommonModule,TabsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  UserService = inject(UserService);
  Router = inject(Router);
  ngOnInit(): void {
    
  }
   // Define tabs
   tabs = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'pi pi-home'
    },
    {
      label: 'Settings',
      route: '/settings',
      icon: 'pi pi-cog'
    },
    {
      label: 'Profile',
      route: '/profile',
      icon: 'pi pi-user'
    },
    {
      label: 'Help',
      route: '/help',
      icon: 'pi pi-question-circle'
    }
  ];

}
