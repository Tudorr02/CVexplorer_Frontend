import { Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from './_services/user.service';
import { Toast } from 'primeng/toast';
@Component({
  selector: 'app-root',
  imports: [Toast,CommonModule,RouterOutlet, NavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: []
  
})
export class AppComponent  {
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
    return this.router.url.includes('/dashboard'); 
  }
}
