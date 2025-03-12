import { Component , OnInit , inject , computed } from '@angular/core';

import { SplitterModule } from 'primeng/splitter';

import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, SplitterModule,CommonModule,TabsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  AccountService = inject(AccountService);
  Router = inject(Router);
 
  ngOnInit(): void {
    
  }
}
