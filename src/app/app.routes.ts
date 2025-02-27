import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AppComponent } from './app.component';
import { authGuard } from './_guards/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { roleGuard } from './_guards/role.guard';
import { ManageUsersComponent } from './admin/manage-users/manage-users.component';
import { guestGuard } from './_guards/guest.guard';
export const routes: Routes = [

    {path : 'login', component: LoginComponent, canActivate : [guestGuard]},
    {path : 'dashboard', component: DashboardComponent, canActivate: [authGuard]},

    {path: 'manage-users', component: ManageUsersComponent,canActivate: [authGuard,roleGuard(['Admin', 'Moderator'])]},
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    { path: 'not-found', component: NotFoundComponent }, // ✅ Define a separate route for the 404 page
    {path: '**',redirectTo:'/not-found', pathMatch: 'full' } //  Catch-all route for 404 pages

];
