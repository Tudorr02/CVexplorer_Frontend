import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AppComponent } from './app.component';
import { authGuard } from './_guards/auth.guard';


export const routes: Routes = [

    {path : 'login', component: LoginComponent},
    {path : 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
];
