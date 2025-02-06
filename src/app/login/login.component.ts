import { Component, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
declare var VANTA: any;
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { NavComponent } from "../nav/nav.component";
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ButtonModule,PasswordModule, InputTextModule, FormsModule],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  
  value1: string | undefined;

  @ViewChild('vantaBackground', { static: true }) vantaRef!: ElementRef;

  UserServices = inject(UserService);
  Router = inject(Router);

  model = { username: '', password: '' };


  ngAfterViewInit(): void {
    this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
      .then(() => this.loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.halo.min.js'))
      .then(() => {
        (window as any).VANTA.HALO({
          el: this.vantaRef.nativeElement,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          baseColor: 0x10B981,
          backgroundColor: 0x222222,
          amplitudeFactor: 1.20,
          xOffset: 0.25,
          yOffset: 0.00,
          size: 1.20
        });
      })
      .catch(error => console.error('Error loading Vanta:', error));
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script ${src}`));
      document.body.appendChild(script);
    });
  }


  login() {
    if(!this.model.username || !this.model.password) {
      this.triggerButtonAnimation();
      return;
    }

    this.UserServices.login(this.model).subscribe({
      next: () => {
        console.log('Login successful');
        this.Router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.log('Login failed!');
        this.model.username = '';
        this.model.password = '';
        this.triggerButtonAnimation();
      }
    });
  
  }

  triggerButtonAnimation() {
    const button = document.querySelector('.login-button'); // Target the whole button
    const label = document.querySelector('.login-button .p-button-label'); // Target only the text
  
    if (button && label) {
      button.classList.add('shake'); // Apply shake to the button
      label.classList.add('text-red'); // Change text color
  
      setTimeout(() => {
        button.classList.remove('shake'); // Remove shake after animation
        label.classList.remove('text-red'); // Reset text color
      }, 500);
    }
  }
}