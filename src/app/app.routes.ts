import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AppComponent } from './app.component';



export const routes: Routes = [

    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    {path : 'login', component: LoginComponent},
    {path : 'register', component: RegisterComponent},
    {path : 'dashboard', component: DashboardComponent},

];
