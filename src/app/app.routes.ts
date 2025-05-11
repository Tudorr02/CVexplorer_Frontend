import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AppComponent } from './app.component';
import { authGuard } from './_guards/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { roleGuard } from './_guards/role.guard';
import { ManageUsersComponent } from './admin/manage-users/manage-users.component';
import { EnrollUserComponent } from './admin/enroll-user/enroll-user.component';
import { guestGuard } from './_guards/guest.guard';
import { ManageCompaniesComponent } from './admin/manage-companies/manage-companies.component';
import { CreatePositionComponent } from './departments-menu/create-position/create-position.component';
import { EditPositionComponent } from './departments-menu/edit-position/edit-position.component';
import { UploadCvComponent } from './upload-cv/upload-cv.component';
import { tabGuard } from './_guards/tab.guard';
import { ExploreCvComponent } from './explore-cv/explore-cv.component';
import { RoundsListComponent } from './rounds/rounds-list/rounds-list.component';
import { Round } from './_models/round';
import { RoundEntryListComponent } from './rounds/round-entry-list/round-entry-list.component';
import { OAuthCallbackComponent } from './oauth-callback/oauth-callback.component';
export const routes: Routes = [

    {path : 'login', component: LoginComponent, canActivate : [guestGuard]},
    {
        path : 'admin',
        canActivate: [authGuard, roleGuard(['Admin', 'Moderator'])],
        children: [
            { path: 'manage-users', component: ManageUsersComponent },
            { path: 'enroll-user', component: EnrollUserComponent },
            { path: 'manage-companies', component: ManageCompaniesComponent }
        ]

    },
    {path : 'dashboard', component: DashboardComponent, canActivate: [authGuard]},

    // { path: 'departments/:id', component: DashboardComponent, canActivate: [authGuard] },
    // { path: 'positions/:publicId', component: DashboardComponent, canActivate: [authGuard] },
    // { path: 'positions/:publicId/edit', component: EditPositionComponent, canActivate: [authGuard] },
    // { path: 'positions/:publicId/cv-upload', component: UploadCvComponent, canActivate: [authGuard,tabGuard] },
    //{ path: 'departments/:departmentId/create-position', component: CreatePositionComponent , canActivate: [authGuard, roleGuard(['HRUser', 'HRLeader'])]},
    

    { path: 'departments/:id',
        canActivate: [authGuard],
        children: [
            { path: 'create-position', 
                component: CreatePositionComponent , 
                canActivate: [ authGuard, roleGuard(['HRUser', 'HRLeader'])]
            },
            // {
            //     path: 'cv-explore',
            //     component: ExploreCvComponent,
            //     canActivate: [authGuard]
            // }
        ]
    },

    {
        path: 'explore',
        component: ExploreCvComponent,
        canActivate: [authGuard, roleGuard(['HRUser', 'HRLeader'])]
    },

    {
        path: 'evaluation-rounds',
        component: RoundsListComponent,
        canActivate: [authGuard, roleGuard(['HRUser', 'HRLeader'])],
    },
    {
        path: 'evaluation-rounds/:publicId',
        component:RoundEntryListComponent,
        canActivate: [authGuard, roleGuard(['HRUser', 'HRLeader'])]
    },
    {
        path: 'positions/:publicId',
        canActivate: [authGuard],
        children: [
          { path: 'edit',component: EditPositionComponent },
          {
            path: 'cv-upload',
            component: UploadCvComponent,
            canActivate: [authGuard, tabGuard]
          },
        //   {
        //     path: 'cv-explore',
        //     component: ExploreCvComponent,
        //     canActivate: [authGuard]
        //   }
        ]
    },
    { path: 'oauth-callback', component: OAuthCallbackComponent },


    { path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    { path: 'not-found', component: NotFoundComponent }, // ✅ Define a separate route for the 404 page
    { path: '**',redirectTo:'/not-found', pathMatch: 'full' } //  Catch-all route for 404 pages

];
